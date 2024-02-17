const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const minecraftProtocol = require('minecraft-protocol');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Kode untuk koneksi klien Minecraft
const mcClient = minecraftProtocol.createClient({
  host: 'samudra.aternos.me',
  port: '64210',
  username: 'Bot',
  auth: 'offline',
});

mcClient.on('login', () => {
    console.log('Connected to Minecraft server');
});

// Kode untuk antarmuka web
io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('chat-message', (message) => {
        mcClient.write('chat', { message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(process.env.PORT || 3000);
