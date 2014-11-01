// 10000-spoons
// NaNoGenMo 2014

var fs = require('fs');
var $ = require('cheerio');
var request = require('request');
var search = require('google');

var novelText = '## 10000-spoons\n\nAll you need is a knife.\n\n';

search.resultsPerPage = 50;

function firstPunctuationIn(txt) {
  var punc = '.;(){}?!';
  var min = txt.length;
  txt += punc;
  for(var t=0; t < punc.length; t++) {
    min = Math.min(min, txt.indexOf(punc[t]));
  }
  return min;
}

function lastPunctuationIn(txt) {
  var punc = '.;(){}?!';
  var max = 0;
  for(var t=0; t < punc.length; t++) {
    max = Math.max(max, txt.lastIndexOf(punc[t]));
  }
  return max + 1;
}

function addPhrase(searchPhrase, callback) {
  search(searchPhrase, function(err, next, links) {
    if (err) {
      throw err;
    }

    searchPhrase = searchPhrase.replace('"', '').replace('"', '');

    var parseLink = function(i) {
      // know when to print the ending
      if (i >= links.length) {
        console.log('add the ending');
        return callback();
      }

      var phraseSource = links[i].link;
      if (!phraseSource || phraseSource === 'null' || phraseSource.indexOf('lyric') > -1) {
        console.log('linkless or lyric link');
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

        if (raw.indexOf(searchPhrase) > -1) {
          console.log('found phrase');
          var body = $(raw).text();

          var sentencePrior = body.substring(0, body.indexOf(searchPhrase));
          sentencePrior = sentencePrior.substring(lastPunctuationIn(sentencePrior));

          var sentenceAfter = body.substring(body.indexOf(searchPhrase));
          sentenceAfter = sentenceAfter.substring(0, firstPunctuationIn(sentenceAfter));

          var sentence = sentencePrior.trim() + " " + sentenceAfter.trim() + '.';
          console.log('Sentence: ' + sentence);

          novelText += sentence + "\n\n";
        }

        parseLink(i + 1); 
      });
    };

    parseLink(0);
  });
}

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


// all you need to do to write the novel:
addPhrase('"need a knife to"', function() {
  addPhrase('"wants a knife to"', theEnding);
});
