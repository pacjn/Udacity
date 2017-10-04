var initialCats =[
    {
        clickCount:0,
        name:'Tabby',
        imgSrc:'img/434164568_fea0ad4013_z.jpg',
        imgAttribution:'',
        nicknames:['T-bone', 'Mr.T', 'Taba']
    },
    {
        clickCount:0,
        name:'Tiger',
        imgSrc:'img/4154543904_6e2428c421_z.jpg',
        imgAttribution:'',
        nicknames:['Tabtab']
    }
]
var Cat = function (data) {
    this.clickCount = ko.observable(data.clickCount);
    this.name = ko.observable(data.name);
    this.imgSrc = ko.observable(data.imgSrc);
    this.imgAttribution = ko.observable(data.imgAttribution);
    this.nicknames = ko.observableArray(data.nicknames);
    this.title =ko.computed(function(){
        var title;
        var click = this.clickCount();
        if (click<10){
            title='Newborn';
        }else{
            title='Teen';
        }
        return title;
    },this);
}
var ViewModel = function(){
    var self =this;
    this.catList = ko.observableArray([]);
    initialCats.forEach(function(catItem){
        self.catList.push(new Cat(catItem));
    });
    this.currentCat = ko.observable(this.catList()[0]);
    this.incrementCounter = function(){
        this.clickCount(this.clickCount()+1);
    };
    this.setCat =function(clickCat){
        self.currentCat(clickCat);
    };
}

ko.applyBindings(new ViewModel());
