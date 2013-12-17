// Before you start make sure you selected a type : movie ou serie, a gender : such as action and the amount of pages you want to parse.
var type = "movie";
var genre = "action"; // genres disponibles : animation,comedy,adventure,biography,crime,drama,western,thriller,sci_fi,mystery,music,war,sport,romance,musical,family
var nbPages = 2;

var links = [];
var quotes = [];
var PagesLinks =[];
var repeatOperation = 0;
var movieUrl = "http://www.imdb.com/search/title?genres="+genre+"&title_type=feature&sort=moviemeter,asc"; 
var serieUrl = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&title_type=tv_series";
var fs = require('fs');
var utils = require('utils');

// selected your starting url 
var startingUrl = serieUrl;
 
var casper = require('casper').create({
  clientScripts: ["jquery.js"],
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
  }
});

var headers = {
  method: 'get',
  headers: {
    'Accept-Language': 'en-US,en;q=0.8',
    'HEADER-XYZ': 'HEADER-XYZ-DATA'
  }
};
 
//Fonctions------------------------
 
//Fonction qui va :  
// - Repuerer les liens vers les pages principales des serie
// - transformation du lien pour aller directement sur la page 
// - retourne le tableaux avec les liens 
function getLinks() {
    var links = document.querySelectorAll('.results td.image a');
    return Array.prototype.map.call(links, function(e) {
      var href = e.getAttribute('href');
      var url = 'http://www.imdb.com'+href+'quotes/';
        return url;
    });
}
 
//Crawl------------------------
 
//va sur la page des series imd
casper.start();

casper.open(startingUrl, headers).then(function(response) {
    var i = 0;
  this.repeat(nbPages, function() {
    this.then(function(){
      PagesLinks[i] = this.getCurrentUrl();
      casper.echo("Page "+i+" / "+nbPages+" loaded : "+PagesLinks[i]); // debug
    }).thenClick("#right .pagination a:last-child",function changePage(){
    }); 
    i++
  });
});

casper.then(function() {
  casper.eachThen(PagesLinks, function(response) {
    this.thenOpen(response.data,headers, function(response) {
        //Charge les liens dans links
      links = this.evaluate(getLinks);

        //loop sur le tableau pour chacun des liens 
      this.eachThen(links,function(response){
            // ouverture de la page de quotes
          this.thenOpen(response.data,headers, function writeOnCSV() {
            casper.echo(this.getCurrentUrl()); // debug

            var getTitle = this.evaluate(function() {
              return $(__utils__.findOne('.parent h3 a')).text();
            })

            var getQuotes = this.evaluate(function(){
              var myQuotes = [];

              var allQuotes = __utils__.findAll('.list .quote');
              var idQuotes =  Array.prototype.map.call(allQuotes, function(e) {
                  return '#'+e.getAttribute("id")+' p';
              });

              for (var i = 0; i < allQuotes.length; i++) {
                //get all the ps in the quote
                var ps =  __utils__.findAll(idQuotes[i]);
                myQuotes[i] =  Array.prototype.map.call(ps, function(e) {
                  return $(e['outerHTML']).text().replace(/(\r\n|\n|\r)/gm,'').replace(/\[.*\]/g,'').split(":");
                 });
              };
              return myQuotes;
            });
            
            console.log(getTitle);
            //console.log(JSON.stringify(getQuotes));
            fs.write(type+'/'+genre+'/'+getTitle+'.json', JSON.stringify(getQuotes),'w');   
            console.log(getTitle+" : saved");    
        });      
      });
    });
  });
});
 
casper.run(function() {
    this.exit();
});