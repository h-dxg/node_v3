const redis = require('redis');
const client = redis.createClient(6379, '127.0.0.1');
const util = require('util');
client.set('hello', 5, function (err, obj) {
  client.incr('hello', function (err, data) {
    client.get('hello', function (err, data) {
      console.log(data, 'redis');         // 6
    })
  })
})