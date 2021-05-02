// Global Variables
let socket = io.connect("http://localhost:5000");

let userlist = document.getElementById("userlist");
let roomlist = document.getElementById("roomlist");
let message = document.getElementById("message");
let sendMessageBtn = document.getElementById("send");
let createRoomBtn = document.getElementById("create-room");
let messages = document.getElementById("msg");
let chatDisplay = document.getElementById("chat-display");

let currentRoom = "Alpha";

// Send Message on Button Click
sendMessageBtn.addEventListener("click", function () {
    socket.emit("sendMessage", message.value);
    message.value = "";
});

// Send Message on Enter Key
message.addEventListener("keyup", function (event) {
    if (event.key == 'Enter') sendMessageBtn.click();
});

// Create new room on button click
createRoomBtn.addEventListener("click", function () {
    socket.emit("createRoom", prompt("Enter new room: "));
});


    
socket.on("connect", function() {

    // $(document).ready(function(){

    jQuery.ajax({
        type: 'get',
        dataType: 'json',
        url: '/getNames',
        success: function (data) {
    
            console.log(data); 

            let name = prompt("Enter name: ");
            while (data.indexOf(name) != -1 || name == ""){
                if (data.indexOf(name) != -1) name = prompt("Username Already Exists! Enter Name: ");
                else if (name == "") name = prompt("Cannot Be Blank! Enter Name: ");
            }
            if (name != null) socket.emit("createUser", name);

            console.log('getNames completed successfully'); 
    
        },
        error: function(error) {
            
            alert("Server Error: Could Not Get Usernames");
            socket.emit("createUser", prompt("Enter name: "));
            console.log(error); 
        }
    });

    // });
    
});




socket.on("updateChat", function(username, data) {
    if (username == "INFO") {
        messages.innerHTML +=
        "<p class='alert alert-warning w-100'>" + data + "</p>";
    } else {
        messages.innerHTML +=
        "<p><span><strong>" + username + ": </strong></span>" + data + "</p>";
    }

    chatDisplay.scrollTop = chatDisplay.scrollHeight;
});


socket.on("updateUsers", function(userList) {
    userlist.innerHTML = "";

    for (var user in userList) {
        userlist.innerHTML += "<li>" + user + "</li>";
    }
});


socket.on("updateRooms", function(rooms, newRoom) {
    roomlist.innerHTML = "";

    for (var index in rooms) {
        roomlist.innerHTML +=
        '<li class="rooms" id="' +
        rooms[index] +
        '" onclick="changeRoom(\'' +
        rooms[index] +
        "')\"># " +
        rooms[index] +
        "</li>";
    }

    if (newRoom != null) {
        document.getElementById(newRoom).classList.add("text-warning");
    } else {
        document.getElementById(currentRoom).classList.add("text-warning");
    }

});


function changeRoom(room) {

    if (room != currentRoom) {
        socket.emit("updateRooms", room);
        document.getElementById(currentRoom).classList.remove("text-warning");
        currentRoom = room;
        document.getElementById(currentRoom).classList.add("text-warning");
    }

}