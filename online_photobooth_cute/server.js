const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 18e6, cors: { origin: "*", methods: ["GET", "POST"] } });
const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));
app.get("/room/:roomId", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, { users: [], names: {}, ready: {} });
  return rooms.get(roomId);
}
function getRoomState(roomId) {
  const room = getRoom(roomId);
  return { roomId, userCount: room.users.length, names: room.names, ready: room.ready };
}
function removeFromRoom(socket) {
  const roomId = socket.data.roomId;
  if (!roomId || !rooms.has(roomId)) return;
  const room = rooms.get(roomId);
  room.users = room.users.filter(id => id !== socket.id);
  delete room.names[socket.id];
  delete room.ready[socket.id];
  if (room.users.length === 0) rooms.delete(roomId);
  else {
    socket.to(roomId).emit("peer-left", getRoomState(roomId));
    io.to(roomId).emit("room-state", getRoomState(roomId));
  }
}

io.on("connection", socket => {
  socket.on("join-room", ({ roomId, name }) => {
    if (!roomId) return;
    const room = getRoom(roomId);
    if (room.users.length >= 2 && !room.users.includes(socket.id)) return socket.emit("room-full");
    if (!room.users.includes(socket.id)) room.users.push(socket.id);
    socket.data.roomId = roomId;
    socket.join(roomId);
    room.names[socket.id] = name || "Guest";
    room.ready[socket.id] = false;
    socket.emit("room-joined", { ...getRoomState(roomId), yourId: socket.id });
    socket.to(roomId).emit("room-state", getRoomState(roomId));
    if (room.users.length === 1) return socket.emit("waiting-for-peer", getRoomState(roomId));
    const [firstUser, secondUser] = room.users;
    io.to(firstUser).emit("peer-ready", { peerId: secondUser, shouldCreateOffer: true, state: getRoomState(roomId) });
    io.to(secondUser).emit("peer-ready", { peerId: firstUser, shouldCreateOffer: false, state: getRoomState(roomId) });
  });
  socket.on("update-profile", ({ name }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).names[socket.id] = name || "Guest";
    io.to(roomId).emit("room-state", getRoomState(roomId));
  });
  socket.on("set-ready", ({ ready }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).ready[socket.id] = Boolean(ready);
    io.to(roomId).emit("room-state", getRoomState(roomId));
  });
  socket.on("signal", ({ to, data }) => { if (to && data) io.to(to).emit("signal", { from: socket.id, data }); });
  socket.on("request-countdown", ({ seconds = 3, mode = "two" }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = getRoom(roomId);
    if (mode === "two") {
      const bothReady = room.users.length === 2 && room.users.every(id => room.ready[id]);
      if (!bothReady) return socket.emit("not-ready", { message: "Both people must be connected and ready." });
      return io.to(roomId).emit("countdown-start", { startAt: Date.now() + 1000, seconds: Number(seconds) || 3, mode: "two", state: getRoomState(roomId) });
    }
    if (!room.ready[socket.id]) return socket.emit("not-ready", { message: "Press Ready first." });
    socket.emit("countdown-start", { startAt: Date.now() + 800, seconds: Number(seconds) || 3, mode: "one", state: getRoomState(roomId) });
  });
  socket.on("photo-captured", ({ imageData, name }) => {
    const roomId = socket.data.roomId;
    if (roomId && imageData) socket.to(roomId).emit("peer-photo", { imageData, name: name || "Friend" });
  });
  socket.on("disconnect", () => removeFromRoom(socket));
});
server.listen(PORT, () => console.log(`Cheezy Photo Booth running on http://localhost:${PORT}`));
