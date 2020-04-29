var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var users = [];
let roomcollection = {};
var connections = [];
var maxsenderid = '';
var maxcount = 0;
var room = "";

app.set('view engine', 'ejs');

app.use(express.static('public'));

server.listen(process.env.PORT || 3000);
console.log('ihimanshubhutani started the server ...stay tuned!');

app.get('/connect/ly/:channel/', (req, res) => {
  res.render('channel', { roomname: req.params.channel });
});

app.get('/:room/:user', function (req, res) {

  room = req.params.room;

  res.render('index', { username: req.params.user, userroom: room });

});

app.get('/chat/:room/:user', function (req, res) {

  room = req.params.room;
  let userdata = { username: req.params.user, userroom: room }

  res.render('chatapp', userdata);
});

app.get('/', function (req, res) {

  res.render('home');
});

app.get('/con/:user/about', function (req, res) {
  res.render('about', { username: req.params.user });
})

// Connection with Socket.io;
io.sockets.on('connection', function (socket) {
  connections.push(socket);
  socket.join(room);
  console.log('Connected: %s sockets Connected', connections.length);

  // Disconnect;
  socket.on('disconnect', function (data) {

    if (roomcollection[socket.roomname]) {
      roomcollection[socket.roomname].room.splice(roomcollection[socket.roomname].room.indexOf(socket.username), 1);
    }

    updateUsernames(socket.roomname);
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });


  socket.on('start drawing', (data) => {
    io.sockets.to(data.room).emit('st', data);
  });


  socket.on('drawing', (data) => {
    io.sockets.to(data.room).emit('dr', data);
  });

  socket.on('stop drawing', (data) => {
    console.log('stop');
    io.sockets.to(data.room).emit('sd', data);
  });

  // Send Message;
  socket.on('send message', function (data) {

    io.sockets.to(data.room).emit('new message', { msg: data.msg, user: socket.username, time: data.time });
  });

  socket.on('joined', (data) => {

    console.log('joined', data);
    id = socket.id;
    socket.i = 0;


  });

  socket.on('typing', function (data) {

    if (socket.username == undefined) {

      socket.username = data.typing;
      socket.roomname = data.room;

      if (!roomcollection[socket.roomname]) {
        roomcollection[socket.roomname] = { 'room': [], i: 0 };
      }
      roomcollection[socket.roomname].room.push(socket.username);


      updateUsernames(socket.roomname);

      io.sockets.to(data.room).emit('just joined', { data: data.typing, id: socket.id, isback: true });

    }

    io.sockets.to(data.room).emit('user typing', { message: data.message, typing: socket.username });
  });

  // New User;
  socket.on('new user', function (data, callback) {
    callback(true);

    socket.username = data.username;
    socket.roomname = data.room;
    if (!roomcollection[socket.roomname]) {
      roomcollection[socket.roomname] = {};
      roomcollection[socket.roomname].room = [];
      roomcollection[socket.roomname].i = 0;

    }
    roomcollection[socket.roomname].room.push(socket.username);

    console.log('socket.id');
    console.log(socket.id);
    socket.i = 0;
    io.sockets.to(data.room).emit('just joined', { data: data.username, id: socket.id });

    updateUsernames(socket.roomname);

  });

  socket.on('givemsg', data => {
    io.to(data.room).emit('getmsg', { msgs: data.arrs, username: data.username, name: data.name });
  })

  socket.on('sendCount', (data) => {

    roomcollection[data.room].i += 1;

    console.log('I receiveid data ' + roomcollection[data.room].i);
    console.log('I have total ' + roomcollection[data.room].room.length);

    if (data.count > maxcount) {
      maxcount = data.count;
      maxsenderid = data.sender;
    }

    if (roomcollection[data.room].i === roomcollection[data.room].room.length) {

      console.log('i sent the request');
      io.to(maxsenderid).emit('new message', { msg: 'MEUI', user: data.receiver, name: data.name });
      maxcount = 0;
      roomcollection[data.room].i = 0;
      maxsenderid = '';

    }
  });


  function updateUsernames(data) {

    if (roomcollection[data]) {

      io.sockets.to(data).emit('get users', roomcollection[data].room);

    }

  }


});
