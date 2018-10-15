var express = require('express');
var socket = require('socket.io');

var serverPort = 8080;

//APP SETUP
var app = express();
var server = app.listen(8080, function() {
	console.log("Server started on port: " + serverPort)
});
app.use(express.static('public'));

//SOCKET SETUP
var io = socket(server);

//INITS IMAGE
var paintImage = [];
for(var i = 0; i <= 600; i++) {
    paintImage[i] = [];
}
for(var y = 0; y <= 600; y++) {
    for(var x = 0; x <= 600; x++) {
        paintImage[x][y] = 'ffffff';
    }
}
//CHAT
var chatText = [];


io.on('connection', function(socket) {
    console.log('User connected with socket id:', socket.id);
    
    socket.on('clientGetImage', function(data) {
        //RESPONSES TO CLIENT IMAGE REQUEST
        socket.emit('serverImage', {
            image: paintImage
        });
    });

    socket.on('clientGetChat', function(data) {
        //RESPONSES TO CLIENT CHAT REQUEST
        socket.emit('serverChat', {
            chat: chatText
        });
    });

    socket.on('clientDraw', function(data) {
        //SAVES THE DRAW TO SERVER SIDE
        fillRectangle(parseInt(data.x), parseInt(data.y), parseInt(data.size), data.color);   
        
        //BROADCASTS THE NEW DRAW TO ALL SOCKETS EXCEPT SENDING
        socket.broadcast.emit('serverDraw', {
            x: data.x,
            y: data.y,
            color: data.color,
            size: data.size
        });
    });

    socket.on("clientChat", function(data) {
        chatText.push('[' + data.username + '] ' + data.message);

        socket.broadcast.emit('serverChat'), {
            chat: chatText
        }
    });

});

function fillRectangle(x, y, size, color) {
    var minX = x;
    var minY = y;
    var maxX = x + size;
    var maxY = y + size;

    if(minX < 0) {
        minX = 0;
    } else if(maxX > 600) {
        maxX = 600;
    }
    if(minY < 0) {
        minY = 0;
    } else if(maxY > 600) {
        maxY = 600;
    }

    for(var y = minY; y < maxY; y++) {
        for(var x = minX; x < maxX; x++) {
            paintImage[x][y] = color;
        }
    }
}

function intToHex(int) {
    return parseInt(int).toString(16).padStart(2, " ");
}