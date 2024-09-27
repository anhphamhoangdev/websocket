const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    transports: ['websocket'] // Bắt buộc sử dụng WebSocket
});

console.log('Server script is running');

app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(__dirname + '/client.html');
});

const seats = {
    seat1: false,
    seat2: false
};

io.on('connection', (socket) => {
    console.log('A user connected');

    // Lấy thông tin về kết nối
    const connectionInfo = {
        id: socket.id,
        transport: socket.conn.transport.name,
        remoteAddress: socket.handshake.address,
        url: socket.handshake.url
    };

    // Log đường dẫn WebSocket
    console.log('WebSocket path:', connectionInfo.url);

    console.log('Connection info:', connectionInfo);

    // Gửi thông tin kết nối cho client
    socket.emit('connectionInfo', connectionInfo);

    // Gửi trạng thái ghế hiện tại cho client mới kết nối
    socket.emit('seatStatus', seats);
    console.log('Sent initial seat status:', seats);

    socket.on('bookSeat', (seatId) => {
        console.log('Received bookSeat event for', seatId);
        if (!seats[seatId]) {
            seats[seatId] = true;
            io.emit('seatBooked', seatId);
            console.log('Seat booked:', seatId);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});