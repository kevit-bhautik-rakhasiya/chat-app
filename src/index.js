const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessages,
  generateLocationMessage,
} = require("./utiils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 4000;
const publicDirectoryPath = path.join(__dirname, "../public"); //__dirname: This is a Node.js global variable that holds the directory name of the current module

app.use(express.static(publicDirectoryPath)); // This line of code tells the Express application to use the  (express.static)  middleware to serve static files from the public directory.(images, css, html files)

io.on("connection", (socket) => {
  console.log("Create new web socket");

  socket.emit("message", generateMessages("Welcome!!")); //This line emit event only specific connection
  socket.broadcast.emit("message", generateMessages("A new user joined!!")); //Broadcast everyone but not particular socket

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profinity words not allowed!!!");
    }

    io.emit("message", generateMessages(message)); //This line emit event to every singal connection
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessages("A user has left!"));
  });
});

server.listen(port, () => {
  console.log(`Server is on port ${port}`);
});
