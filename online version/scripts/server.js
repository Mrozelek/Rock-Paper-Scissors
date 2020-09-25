const io = require('socket.io')(3000);

io.on('connection', socket => {
    socket.emit('message', 'logged as new user');
    socket.broadcast.emit('message', 'new user logged');

    socket.on('player-move', playerMove => {
        socket.broadcast.emit('player-move', playerMove);
    });
});
