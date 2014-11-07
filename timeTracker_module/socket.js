var io = require('socket.io-client');
module.exports = function () {
    var socket = io.connect('http://127.0.0.1:8080');
    socket.on('connection', function () {
        console.log('now connected');
    });
    socket.on('addToDBComplete', function (data) {
        console.log(data);
    });
    return {
        addToDB: function () {
            socket.emit('logging-pushEvents', {
                data: 'client data'
            });
        }
        // io.listen('addToDBComplete', function () {});
    };
};