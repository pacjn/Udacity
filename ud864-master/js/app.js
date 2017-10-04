var map;
var markers = [];
var placeMarkers = [];
var infowindowOpen = [];
var directionsDisplayed = [];
var locations = [{
        title: 'Park Ave Penthouse',
        location: {
            lat: 40.7713024,
            lng: -73.9632393
        }
    },
    {
        title: 'Chelsea Loft',
        location: {
            lat: 40.7444883,
            lng: -73.9949465
        }
    },
    {
        title: 'Union Square Open Floor Plan',
        location: {
            lat: 40.7347062,
            lng: -73.9895759
        }
    },
    {
        title: 'East Village Hip Studio',
        location: {
            lat: 40.7281777,
            lng: -73.984377
        }
    },
    {
        title: 'TriBeCa Artsy Bachelor Pad',
        location: {
            lat: 40.7195264,
            lng: -74.0089934
        }
    }
];
locList = ko.observableArray([]);

function initMap() {
    //a style from https://snazzymaps.com/
    var styles = [{
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#6195a0"
            }]
        },
        {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                    "lightness": "0"
                },
                {
                    "saturation": "0"
                },
                {
                    "color": "#f5f5f2"
                },
                {
                    "gamma": "1"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "all",
            "stylers": [{
                    "lightness": "-3"
                },
                {
                    "gamma": "1.00"
                }
            ]
        },
        {
            "featureType": "landscape.natural.terrain",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [{
                    "color": "#bae5ce"
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                    "saturation": -100
                },
                {
                    "lightness": 45
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{
                    "color": "#fac9a9"
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text",
            "stylers": [{
                "color": "#4e4e4e"
            }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#787878"
            }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        },
        {
            "featureType": "transit.station.airport",
            "elementType": "labels.icon",
            "stylers": [{
                    "hue": "#0a00ff"
                },
                {
                    "saturation": "-77"
                },
                {
                    "gamma": "0.57"
                },
                {
                    "lightness": "0"
                }
            ]
        },
        {
            "featureType": "transit.station.rail",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#43321e"
            }]
        },
        {
            "featureType": "transit.station.rail",
            "elementType": "labels.icon",
            "stylers": [{
                    "hue": "#ff6c00"
                },
                {
                    "lightness": "4"
                },
                {
                    "gamma": "0.75"
                },
                {
                    "saturation": "-68"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                    "color": "#eaf6f8"
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#c7eced"
            }]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{
                    "lightness": "-49"
                },
                {
                    "saturation": "-53"
                },
                {
                    "gamma": "0.79"
                }
            ]
        }
    ];
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413549,
            lng: -73.9980244
        },
        zoom: 13,
        styles: styles,
        mapTypeControl: false
    });

    // This autocomplete is for use in the geocoder entry box.
    var timeAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('search-within-time-text'));
    // This autocomplete is for use in the geocoder entry box.
    var addAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('add-new-area-text'));
    // Bias the boundaries within the map for the zoom to area text.
    addAutocomplete.bindTo('bounds', map);
    // Create a searchbox in order to execute a places search
    var searchBox = new google.maps.places.SearchBox(
        document.getElementById('places-search'));
    // Bias the searchbox to within the bounds of the map.
    searchBox.setBounds(map.getBounds());

    // These are used to change the icon for markers
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');

    var Loc = function (data) {
        this.title = ko.observable(data.title);
        this.location = ko.observable(data.location);
    };

    var ViewModel = function () {
        var self = this;
        locations.forEach(function (Item) {
            locList.push(new Loc(Item));
        });
        this.currentLoc = ko.observable(locList()[0]);
        wikisearch(locList()[0].title());
        var largeInfowindow = new google.maps.InfoWindow();
        locations.forEach(function (Item) {
            var position = Item.location;
            var title = Item.title;
            var marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                icon: defaultIcon
            });
            marker.addListener('click', function () {
                populateInfoWindow(this, largeInfowindow);
            });
            marker.addListener('mouseover', function () {
                this.setIcon(highlightedIcon);
            });
            marker.addListener('mouseout', function () {
                this.setIcon(defaultIcon);
            });
            markers.push(marker);
        });

        //search and add a new favorite area,and then zoom it, display the streetpic for it, search it in wikipedia
        this.addLoc = function () {
            var new_loc = {};
            var geocoder = new google.maps.Geocoder();
            var address = document.getElementById('add-new-area-text').value;
            if (address == '') {
                window.alert('You must enter an area, or address.');
            } else {
                geocoder.geocode({
                    address: address,
                    componentRestrictions: {
                        locality: 'New York'
                    }
                }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        new_loc.title = address;
                        new_loc.location = results[0].geometry.location;
                        add_new_loc(new_loc);
                    } else {
                        window.alert('We could not find that location - try entering a more' +
                            ' specific place.');
                    }
                });
            }

            function add_new_loc(new_loc) {
                if (locList().length >= 6) {
                    alter('The maximum number of favorite areas is 6.');
                }
                var flag = true;
                for (let i = 0; i < locList().length; i++) {
                    if (locList()[i].title() === new_loc.title) {
                        flag = false;
                        break;
                    }
                }
                if (!isEmptyObject(new_loc) && flag) {
                    locList.push(new Loc(new_loc));
                    var position = new_loc.location;
                    var title = new_loc.title;
                    var marker = new google.maps.Marker({
                        position: position,
                        title: title,
                        animation: google.maps.Animation.DROP,
                        icon: defaultIcon
                    });
                    marker.addListener('click', function () {
                        populateInfoWindow(this, largeInfowindow);
                    });
                    marker.addListener('mouseover', function () {
                        this.setIcon(highlightedIcon);
                    });
                    marker.addListener('mouseout', function () {
                        this.setIcon(defaultIcon);
                    });
                    markers.push(marker);
                    populateInfoWindow(marker, largeInfowindow);
                    marker.setMap(map);
                    map.setCenter(new_loc.location);
                    map.setZoom(15);
                    self.currentLoc(locList()[locList().length - 1]);
                    wikisearch(new_loc.title);
                }
            }
        };
        //when click an area, zoom it, display the streetpic for it, search it in wikipedia
        this.setLoc = function (clickLoc) {
            closeinfowindow(infowindowOpen);
            self.currentLoc(clickLoc);
            for (let i = 0; i < markers.length; i++) {
                if (markers[i].title == clickLoc.title()) {
                    populateInfoWindow(markers[i], largeInfowindow);
                    markers[i].setMap(map);
                } else {
                    markers[i].setMap(null);
                }
            }
            map.setCenter(clickLoc.location());
            map.setZoom(15);
            document.getElementById('Wiki').style.display = "block";
            wikisearch(clickLoc.title());
        };

        //a function used to wiki a place
        function wikisearch(title) {
            var $wikiElem = $('#wikipedia-links');
            $wikiElem.text("");
            var target = title;
            var po = title.indexOf(',');
            if (po != -1) {
                target = title.substring(0, po);
            }
            var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + target + '&format=json&callback=wikiCallback';
            var wikiRequestTimeout = setTimeout(function () {
                $wikiElem.text("failed to get wikipedia resources");
            }, 8000);
            $.ajax({
                url: wikiUrl,
                dataType: "jsonp",
                success: function (response) {
                    var articleList = response[1];
                    if (articleList == undefined || articleList.length == 0) {
                        $wikiElem.text("There is nothing about " + target + " in Wikipedia.");
                        clearTimeout(wikiRequestTimeout);
                        return;
                    }
                    for (var i = 0; i < Math.min(articleList.length, 5); i++) {
                        var articleStr = articleList[i];
                        var url = 'https://en.wikipedia.org/wiki/' + articleStr;
                        $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
                    };
                    clearTimeout(wikiRequestTimeout);
                }
            })
        }
        //delete a favorite area
        this.delLoc = function (clickLoc) {
            var chosedTitle_textContent = document.getElementById('chosedTitle');
            for (let i = 0; i < markers.length; i++) {
                if (markers[i].title === chosedTitle_textContent.textContent) {
                    markers[i].setMap(null);
                    markers.splice(i, 1);
                    locList.splice(i, 1);
                    document.getElementById('Wiki').style.display = "none";
                    break;
                }
            }
        }
    };
    ko.applyBindings(new ViewModel());

    document.getElementById('show-listings').addEventListener('click', showListings);
    document.getElementById('hide-listings').addEventListener('click', hideListings);
    document.getElementById('go-places').addEventListener('click', textSearchPlaces);
    document.getElementById('search-within-time').addEventListener('click', function () {
        searchWithinTime();
    });
}

//show a infowindow for a marker
function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.setContent('');
        infowindow.marker = marker;
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div><div>No street View Found</div>');
            }
        }
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infowindow.open(map, marker);
        infowindowOpen.push(infowindow);
    } else {
        infowindow.open(map, marker);
    }
}
//show markers for favorite areas
function showListings() {
    var bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}
//clear the labels in the map except the route 
function hideListings() {
    closeinfowindow(infowindowOpen);
    hideMarkers(markers);
    hideplaceMarkers(placeMarkers);
}

function hideMarkers(markers) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

function hideplaceMarkers(placeMarkers) {
    for (let i = 0; i < placeMarkers.length; i++) {
        placeMarkers[i].setMap(null);
    }
}

function closeinfowindow(infowindowOpen) {
    if (!isEmptyObject(infowindowOpen)) {
        for (let i = 0; i < infowindowOpen.length; i++) {
            infowindowOpen[i].close();
        }
    }
}

function cleardirectionsDisplay(directionsDisplayed) {
    for (let i = 0; i < directionsDisplayed.length; i++) {
        directionsDisplayed[i].setMap(null);
    }
}

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}
//search the nearby places
function textSearchPlaces() {
    var bounds = map.getBounds();
    hideMarkers(placeMarkers);
    var placesService = new google.maps.places.PlacesService(map);
    placesService.textSearch({
        query: document.getElementById('places-search').value,
        bounds: bounds
    }, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            createMarkersForPlaces(results);
        }
    });
}

// This function creates markers for each place found in either places search.
function createMarkersForPlaces(places) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < places.length; i++) {
        var place = places[i];
        var icon = {
            url: place.icon,
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 34),
            scaledSize: new google.maps.Size(25, 25)
        };
        // Create a marker for each place.
        var marker = new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location,
            id: place.place_id
        });
        // Create a single infowindow to be used with the place details information
        // so that only one is open at once.
        var placeInfoWindow = new google.maps.InfoWindow();
        // If a marker is clicked, do a place details search on it in the next function.
        marker.addListener('click', function () {
            if (placeInfoWindow.marker == this) {
                console.log("This infowindow already is on this marker!");
            } else {
                getPlacesDetails(this, placeInfoWindow);
            }
        });
        placeMarkers.push(marker);
        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }
    }
    map.fitBounds(bounds);
}

// This is the PLACE DETAILS search - it's the most detailed so it's only
// executed when a marker is selected, indicating the user wants more
// details about that place.
function getPlacesDetails(marker, infowindow) {
    var service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: marker.id
    }, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Set the marker property on this infowindow so it isn't created again.
            infowindow.marker = marker;
            var innerHTML = '<div>';
            if (place.name) {
                innerHTML += '<strong>' + place.name + '</strong>';
            }
            if (place.formatted_address) {
                innerHTML += '<br>' + place.formatted_address;
            }
            if (place.formatted_phone_number) {
                innerHTML += '<br>' + place.formatted_phone_number;
            }
            if (place.opening_hours) {
                innerHTML += '<br><br><strong>Hours:</strong><br>' +
                    place.opening_hours.weekday_text[0] + '<br>' +
                    place.opening_hours.weekday_text[1] + '<br>' +
                    place.opening_hours.weekday_text[2] + '<br>' +
                    place.opening_hours.weekday_text[3] + '<br>' +
                    place.opening_hours.weekday_text[4] + '<br>' +
                    place.opening_hours.weekday_text[5] + '<br>' +
                    place.opening_hours.weekday_text[6];
            }
            if (place.photos) {
                innerHTML += '<br><br><img src="' + place.photos[0].getUrl({
                    maxHeight: 100,
                    maxWidth: 200
                }) + '">';
            }
            innerHTML += '</div>';
            infowindow.setContent(innerHTML);
            infowindow.open(map, marker);
            infowindowOpen.push(infowindow);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    });
}
// This function allows the user to input a desired travel time, in
// minutes, and a travel mode, and a location - and only show the listings
// that are within that travel time (via that travel mode) of the location
function searchWithinTime() {
    // Initialize the distance matrix service.
    closeinfowindow(infowindowOpen);
    cleardirectionsDisplay(directionsDisplayed);
    var distanceMatrixService = new google.maps.DistanceMatrixService;
    var address = document.getElementById('search-within-time-text').value;
    // Check to make sure the place entered isn't blank.
    if (address == '') {
        window.alert('You must enter an address.');
    } else {
        hideMarkers(markers);
        // Use the distance matrix service to calculate the duration of the
        // routes between all our markers, and the destination address entered
        // by the user. Then put all the origins into an origin matrix.
        var origins = [];
        for (var i = 0; i < markers.length; i++) {
            origins[i] = markers[i].position;
        }
        var destination = address;
        var mode = document.getElementById('mode').value;
        // Now that both the origins and destination are defined, get all the
        // info for the distances between them.
        distanceMatrixService.getDistanceMatrix({
            origins: origins,
            destinations: [destination],
            travelMode: google.maps.TravelMode[mode],
            unitSystem: google.maps.UnitSystem.IMPERIAL,
        }, function (response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                window.alert('Error was: ' + status);
            } else {
                displayMarkersWithinTime(response);
            }
        });
    }
}

// This function will go through each of the results, and,
// if the distance is LESS than the value in the picker, show it on the map.
function displayMarkersWithinTime(response) {
    var maxDuration = document.getElementById('max-duration').value;
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;
    // Parse through the results, and get the distance and duration of each.
    // Because there might be  multiple origins and destinations we have a nested loop
    // Then, make sure at least 1 result was found.
    var atLeastOne = false;
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < origins.length; i++) {
        var results = response.rows[i].elements;
        for (var j = 0; j < results.length; j++) {
            var element = results[j];
            if (element.status === "OK") {
                var distanceText = element.distance.text;
                var duration = element.duration.value / 60;
                var durationText = element.duration.text;
                if (duration <= maxDuration) {
                    markers[i].setMap(map);
                    bounds.extend(markers[i].position);
                    atLeastOne = true;
                    // Create a mini infowindow to open immediately and contain the
                    // distance and duration
                    var infowindow = new google.maps.InfoWindow({
                        content: durationText + ' away, ' + distanceText +
                            '<div><input type=\"button\" value=\"View Route\" onclick =' +
                            '\"displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
                    });
                    infowindow.open(map, markers[i]);
                    infowindowOpen.push(infowindow);
                    // Put this in so that this small window closes if the user clicks
                    // the marker, when the big infowindow opens
                    markers[i].infowindow = infowindow;
                    google.maps.event.addListener(markers[i], 'click', function () {
                        this.infowindow.close();
                    });
                }
            }
        }
    }
    map.fitBounds(bounds);
    if (!atLeastOne) {
        window.alert('We could not find any locations within that distance!');
    }
}

// This function is in response to the user selecting "show route" on one
// of the markers within the calculated distance. This will display the route
// on the map.
function displayDirections(origin) {
    hideMarkers(markers);
    cleardirectionsDisplay(directionsDisplayed);
    var directionsService = new google.maps.DirectionsService;
    // Get the destination address from the user entered value.
    var destinationAddress =
        document.getElementById('search-within-time-text').value;
    // Get mode again from the user entered value.
    var mode = document.getElementById('mode').value;
    directionsService.route({
        // The origin is the passed in marker's position.
        origin: origin,
        // The destination is user entered address.
        destination: destinationAddress,
        travelMode: google.maps.TravelMode[mode]
    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            var directionsDisplay = new google.maps.DirectionsRenderer({
                map: map,
                directions: response,
                draggable: true,
                polylineOptions: {
                    strokeColor: 'green'
                }
            });
            directionsDisplayed.push(directionsDisplay);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function isEmptyObject(e) {
    var t;
    for (t in e)
        return !1;
    return !0
}