// (c) 2012 Richard Carter
// This code is licensed under the MIT license; see LICENSE.txt for details.

// This script handles the following functions:
//     btc - look up current btc market status




var playListURL = 'http://en.wikipedia.org/w/api.php?format=json&action=query&titles=India&prop=revisions&rvprop=content&callback=?';

$.getJSON(playListURL ,function(data) {
    var hash = data
    var page_value = ""
    $.each(data["query"]["pages"],function(k,v){
        alert(k)
        $.each(v,function(key,val){
          alert(key)
        });
    });
});




var request = require('request'),
  entities = require('./lib/entities'),
  fs = require('fs'),
  exec = require('child_process').exec;


function printHelp(replyTo){
  irc.privmsg(replyTo, '~btc [amount, default 1] [[eur,usd]]');
}


function calc(replyTo, market, amount, fiat){
  var btc = {
    "eur": parseFloat(market["EUR"]["24h"]),
    "usd": parseFloat(market["USD"]["24h"])
  }
  var output = '';
  var amount = parseFloat(amount);
  if(fiat) {
    if (fiat === 'eur' || fiat === 'usd'){
      output = '' + amount.toFixed(2) + ' ' + fiat.toUpperCase() + ' ~ ' + (1.0/btc[fiat]*amount).toFixed(8) + ' BTC';
    }
  } else {
    output = 
      '' + amount + ' BTC ~' + 
      ' USD ' + (btc.usd * amount).toFixed(2) + ' ~' +
      ' EUR ' + (btc.eur * amount).toFixed(2) + ' '; 

  }

  irc.privmsg(replyTo, output.toString("utf8"))
}



listen(regexFactory.startsWith(["btc"]), function (match, data, replyTo, from) {

  var url = 'http://api.bitcoincharts.com/v1/weighted_prices.json';

  var requestObject = {
    uri: url,
    strictSSL: false,
    timeout: 10000,
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.43 Safari/537.31 Nodebot'
    }
  };

  request(requestObject, function(error, response, body) {
    if(response.statusCode == 200) {
      var market = JSON.parse(body);

      // default
      if (match[1].trim().length === 0) {
        calc(replyTo, market,1)
        return;
      }

      var params = match[1].split(' ');
      if (params.length !== 1 && params.length !== 2) {
        printHelp(replyTo)
        return;
      }

      if (params[0] === 'help') {
        printHelp(replyTo)
        return;
      }

      calc(
        replyTo, 
        market, 
        parseFloat(params[0]), 
        params[1]
        );

    } else {
      irc.privmsg(replyTo,"error: could not get market");
    }
  });
  //return market;



  // if (params.length !== 2) {
  //   params = 'help';
  //   return;
  // }

});

