const mc = require('minecraft-protocol');
const http = require('http');
const socketIO = require('socket.io');

const server = http.createServer((req, res) => {
  console.log(`Just got a request at ${req.url}!`);
  res.write('Yo!');
  res.end();
});

const io = socketIO(server);

const client = mc.createClient({
  host: 'samudra.aternos.me',
  port: '64210',
  username: 'Bot',
  auth: 'offline',
});

client.on('error', (error) => {
  // Send error information to connected web clients
  io.emit('error', error);
});

client.on('packet', (data, packetMeta) => {
  // Send data information to connected web clients
  io.emit('data', { data, packetMeta });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port 3000');
});
