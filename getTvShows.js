var links = [];
var quotes = [];
var tempUrl = [];
var infos = [];

var firstUrl = 'http://www.imdb.com/search/title?at=0&num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_infoss';
var file = 'results.csv';
var newUrl;
var x = require('casper').selectXPath;
var fs = require('fs'); 

var casper = require('casper').create({
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
  }
});

//Fonctions------------------------

function getLinks() {
    var links = document.querySelectorAll('.results td.image a');
    return Array.prototype.map.call(links, function(e) {
    	var href = e.getAttribute('href');
    	var url = 'http://www.imdb.com'+href;
        return url;
    });
}

function getPageLink(){
	var tempUrl = document.querySelectorAll('#right .pagination a');
    return Array.prototype.map.call(tempUrl, function(e) {
    	tempUrl = e.getAttribute('href');
		  tempUrl = 'http://www.imdb.com'+tempUrl;
		  return tempUrl;
    });
}

function getQuotes(){
  // var tempQuote = document.querySelectorAll('#main .listo #quotes_content .list .quote p');
  //   return Array.prototype.map.call(tempQuote, function(e) {
  //     tempQuote = e.getAttribute('href');
  //     return tempQuote;
  //   });
  //  }
  var filter = document.querySelectorAll('#main .listo #quotes_content .list .quote'); //The page have 5 divs with the class filter
        var results = [], i;
        this.captureSelector('weather.png', '#main .listo #quotes_content .list .quote');
        for (i = 0; i < filter.length; i++) {
          // ICI !!!!!!!
          // ici je veux recuperer la valeur dp dans .quotes 
          // ainsi que la valeur du 'a' dans p 
          results.push(filter[i].getAttributeNode('p'));
        }
        return results;
}

function getLinkToQuotes(){
  var linkToQuotes = document.querySelector(x('//*[@id="maindetails_quicklinks"]/div[1]/ul/li[3]/a')); 
  return linkToQuotes.getAttribute('href');
}

//Crawl------------------------

casper.start(firstUrl);

casper.repeat(1, function() {

	casper.then(function() {
	 //    // aggregate results for the 'casperjs' search
	    links = this.evaluate(getLinks);
	    this.eachThen(links,function(response){
  			this.thenOpen(response.data, function(response) {
  				var linkToQuotes = this.evaluate(getLinkToQuotes);
          this.thenOpen()
  			     this.thenClick(x('//*[@id="maindetails_quicklinks"]/div[1]/ul/li[3]/a'),function(){
  			    	console.log("page visité");
              this.capture('images/screen.png');
              quotes = this.evaluate(getQuotes);
              fs.write('csv/results.csv', quotes,'w'); 
  			    });
  			});
		});
	});
	  
});


casper.run(function() {
    // echo results in some pretty fashion
    this.echo(links.length + ' links found:');
    this.exit();
});