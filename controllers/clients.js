//TODO: Move into controllers folder
exports.clientManager = {};

exports.addClient = function(socket){ // Adding a client to SendChat but without connecting them to another user
  socket.paired = false;
  socket.searching = false;
  if(socket.partner)
    delete socket.partner;
  this.clientManager[socket.id] = socket;
  var userCount = count(this.clientManager);
  console.log("Number of Active Users: " + userCount);
  console.log("Added User: " + socket.id);
  sendToAllUsers('user count', userCount, this.clientManager);
}

exports.startSearching = function(socket){
  this.clientManager[socket.id].searching = true;
}

exports.stopSearching = function(socket){
  this.clientManager[socket.id].searching = false;
}

exports.sendMessageToPartner = function(message, socket){
  var partner = this.clientManager[socket.partner];
  if(partner){
    partner.emit('message', message);
  }
}

exports.assignClientToPartner = function(socket){
  for (var key in this.clientManager) {
    var searchingUser = this.clientManager[key];
    if(searchingUser.id === socket.id) continue; //Don't connect to yourself
    if(searchingUser.searching){
      connectTwoClients(socket, searchingUser);
      console.log("User " + socket.id + " and User " + searchingUser.id +" are matched.");
      return;
    }
  }
  console.log("Another user not found for " + socket.id + " awaiting another user to search.");
}

exports.removeClientPartner = function(socket){
  var partnerSocket = this.clientManager[socket.partner];
  if(partnerSocket){
    console.log("Handling partner.");
    delete partnerSocket.partner;
    partnerSocket.paired = false; // partner is no longer connected to user
    partnerSocket.searching = false; //dont automatically find another user to connect to
    partnerSocket.emit('partner disconnect', 'partner disconnected');
  }
}

exports.removeClient = function(socket){
  this.removeClientPartner(socket);
  delete this.clientManager[socket.id]; // delete user
  var userCount = count(this.clientManager);
  console.log("Number of Active Users: " + userCount);
  console.log("Removed User: " + socket.id);
  sendToAllUsers('user count', userCount, this.clientManager);
}

// Counting number of users
function count(obj) { return Object.keys(obj).length; }

function connectTwoClients(socketA, socketB){
  socketA.partner = socketB.id;
  socketB.partner = socketA.id;
  socketA.paired = true;
  socketB.paired = true;
  socketA.searching = false;
  socketB.searching = false;
  socketA.emit('matched', socketB.id);
  socketB.emit('matched', socketA.id);
}

function sendToAllUsers(event, message, set){
  for(var socketId in set){
    var socket = set[socketId];
    socket.emit(event, message);
  }
  console.log("Sent to all " + count(set) + " users: " + message);
}