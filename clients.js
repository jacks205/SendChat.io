//TODO: Move into controllers folder
exports.clientManager = {};

exports.addClient = function(socket){ // Adding a client to SendChat but without connecting them to another user
  socket.paired = false;
  socket.searching = false;
  this.clientManager[socket.id] = socket;
  console.log("Number of Active Users: " + count(this.clientManager));
  console.log("Added User: " + socket.id);
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

exports.removeClient = function(socket){
  var partnerSocket = this.clientManager[socket.partner];
  if(partnerSocket){
    console.log("Handling partner.");
    delete partnerSocket.partner;
    partnerSocket.paired = false; // partner is no longer connected to user
    partnerSocket.searching = false; //dont automatically find another user to connect to
    partnerSocket.emit('partner disconnect', 'partner disconnected');
  }
  delete this.clientManager[socket.id]; // delete user
  console.log("Removed User: " + socket.id);
  console.log("Number of Active Users: " + count(this.clientManager));
}

// Counting number of users in clientManager
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