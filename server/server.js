// require('dotenv').config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser")
const socket = require("socket.io");
const cors = require("cors")

const app = express();
const server = http.createServer(app);
const io = socket(server);
const PORT = 3000
var allRooms = {}

app.use(cors())
app.use(bodyParser.json())

const users = {};

const socketToRoom = {};


app.post('/rooms/', (req, res) => {
    let roomId = req.body.roomID
    let createdBy = req.body.createdBy
    let response = {}

    if (Object.keys(allRooms).includes(roomId)) {
        response.message = "Room already exists!"
        response.alreadyExists = true
    } else {
        response.message = "Room has beem created successfully!"
        response.alreadyExists = false

        allRooms[roomId] = { users: {}, createdBy }
    }

    res.send(response)
})

io.on('connection', socket => {
    console.log("[connection]: ID: ", socket.id)
    socket.on("join room", roomID => {
        console.log("[join room]: Room Id:", roomID)
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        console.log("[sending signal]: payload: ", payload.userToSignal, payload.callerID);
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        console.log("[returned signal]: payload: ", payload.userToSignal, payload.callerID)
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });

});

server.listen(PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://<%s>:%s", host, port)
})
