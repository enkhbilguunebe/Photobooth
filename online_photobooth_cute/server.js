const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 12e6,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));

app.get("/room/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: [],
      names: {},
      ready: {},
      roomTheme: "strawberry"
    });
  }
  return rooms.get(roomId);
}

function getRoomState(roomId) {
  const room = getRoom(roomId);
  return {
    roomId,
    userCount: room.users.length,
    names: room.names,
    ready: room.ready,
    roomTheme: room.roomTheme
  };
}

function removeFromRoom(socket) {
  const roomId = socket.data.roomId;
  if (!roomId || !rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  room.users = room.users.filter(id => id !== socket.id);
  delete room.names[socket.id];
  delete room.ready[socket.id];

  socket.to(roomId).emit("peer-left", getRoomState(roomId));

  if (room.users.length === 0) {
    rooms.delete(roomId);
  }
}

io.on("connection", socket => {
  socket.on("join-room", ({ roomId, name, theme }) => {
    if (!roomId) return;

    const room = getRoom(roomId);

    if (room.users.length >= 2 && !room.users.includes(socket.id)) {
      socket.emit("room-full");
      return;
    }

    if (!room.users.includes(socket.id)) {
      room.users.push(socket.id);
    }

    socket.data.roomId = roomId;
    socket.join(roomId);

    room.names[socket.id] = name || "Guest";
    room.ready[socket.id] = false;
    if (theme) room.roomTheme = theme;

    socket.emit("room-joined", {
      ...getRoomState(roomId),
      yourId: socket.id
    });

    socket.to(roomId).emit("room-state", getRoomState(roomId));

    if (room.users.length === 1) {
      socket.emit("waiting-for-peer", getRoomState(roomId));
      return;
    }

    const [firstUser, secondUser] = room.users;

    io.to(firstUser).emit("peer-ready", {
      peerId: secondUser,
      shouldCreateOffer: true,
      state: getRoomState(roomId)
    });

    io.to(secondUser).emit("peer-ready", {
      peerId: firstUser,
      shouldCreateOffer: false,
      state: getRoomState(roomId)
    });
  });

  socket.on("update-profile", ({ name, theme }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    if (name) room.names[socket.id] = name;
    if (theme) room.roomTheme = theme;

    io.to(roomId).emit("room-state", getRoomState(roomId));
  });

  socket.on("set-ready", ({ ready }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    room.ready[socket.id] = Boolean(ready);

    io.to(roomId).emit("room-state", getRoomState(roomId));
  });

  socket.on("signal", ({ to, data }) => {
    if (!to || !data) return;
    io.to(to).emit("signal", {
      from: socket.id,
      data
    });
  });

  socket.on("request-countdown", ({ seconds = 3 }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    const bothReady =
      room.users.length === 2 &&
      room.users.every(id => room.ready[id]);

    if (!bothReady) {
      socket.emit("not-ready");
      return;
    }

    io.to(roomId).emit("countdown-start", {
      startAt: Date.now() + 1000,
      seconds: Number(seconds) || 3,
      state: getRoomState(roomId)
    });
  });

  socket.on("photo-captured", ({ imageData, name }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !imageData) return;

    socket.to(roomId).emit("peer-photo", {
      imageData,
      name: name || "Friend"
    });
  });

  socket.on("disconnect", () => {
    removeFromRoom(socket);
  });
});

server.listen(PORT, () => {
  console.log(`Cute Online Photo Booth running on http://localhost:${PORT}`);
});
