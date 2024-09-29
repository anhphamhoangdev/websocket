const WebSocket = require('ws');

// "wss://example.com:8081" - kết nối WebSocket bảo mật (tương tự như HTTPS)
// "ws://localhost" - 80 ws , 443 wss
const ws = new WebSocket('ws://localhost:8081');

ws.on('open', function open() {
    console.log('Connected to the server');
    ws.send('Hello, server!');
});

ws.on('message', function incoming(data) {
    console.log('Received from server: %s', data);
});