var http = require('http');
const mc = require('minecraft-protocol')

var client = null;

http.createServer(function (req, res) {
  client = mc.createClient({
    host: 'samudra.aternos.me',
    port: '64210',
    username: 'Bot',
    auth: 'offline',
  })
  console.log(`Just got a request at ${req.url}!`)
  res.write('Yo!');
  res.end();
}).listen(process.env.PORT || 3000);
