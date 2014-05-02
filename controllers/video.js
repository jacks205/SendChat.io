var OpenTok = require('opentok');

exports.key = '44744552';    // API key  
var secret = 'defbf39b48b34e93a77d7bf8dcd28c1703b3907e';  // API secret  
var opentok = new OpenTok.OpenTokSDK(this.key, secret);

exports.generateSession = function(callback){
  var location = '127.0.0.1'; // use an IP of 'localhost'
  var sessionId = '';
  opentok.createSession(location, {'p2p.preference':'enabled'}, function(err, sessionId){
    if (err) throw new Error("session creation failed");
    console.log("Successful Session Generated");
    // Do things with sessionId
    callback(sessionId)
  });
  console.log("Error with session creation.");
}

exports.generateToken = function(session_id){
  var token = opentok.generateToken({session_id:session_id, role:OpenTok.RoleConstants.PUBLISHER, connection_data:"userId:42"});
  return token;
}