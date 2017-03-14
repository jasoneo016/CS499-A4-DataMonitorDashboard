/**
 * Created by admin on 3/13/17.
 */
var elasticsearch = require('elasticsearch');
var express = require('express');
var request = require('request');

var client = new elasticsearch.Client({
    host: 'https://search-snapstockprice-4ufubrmszcp72intsktbv3c2gy.us-west-1.es.amazonaws.com/',
    log: 'info'
});

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 5000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        fetchStockPrice();
        console.log('All is well');
    }
});

function fetchStockPrice() {
    var interval = setInterval(function(){
        request('https://www.google.com/finance/info?q=NSE:SNAP', function (error, response, body) {
            body = body.substr(5, body.length-7);
            if (!error && response.statusCode == 200) {

                var items = JSON.parse(body);

                console.log("Stock: " + items.t);
                console.log("Current Price: " + items.l);
                console.log("Change: " + items.c);
                console.log("Change %: " + items.cp + "%");

                client.create({
                    index: 'snap-stock-price',
                    type: 'stock',
                    id: items.id,
                    body: items
                }, function (error, response) {
                    console.log(response)
                    console.log("")
                })
            }
        })
    }, 600000);
}


var app = express()

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/fetch', function (req, res) {
    fetchStockPrice();
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})