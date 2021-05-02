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
    "Alpha" : [],
    "Bravo" : [],
    "Charlie" : []
};
var rooms = ["Alpha", "Bravo", "Charlie"];

io.on("connection", function(socket) {

    console.log("User connected to server.");

    socket.on("createUser", function(username) {

        usernames.All_Names.push(username);
        usernames.All_Names.sort();
        usernames[username] = username;

        socket.username = username;
        socket.currentRoom = "Alpha";
        usernames[socket.currentRoom].push(socket.username);
        usernames[socket.currentRoom].sort();

        socket.join("Alpha");
        socket.emit("updateChat", "INFO", "You have joined Alpha room");
        socket.broadcast
          .to("Alpha")
          .emit("updateChat", "INFO", username + " has joined Alpha room");
        
        io.sockets.emit("updateClientUsers", usernames[socket.currentRoom]);
        socket.emit("updateRooms", rooms, "Alpha");
    });

    // socket.broadcast.emit sends message to all other clients except newly created connection
    // io.sockets.emit sends message to all clients


    socket.on("updateRoomUsers", function(option){

        if (option == 1){
            if (usernames[socket.currentRoom]){
                var index = usernames[socket.currentRoom].indexOf(socket.username);
                if (index != -1) usernames[socket.currentRoom].splice(index, 1);
                usernames[socket.currentRoom].sort();
                io.sockets
                    .to(socket.currentRoom)
                    .emit("updateClientUsers", usernames[socket.currentRoom]);
            }
        } else if (option == 2){
            if (usernames[socket.currentRoom]) usernames[socket.currentRoom].push(socket.username);
            usernames[socket.currentRoom].sort();
            io.sockets
                .to(socket.currentRoom)
                .emit("updateClientUsers", usernames[socket.currentRoom]);
        }

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

        var roomUsers = usernames[socket.currentRoom];

        if (roomUsers){
            index = roomUsers.indexOf(socket.username);
            if (index != -1) roomUsers.splice(index, 1);
            usernames[socket.currentRoom] = roomUsers;
        }

        socket.broadcast
          .to(socket.currentRoom)
          .emit("updateClientUsers", usernames[socket.currentRoom]);
        if (socket.username) socket.broadcast.emit("updateChat", "INFO", socket.username + " has disconnected");
    });

});

app.get('/getNames', function(req, res){

    let ret = usernames.All_Names;
    res.send(ret);
  
});
