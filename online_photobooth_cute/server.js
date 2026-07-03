const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 24e6,
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));

app.get("/room/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, { users: [], names: {}, ready: {} });
  return rooms.get(roomId);
}

function getState(roomId) {
  const room = getRoom(roomId);
  return { roomId, userCount: room.users.length, names: room.names, ready: room.ready };
}

function leaveRoom(socket) {
  const roomId = socket.data.roomId;
  if (!roomId || !rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  room.users = room.users.filter(id => id !== socket.id);
  delete room.names[socket.id];
  delete room.ready[socket.id];

  if (room.users.length === 0) rooms.delete(roomId);
  else io.to(roomId).emit("peer-left", getState(roomId));
}

io.on("connection", socket => {
  socket.on("join-room", ({ roomId, name }) => {
    if (!roomId) return;
    const room = getRoom(roomId);

    if (room.users.length >= 2 && !room.users.includes(socket.id)) {
      socket.emit("room-full");
      return;
    }

    if (!room.users.includes(socket.id)) room.users.push(socket.id);

    socket.data.roomId = roomId;
    socket.join(roomId);
    room.names[socket.id] = name || "Guest";
    room.ready[socket.id] = false;

    socket.emit("room-joined", { ...getState(roomId), yourId: socket.id });
    socket.to(roomId).emit("room-state", getState(roomId));

    if (room.users.length === 1) {
      socket.emit("waiting-for-peer", getState(roomId));
      return;
    }

    const [first, second] = room.users;
    io.to(first).emit("peer-ready", { peerId: second, shouldCreateOffer: true, state: getState(roomId) });
    io.to(second).emit("peer-ready", { peerId: first, shouldCreateOffer: false, state: getState(roomId) });
  });

  socket.on("update-profile", ({ name }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).names[socket.id] = name || "Guest";
    io.to(roomId).emit("room-state", getState(roomId));
  });

  socket.on("set-ready", ({ ready }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).ready[socket.id] = Boolean(ready);
    io.to(roomId).emit("room-state", getState(roomId));
  });

  socket.on("signal", ({ to, data }) => {
    if (!to || !data) return;
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("request-shoot", ({ mode = "two", poses = 4, seconds = 3 }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = getRoom(roomId);
    poses = Math.max(1, Math.min(Number(poses) || 4, 4));
    seconds = Math.max(1, Math.min(Number(seconds) || 3, 10));

    if (mode === "two") {
      const bothReady = room.users.length === 2 && room.users.every(id => room.ready[id]);
      if (!bothReady) {
        socket.emit("not-ready", { message: "Both people must be connected and ready." });
        return;
      }

      io.to(roomId).emit("shoot-start", {
        startAt: Date.now() + 1000,
        seconds,
        poses,
        mode: "two",
        state: getState(roomId)
      });
      return;
    }

    if (!room.ready[socket.id]) {
      socket.emit("not-ready", { message: "Press Ready first." });
      return;
    }

    socket.emit("shoot-start", {
      startAt: Date.now() + 700,
      seconds,
      poses,
      mode: "one",
      state: getState(roomId)
    });
  });

  socket.on("photos-captured", ({ images, name }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !Array.isArray(images)) return;
    socket.to(roomId).emit("peer-photos", { images, name: name || "Friend" });
  });

  socket.on("disconnect", () => leaveRoom(socket));
});

server.listen(PORT, () => {
  console.log(`Cheezy by Billy v6 running on http://localhost:${PORT}`);
});
