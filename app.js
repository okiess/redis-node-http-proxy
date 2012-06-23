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

function internalServerError(res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Something went wrong!');
}

function start() {
  debugging = nconf.get('debugging');
  routing.loadRoutingTable(nconf, routingTable);

  server = httpProxy.createServer(function (req, res, proxy) {
    var buffer = httpProxy.buffer(req);
    var destinationHosts = routingTable[req.headers.host];
    if (destinationHosts != null && destinationHosts.length > 0) {
      var destinationHost = destinationHosts[Math.floor(Math.random() * destinationHosts.length)];
      
      log(req.url + " => " + destinationHost);
      req.headers.host = destinationHost;

      if (destinationHost != null) {
        proxy.proxyRequest(req, res, {
          host: destinationHost,
          port: 80,
          buffer: buffer
        });
      } else {
        log("Host not found!");
        internalServerError(res)
      }
    } else {
      log("No destination hosts!");
      internalServerError(res)
    }
  }).listen(80);

  server.proxy.on('proxyError', function (err, req, res) {
    internalServerError(res);
  });
}
