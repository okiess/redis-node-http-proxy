var fs    = require('fs'),
    nconf = require('nconf');
var http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy');
    routing = require('./redis_routing_table');
var routingTable = {};
nconf.argv().env().file({ file: 'config.json' });
var debugging = nconf.get('debugging');

function log(message) {
  if (debugging) console.log(message);
}

routing.loadRoutingTable(nconf, routingTable);

httpProxy.createServer(function (req, res, proxy) {
  var buffer = httpProxy.buffer(req);
  var destinationHost = routingTable[req.headers.host]
  log("\n" + req.url);
  log(req.headers.host + " => " + destinationHost);
  
  if (destinationHost != null) {
    proxy.proxyRequest(req, res, {
      host: destinationHost,
      port: 80,
      buffer: buffer
    });
  }
}).listen(process.env.VMC_APP_PORT || process.env.PORT || 8000);
