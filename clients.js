//TODO: Move into controllers folder
exports.clientManager = {};

exports.addClient = function(socket){
  this.clientManager[socket.id] = socket;
  console.log("Number of Active Users: " + count(this.clientManager));
  console.log("Added User: " + socket.id);
}

exports.removeClient = function(socket){
  delete this.clientManager[socket.id];
  console.log("Removed User: " + socket.identifier);
  console.log("Number of Active Users: " + count(this.clientManager));
}

function count(obj) { return Object.keys(obj).length; }