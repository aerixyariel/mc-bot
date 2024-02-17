const http = require('http');
const mc = require('minecraft-protocol')

var client = null;

function reConnect(res) {
  client = mc.createClient({
    host: 'samudra.aternos.me',
    port: '64210',
    username: 'Bot',
    auth: 'offline',
  })

  client.on('error', function (err) {
    res.write(err)
  })

  client.on('connect', function () {
    res.write('Connected !')
  })
  client.on('disconnect', function (packet) {
    res.write('Disconnected: ' + packet.reason)
    res.write('Re-connecting....')
    reConnect(res);
  })
  client.on('end', function () {
    res.write('Connection lost !')
    res.write('Re-connecting....')
    reConnect(res);
  })
}

http.createServer(function (req, res) {
  res.write('Connecting....')
  reConnect(res);
  res.end();
}).listen(process.env.PORT || 3000);
