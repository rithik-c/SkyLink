'use strict'

// Framework Setup
const express = require("express");
const socket = require("socket.io");
const app = express();
const server = app.listen(5000, function() {
    console.log("Listening to port 5000.");
});
const io = socket(server);

// Server Connection Folder
app.use(express.static("public"));

// Global variables to hold all usernames and rooms created
var usernames = {
    All_Names : [],
    Alpha : [],
    Bravo : [],
    Charlie : []
};
var rooms = ["Alpha", "Bravo", "Charlie"];

io.on("connection", function(socket) {

    console.log("User connected to server.");

    socket.on("createUser", function(username) {

        usernames.All_Names.push(username);
        socket.username = username;
        usernames[username] = username;
        socket.currentRoom = "Alpha";
        socket.join("Alpha");
        socket.emit("updateChat", "INFO", "You have joined Alpha room");
        socket.broadcast
          .to("Alpha")
          .emit("updateChat", "INFO", username + " has joined Alpha room");
        io.sockets.emit("updateUsers", usernames);
        socket.emit("updateRooms", rooms, "Alpha");
        // console.log(usernames.All_Names);
    });


    socket.on("sendMessage", function(data) {
    io.sockets
        .to(socket.currentRoom)
        .emit("updateChat", socket.username, data);
    });


    socket.on("createRoom", function(room) {
        if (room != null) {
            rooms.push(room);
            io.sockets.emit("updateRooms", rooms, null);
        }
    });


    socket.on("updateRooms", function(room) {
        socket.broadcast
          .to(socket.currentRoom)
          .emit("updateChat", "INFO", socket.username + " left room");
        socket.leave(socket.currentRoom);
        socket.currentRoom = room;
        socket.join(room);
        socket.emit("updateChat", "INFO", "You have joined " + room + " room");
        socket.broadcast
          .to(room)
          .emit("updateChat", "INFO", socket.username + " has joined " + room + " room");
    });

      
    socket.on("disconnect", function() {
        delete usernames[socket.username];
        var index = usernames.All_Names.indexOf(socket.username);
        if (index != -1) usernames.All_Names.splice(index, 1);

        // var socketRoom = socket.currentRoom;
        // index = usernames.socketRoom.indexOf(socket.username);
        // if (index != -1) usernames.socketRoom.splice(index, 1);

        io.sockets.emit("updateUsers", usernames);
        socket.broadcast.emit("updateChat", "INFO", socket.username + " has disconnected");
    });

});

app.get('/getNames', function(req, res){

    let ret = usernames.All_Names;
    res.send(ret);
  
});
