var redis = require("redis");

exports.loadRoutingTable = function(nconf, redisRoutingTable) {
  console.log("Loading routing table...");

  client = redis.createClient(nconf.get('port'), nconf.get('host'), { no_ready_check: true });
  client.on("error", function (err) {
    console.log(err);
  });

  client.auth(nconf.get('auth'), function(err) {
    if (err) {
      console.log("Redis connection failed!");
    } else {
      client.select(nconf.get('dbindex'), function(err, res) {
    	  if (!err) {
    	    client.llen('hosts', function(err, length) {
            if (!err) {
              client.lrange('hosts', 0, length, function(err, hosts) {
                for (var i = 0; i < hosts.length; i++) {
                  getHost = function(client, host, redisRoutingTable) {
                    client.hget(host, 'host', function(err, dest) {
                      redisRoutingTable[host] = dest;
                    });
                  }
                  getHost(client, hosts[i], redisRoutingTable);
                };
              });
            }
          });
        }
      });
    }
  });
}
