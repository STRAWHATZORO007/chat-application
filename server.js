const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

const messages = [];

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send existing messages to the new client
  messages.forEach((message) => {
    ws.send(message);
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'delete') {
      // Handle message deletion
      const messageId = data.id;
      const index = messages.findIndex((msg) => {
        const msgData = JSON.parse(msg);
        return msgData.id === messageId;
      });

      if (index !== -1) {
        messages.splice(index, 1);
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message); // Broadcast the deletion to all clients
          }
        });
      }
    } else {
      // Handle regular messages
      const messageId = Date.now(); // Generate a unique ID for the message
      data.id = messageId;
      messages.push(JSON.stringify(data)); // Store the message

      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ ...data, id: messageId })); // Broadcast the message to all clients
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
