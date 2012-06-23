var fs    = require('fs'),
    nconf = require('nconf');
var http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy');
var debugging = true;
var routing = require('./redis_routing_table');
var routingTable = {};

function log(message) {
  if (debugging) console.log(message);
}

nconf.file({ file: 'config.json' }).load(function(err) {
  if (!err) {
    start();
  } else {
    console.log("Couldn't load config.json");
  }
});

function start() {
  debugging = nconf.get('debugging');
  routing.loadRoutingTable(nconf, routingTable);

  httpProxy.createServer(function (req, res, proxy) {
    var buffer = httpProxy.buffer(req);
    var destinationHost = routingTable[req.headers.host];
    log(req.url);
    // log(req.headers.host + " => " + destinationHost);
    req.headers.host = destinationHost;

    if (destinationHost != null) {
      proxy.proxyRequest(req, res, {
        host: destinationHost,
        port: 80,
        buffer: buffer
      });
    }
  }).listen(80);
}
