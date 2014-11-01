// 10000-spoons
// NaNoGenMo 2014

var fs = require('fs');
var $ = require('cheerio');
var request = require('request');
var search = require('google');

var novelText = '## 10000-spoons\n\nAll you need is a knife.\n\n';

search.resultsPerPage = 50;
search('"need a knife to"', function(err, next, links) {
  if (err) {
    throw err;
  }

  var parseLink = function(i) {
    // know when to print the ending
    if (i >= links.length) {
      console.log('add the ending');
      return theEnding();
    }

    var phraseSource = links[i].link;
    if (!phraseSource || phraseSource === 'null') {
      console.log('linkless link');
      return parseLink(i + 1);
    }
    console.log('URL: ' + phraseSource);

    request({ url: phraseSource, timeout: 2000 }, function (err, response, raw) {
      if (err) {
        // throw err;
      }

      if(!raw || !raw.length) {
        return parseLink(i + 1);
      }

      console.log('formatting body');
      raw = raw.toLowerCase().replace(/\s+/g, ' ');

      if (raw.indexOf("need a knife to") > -1) {
        console.log('found phrase');
        var body = $(raw).text();

        var sentencePrior = body.substring(0, body.indexOf("need a knife to"));
        sentencePrior = sentencePrior.substring(Math.max(sentencePrior.lastIndexOf('.'), sentencePrior.lastIndexOf('>')));

        var sentenceAfter = body.substring(body.indexOf("need a knife to")) + '.<';
        sentenceAfter = sentenceAfter.substring(0, Math.min(sentenceAfter.indexOf('.'), sentenceAfter.indexOf('<')));

        var sentence = sentencePrior + sentenceAfter + '.';
        console.log('Sentence: ' + sentence);

        novelText += sentence + "\n\n";
      }

      parseLink(i + 1); 
    });
  };

  parseLink(0);
});

function theEnding() {
  for(var s = 0; s < 10000; s++) {
    novelText += 'SPOON ';
  }

  novelText += '\n\n## The End';
  
  fs.writeFile('story.md', novelText, function(err) {
    if (err) {
      throw err;
    }

    console.log('finished!');
  });
}
