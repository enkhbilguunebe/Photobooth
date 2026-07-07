const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 35e6,
  pingInterval: 10000,
  pingTimeout: 30000,
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));

app.get("/room/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function defaultSettings() {
  return { mode: "two", layout: "B", filter: "boothbw", seconds: 3 };
}

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: [],
      hostId: null,
      names: {},
      ready: {},
      connected: {},
      settings: defaultSettings(),
      shooting: false
    });
  }
  return rooms.get(roomId);
}

function roomState(roomId) {
  const room = getRoom(roomId);
  return {
    roomId,
    users: room.users,
    userCount: room.users.length,
    hostId: room.hostId,
    names: room.names,
    ready: room.ready,
    connected: room.connected,
    settings: room.settings,
    shooting: room.shooting
  };
}

function leaveRoom(socket) {
  const roomId = socket.data.roomId;
  if (!roomId || !rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  room.users = room.users.filter(id => id !== socket.id);
  delete room.names[socket.id];
  delete room.ready[socket.id];
  delete room.connected[socket.id];

  if (room.hostId === socket.id) {
    room.hostId = room.users[0] || null;
  }

  room.shooting = false;

  if (room.users.length === 0) {
    rooms.delete(roomId);
  } else {
    io.to(roomId).emit("peer-left", roomState(roomId));
    io.to(roomId).emit("room-state", roomState(roomId));
  }
}

io.on("connection", socket => {
  socket.on("join-room", ({ roomId, name }) => {
    if (!roomId) return;

    const room = getRoom(roomId);

    if (room.users.length >= 2 && !room.users.includes(socket.id)) {
      socket.emit("room-full");
      return;
    }

    if (!room.users.includes(socket.id)) {
      room.users.push(socket.id);
    }

    if (!room.hostId) {
      room.hostId = socket.id;
    }

    socket.data.roomId = roomId;
    socket.join(roomId);

    room.names[socket.id] = name || "Guest";
    room.ready[socket.id] = false;
    room.connected[socket.id] = false;
    room.shooting = false;

    socket.emit("room-joined", { ...roomState(roomId), yourId: socket.id });
    socket.to(roomId).emit("room-state", roomState(roomId));

    if (room.users.length === 2) {
      const [a, b] = room.users;
      io.to(a).emit("peer-ready", { peerId: b, shouldCreateOffer: true, state: roomState(roomId) });
      io.to(b).emit("peer-ready", { peerId: a, shouldCreateOffer: false, state: roomState(roomId) });
    } else {
      socket.emit("waiting-for-peer", roomState(roomId));
    }
  });

  socket.on("update-profile", ({ name }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = getRoom(roomId);
    room.names[socket.id] = name || "Guest";
    io.to(roomId).emit("room-state", roomState(roomId));
  });

  socket.on("set-ready", ({ ready }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = getRoom(roomId);
    room.ready[socket.id] = Boolean(ready);
    io.to(roomId).emit("room-state", roomState(roomId));
  });

  socket.on("update-settings", ({ settings }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = getRoom(roomId);
    if (socket.id !== room.hostId) return;

    const next = settings || {};
    room.settings = {
      mode: next.mode === "one" ? "one" : "two",
      layout: /^[A-K]$/.test(next.layout) ? next.layout : "B",
      filter: String(next.filter || "boothbw"),
      seconds: Math.max(1, Math.min(Number(next.seconds) || 3, 10))
    };

    io.to(roomId).emit("settings-updated", {
      settings: room.settings,
      state: roomState(roomId)
    });
  });

  socket.on("peer-connected", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).connected[socket.id] = true;
    io.to(roomId).emit("room-state", roomState(roomId));
  });

  socket.on("peer-disconnected", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).connected[socket.id] = false;
    io.to(roomId).emit("room-state", roomState(roomId));
  });

  socket.on("signal", ({ to, data }) => {
    if (!to || !data) return;
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("request-shoot", ({ poses }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = getRoom(roomId);

    if (socket.id !== room.hostId) {
      socket.emit("not-ready", { message: "Only the host can start the photo booth." });
      return;
    }

    if (room.shooting) {
      socket.emit("not-ready", { message: "A shoot is already running." });
      return;
    }

    const mode = room.settings.mode;
    const seconds = room.settings.seconds;
    poses = Math.max(1, Math.min(Number(poses) || 4, 4));

    if (mode === "two") {
      const hasTwo = room.users.length === 2;
      const bothReady = hasTwo && room.users.every(id => room.ready[id]);

      if (!hasTwo) {
        socket.emit("not-ready", { message: "Wait until your friend joins." });
        return;
      }

      if (!bothReady) {
        socket.emit("not-ready", { message: "Both people must press Ready first." });
        return;
      }
    } else {
      if (!room.ready[socket.id]) {
        socket.emit("not-ready", { message: "Press Ready first." });
        return;
      }
    }

    room.shooting = true;
    io.to(roomId).emit("shoot-start", {
      startAt: Date.now() + 900,
      seconds,
      poses,
      mode,
      state: roomState(roomId)
    });
  });

  socket.on("photos-captured", ({ images, name }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !Array.isArray(images)) return;
    socket.to(roomId).emit("peer-photos", { images, name: name || "Friend" });
  });

  socket.on("shoot-complete", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = getRoom(roomId);
    room.shooting = false;
    io.to(roomId).emit("room-state", roomState(roomId));
  });

  socket.on("reset-shoot", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = getRoom(roomId);
    room.shooting = false;
    io.to(roomId).emit("room-state", roomState(roomId));
  });

  socket.on("disconnect", () => leaveRoom(socket));
});

server.listen(PORT, () => {
  console.log(`Cheezy by Billy v12 clean fixed running on http://localhost:${PORT}`);
});
