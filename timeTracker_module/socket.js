var io = require('socket.io-client');
module.exports = function () {
    var socket = io.connect('http://127.0.0.1:5432');
    socket.on('connection', function () {});
    socket.on('addToDBComplete', function (data) {
        console.log(data);
    });
    return {
        addToDB: function () {
            socket.emit('addToDB', {
                data: 'client data'
            });
        }
        // io.emit('addToDBComplete', function () {});
    };
};