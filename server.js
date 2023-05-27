const express = require('express');
const cors = require('cors');
const path = require('path');
const socket = require('socket.io');

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, '/client')));

const tasks = [
  { id: 1, name: "Shopping" },
  { id: 2, name: "Travelling" },
  { id: 3, name: "Learning" }
];

app.get('*', (req, res) => {
  res.send('server is running...');
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});

const io = socket(server);

io.on('connection', (socket) => {
  console.log('Connected socket: ', socket.id);
  const isFromServer = true;
  
  socket.emit('updateData', tasks);

  socket.on('addTask', (taskToAdd) => {
    tasks.push( { id: taskToAdd.id, name: taskToAdd.name } );
    socket.broadcast.emit('addTask', taskToAdd);
    console.log('afterAdd: ', tasks);
  });

  socket.on('removeTask', (id) => {
    const objectToSearch = tasks.find(task => task.id === id);
    socket.broadcast.emit('removeTask', objectToSearch.id, isFromServer);
    const arrayElementIndex = tasks.indexOf(objectToSearch);
    tasks.splice(arrayElementIndex, 1);
    console.log('afterRemove: ', tasks);
  });

});

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});

server.prependListener("request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
});