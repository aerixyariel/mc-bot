const mc = require('minecraft-protocol');
const readline = require('readline');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
  prompt: 'Enter a message> '
});

const [,, host, port, username, auth] = process.argv;

if (!host || !port) {
  console.error('Usage: node client_chat.js <host> <port> <username>');
  console.error('Usage (offline mode): node client_chat.js <host> <port> offline');
  process.exit(1);
}

const client = mc.createClient({
  host,
  port,
  username,
  auth
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Boilerplate
client.on('disconnect', function (packet) {
  console.log('Disconnected from server : ' + packet.reason);
});

client.on('end', function () {
  console.log('Connection lost');
  process.exit();
});

client.on('error', function (err) {
  console.log('Error occurred');
  console.log(err);
  process.exit(1);
});

client.on('connect', () => {
  const ChatMessage = require('prismarine-chat')(client.version);

  console.log('Connected to server');
  rl.prompt();

  client.on('playerChat', function ({ senderName, plainMessage, unsignedContent, formattedMessage, verified }) {
    let content;

    const allowInsecureChat = true;

    if (formattedMessage) content = JSON.parse(formattedMessage);
    else if (allowInsecureChat && unsignedContent) content = JSON.parse(unsignedContent);
    else content = { text: plainMessage };

    const chat = new ChatMessage(content);
    console.log(senderName, { trugie: 'Verified:', false: 'UNVERIFIED:' }[verified] || '', chat.toAnsi());

    // Menyebarkan pesan ke antarmuka web
    io.emit('chat-message', `${senderName}: ${chat.toAnsi()}`);
  });
});

// Send the queued messages
const queuedChatMessages = [];
client.on('state', function (newState) {
  if (newState === mc.states.PLAY) {
    queuedChatMessages.forEach(message => client.chat(message));
    queuedChatMessages.length = 0;
  }
});

// Listen for messages written to the console, send them to game chat
rl.on('line', function (line) {
  if (line === '') {
    return;
  } else if (line === '/quit') {
    console.info('Disconnected from ' + host + ':' + port);
    client.end();
    return;
  } else if (line === '/end') {
    console.info('Forcibly ended client');
    process.exit(0);
  }
  if (!client.chat) {
    queuedChatMessages.push(line);
  } else {
    client.chat(line);
  }
});

// Membuat server HTTP untuk antarmuka web
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Menyimpan koneksi WebSocket
const webSocketConnections = new Set();

// Menyebarkan pesan ke semua koneksi WebSocket
function broadcastConsoleMessage(message) {
  webSocketConnections.forEach(ws => {
    ws.send(JSON.stringify({ type: 'console-message', content: message }));
  });
}

// Menggunakan WebSocket untuk menangani koneksi antarmuka web
wss.on('connection', (ws) => {
  console.log('Web interface connected');

  // Menambahkan koneksi WebSocket ke set
  webSocketConnections.add(ws);

  // Menangani pesan dari antarmuka web ke server
  ws.on('message', (message) => {
    // Misalnya, Anda dapat menangani pesan dari antarmuka web di sini
    console.log('Received message from web interface:', message);
  });

  // Menangani penutupan koneksi
  ws.on('close', () => {
    webSocketConnections.delete(ws);
    console.log('Web interface disconnected');
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Web interface berjalan di http://localhost:${portWeb}`);
});
