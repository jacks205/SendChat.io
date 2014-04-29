var clients = require('../controllers/clients');

exports.createSockets = function(server){
  var io = require('socket.io').listen(server);
  io.sockets.on('connection', function (socket) {
    socket.on('new user connection', function(data){ //Data on new connection will be a identifier of the socket
      clients.addClient(socket);
    });
    socket.on('search', function(data){
      if(data === 'start'){
        console.log(socket.id + " wants to START searching.");
        clients.startSearching(socket);
        clients.assignClientToPartner(socket);
      }else if(data === 'stop'){
        console.log(socket.id + " wants to STOP searching.");
        clients.stopSearching(socket);
      }
    });
    socket.on('message', function(data){
      clients.sendMessageToPartner(data, socket);
    });
    socket.on('partner disconnect', function(data){
      clients.removeClientPartner(socket);
      clients.addClient(socket);
    });
    socket.on('disconnect', function(data){
      clients.removeClient(socket);
    });
  });
}