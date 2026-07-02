const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e7
});

const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));

app.get("/room/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, []);
  return rooms.get(roomId);
}

function removeFromRoom(socket) {
  const roomId = socket.data.roomId;
  if (!roomId || !rooms.has(roomId)) return;

  const room = rooms.get(roomId).filter(id => id !== socket.id);

  if (room.length === 0) {
    rooms.delete(roomId);
  } else {
    rooms.set(roomId, room);
    socket.to(roomId).emit("peer-left");
  }
}

io.on("connection", socket => {
  socket.on("join-room", ({ roomId }) => {
    if (!roomId) return;

    const room = getRoom(roomId);

    if (room.length >= 2) {
      socket.emit("room-full");
      return;
    }

    room.push(socket.id);
    socket.data.roomId = roomId;
    socket.join(roomId);

    socket.emit("room-joined", {
      roomId,
      yourId: socket.id,
      userCount: room.length
    });

    if (room.length === 1) {
      socket.emit("waiting-for-peer");
      return;
    }

    const [firstUser, secondUser] = room;

    io.to(firstUser).emit("peer-ready", {
      peerId: secondUser,
      shouldCreateOffer: true
    });

    io.to(secondUser).emit("peer-ready", {
      peerId: firstUser,
      shouldCreateOffer: false
    });
  });

  socket.on("signal", ({ to, data }) => {
    if (!to || !data) return;
    io.to(to).emit("signal", {
      from: socket.id,
      data
    });
  });

  socket.on("request-countdown", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    io.to(roomId).emit("countdown-start", {
      startAt: Date.now() + 900,
      seconds: 3
    });
  });

  socket.on("photo-captured", ({ imageData }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !imageData) return;

    socket.to(roomId).emit("peer-photo", {
      imageData
    });
  });

  socket.on("disconnect", () => {
    removeFromRoom(socket);
  });
});

server.listen(PORT, () => {
  console.log(`Online Photo Booth running on http://localhost:${PORT}`);
});
