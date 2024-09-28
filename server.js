const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

console.log('Server script is running');

app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(__dirname + '/client.html');
});

const films = {
    film1: {
        seats: {
            seat1: null,
            seat2: null
        }
    },
    film2: {
        seats: {
            seat1: null,
            seat2: null
        }
    }
};

function setupNamespace(namespace, filmName) {
    namespace.on('connection', (socket) => {
        const name = socket.handshake.query.name;
        console.log(`User ${name} connected to ${filmName} namespace`);

        const connectionInfo = {
            id: socket.id,
            transport: socket.conn.transport.name,
            remoteAddress: socket.handshake.address,
            url: socket.handshake.url
        };

        console.log('Connection info:', connectionInfo);

        socket.emit('connectionInfo', connectionInfo);
        console.log('Sent connection info to client');

        socket.emit('seatStatus', films[filmName].seats);
        console.log(`Sent initial seat status for ${filmName}:`, films[filmName].seats);

        socket.on('bookSeat', (seatId) => {
            console.log(`Received bookSeat event for ${seatId} from ${name} in ${filmName}`);
            if (!films[filmName].seats[seatId]) {
                films[filmName].seats[seatId] = name;
                namespace.emit('seatBooked', { seatId, bookedBy: name });
                console.log(`Seat ${seatId} booked by ${name} in ${filmName}`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User ${name} disconnected from ${filmName} namespace`);
        });
    });
}

const film1Namespace = io.of('/booking/film1');
const film2Namespace = io.of('/booking/film2');

setupNamespace(film1Namespace, 'film1');
setupNamespace(film2Namespace, 'film2');

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Log all incoming connections
io.engine.on('connection', (socket) => {
    console.log('New connection attempt:', socket.id);
});