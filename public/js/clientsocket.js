var pathname = window.location.pathname;
var socket = io.connect(pathname);
var searching = false,
  matched = false,
  session_id = '',
  token = '',
  apiKey = '';
var session; // Session object for video chat
OT.setLogLevel(OT.DEBUG);
OT.on("exception", function exceptionHandler(event) {
    console.log(event)
});
isMatched(false);
$('.chatinput').keydown(function(e){  
if (e.keyCode == 13) {
    $('#send-btn').click();
  } 
});
socket.emit('new user connection', 'identifier');
socket.on('apiKey', function(data){
  console.log("ApiKey: " + data);
  apiKey = data;
});
socket.on('session', function(data){
  console.log("Found a match with session: " + data);
  session_id = data;
  isMatched(true);
  clearChatbox();
  stopSearching();
});
socket.on('token', function(data){
  console.log("Token: " + data);
  token = data;
  if (OT.checkSystemRequirements() == 1) {
    session = OT.initSession(apiKey, session_id);
  }else{
    alert("You're browser doesn't support the video chat.");
    return;
  }
  connectToVideoSession(session, token);
});
socket.on('message', function(data){
  console.log("Message: " + data);
  postMessageWithDate(data, 'Partner');
});
socket.on('partner disconnect', function(data){
  console.log("You're partner disconnected from SendChat. Search for a new partner.");
  disconnectFromVideoSession();
  isMatched(false);
  stopSearching();
});
socket.on('user count', function(data){
  console.log('Total Users: ' + data);
  $('.totalUsers').text(data);
});
function sendTextFromInput(){
  sendMessage($('.chatinput')[0].value);
  $('.chatinput')[0].value = "";
}
function sendMessage(message){
  var stripedMessage = $.trim(message);
  if(stripedMessage != ""){
    postMessageWithDate(stripedMessage,'You');
    socket.emit('message', stripedMessage);
  } 
};
function startSearching(){
  if(!searching){
    if(matched){
      socket.emit('partner disconnect', 'i am searching');
      disconnectFromVideoSession();
      isMatched(false);
    }
    socket.emit('search', 'start');
    $('#btn-text').text("Stop Searching");
    searching = true;
  }
  else{
    socket.emit('search', 'stop');
    $('#btn-text').text("Start Searching");
    searching = false;
  }
}
function stopSearching(){
  socket.emit('search', 'stop');
  console.log("Stopping Search");
  $('#btn-text').text("Start Searching");
  searching = false;
}
function addToChatbox(message){
  $('.chatbox').val($('.chatbox').val() + message + "\n");
}
function clearChatbox(){
  $('.chatbox').val('');
}
function isMatched(matchedToPartner){
  if(matchedToPartner){
    matched = true;
    $(".matchedIndicator").css('background-color', 'green');
    $('.matchedText').text("Matched!");
  }else{
    matched = false;
    $(".matchedIndicator").css('background-color', 'red');
    $('.matchedText').text("Not Matched");
  }
}
function postMessageWithDate(message, poster){
  var date = new Date();
  var hour = date.getHours();
  var period = hour >= 12 ? 'PM' : 'AM'; // Check AM or PM
  hour = hour > 12 ? hour - 12 : hour;
  var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes().toString();
  var finalMessage = hour + ":" + minutes + " " + period + " - " + poster + ": " + message;
  addToChatbox(finalMessage);
  scrollToBottom();
}
function scrollToBottom() {
  $('.chatbox').scrollTop($('.chatbox')[0].scrollHeight);
}
function connectToVideoSession(session, token){
  session.on("streamCreated", function(event) {
    session.subscribe(event.stream, 'subscriber-source',{width: 284, height: 218});
  });
  session.on("sessionConnected", function(sessionConnectEvent) {
    var publisher = TB.initPublisher(apiKey, 'publisher-source', {width: 284, height: 218});
    session.publish(publisher);
  });
  session.on('sessionDisconnected', function sessionDisconnectHandler(event) {
    // The event is defined by the SessionDisconnectEvent class
    if (event.reason == "networkDisconnected") {
      alert("Your network connection terminated.")
    }
  });
  session.connect(token, function(error) {
    if (error) {
      console.log("Error connecting: ", error.code, error.message);
    } else {
      console.log("Connected to the session.");
    }
  });
}
function disconnectFromVideoSession(){
  if(session){
    session.disconnect();
    console.log("Disconnected from video session.");
  }
  console.log("Successfully Disconnected.");
  $( "<div id='subscriber-source'></div>" ).appendTo( "#subscriber" );
  $( "<div id='publisher-source'></div>" ).appendTo( "#publisher" );
}