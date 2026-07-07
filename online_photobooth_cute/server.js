const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  maxHttpBufferSize: 30e6,
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 30000,
  pingInterval: 10000
});

const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));

app.get("/room/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { users: [], names: {}, ready: {}, connected: {}, shooting: false, hostId: null, settings: { mode: 'two', layout: 'B', filter: 'boothbw', seconds: 3 } });
  }
  return rooms.get(roomId);
}

function state(roomId) {
  const r = getRoom(roomId);
  return {
    roomId,
    userCount: r.users.length,
    names: r.names,
    ready: r.ready,
    connected: r.connected,
    shooting: r.shooting,
    hostId: r.hostId,
    settings: r.settings
  };
}

function leave(socket) {
  const roomId = socket.data.roomId;
  if (!roomId || !rooms.has(roomId)) return;

  const r = rooms.get(roomId);
  r.users = r.users.filter(id => id !== socket.id);
  delete r.names[socket.id];
  delete r.ready[socket.id];
  delete r.connected[socket.id];
  if (r.hostId === socket.id) r.hostId = r.users[0] || null;
  r.shooting = false;

  if (r.users.length === 0) {
    rooms.delete(roomId);
  } else {
    io.to(roomId).emit("peer-left", state(roomId));
  }
}

io.on("connection", socket => {
  socket.on("join-room", ({ roomId, name }) => {
    if (!roomId) return;

    const r = getRoom(roomId);

    if (r.users.length >= 2 && !r.users.includes(socket.id)) {
      socket.emit("room-full");
      return;
    }

    if (!r.users.includes(socket.id)) {
      r.users.push(socket.id);
      if (!r.hostId) r.hostId = socket.id;
    }

    socket.data.roomId = roomId;
    socket.join(roomId);

    r.names[socket.id] = name || "Guest";
    r.ready[socket.id] = false;
    r.connected[socket.id] = false;
    r.shooting = false;

    socket.emit("room-joined", { ...state(roomId), yourId: socket.id });
    socket.to(roomId).emit("room-state", state(roomId));

    if (r.users.length === 1) {
      socket.emit("waiting-for-peer", state(roomId));
      return;
    }

    const [a, b] = r.users;

    io.to(a).emit("peer-ready", {
      peerId: b,
      shouldCreateOffer: true,
      state: state(roomId)
    });

    io.to(b).emit("peer-ready", {
      peerId: a,
      shouldCreateOffer: false,
      state: state(roomId)
    });
  });

  socket.on("update-profile", ({ name }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).names[socket.id] = name || "Guest";
    io.to(roomId).emit("room-state", state(roomId));
  });

  socket.on("set-ready", ({ ready }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).ready[socket.id] = Boolean(ready);
    io.to(roomId).emit("room-state", state(roomId));
  });

  socket.on("peer-connected", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).connected[socket.id] = true;
    io.to(roomId).emit("room-state", state(roomId));
  });

  socket.on("peer-disconnected", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).connected[socket.id] = false;
    io.to(roomId).emit("room-state", state(roomId));
  });

  socket.on("signal", ({ to, data }) => {
    if (!to || !data) return;
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("update-settings", ({ settings }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const r = getRoom(roomId);
    if (socket.id !== r.hostId) return;

    r.settings = {
      mode: settings?.mode === "one" ? "one" : "two",
      layout: String(settings?.layout || "B").slice(0, 1),
      filter: String(settings?.filter || "boothbw"),
      seconds: Math.max(1, Math.min(Number(settings?.seconds) || 3, 10))
    };

    io.to(roomId).emit("settings-updated", {
      settings: r.settings,
      state: state(roomId)
    });
  });

  socket.on("request-shoot", ({ mode = "two", poses = 4, seconds = 3 }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const r = getRoom(roomId);

    if (socket.id !== r.hostId) {
      socket.emit("not-ready", { message: "Only the host can start the booth." });
      return;
    }

    mode = r.settings.mode || mode;
    seconds = Math.max(1, Math.min(Number(r.settings.seconds || seconds) || 3, 10));
    poses = Math.max(1, Math.min(Number(poses) || 4, 4));

    if (r.shooting) {
      socket.emit("not-ready", { message: "A shoot is already running." });
      return;
    }

    if (mode === "two") {
      const twoUsers = r.users.length === 2;
      const bothReady = twoUsers && r.users.every(id => r.ready[id]);

      if (!twoUsers) {
        socket.emit("not-ready", { message: "Wait until your friend joins." });
        return;
      }

      if (!bothReady) {
        socket.emit("not-ready", { message: "Both people must press Ready." });
        return;
      }

      r.shooting = true;

      io.to(roomId).emit("shoot-start", {
        startAt: Date.now() + 900,
        seconds,
        poses,
        mode: "two",
        state: state(roomId)
      });
      return;
    }

    if (!r.ready[socket.id]) {
      socket.emit("not-ready", { message: "Press Ready first." });
      return;
    }

    r.shooting = true;

    socket.emit("shoot-start", {
      startAt: Date.now() + 500,
      seconds,
      poses,
      mode: "one",
      state: state(roomId)
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
    getRoom(roomId).shooting = false;
    io.to(roomId).emit("room-state", state(roomId));
  });

  socket.on("reset-ready", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const r = getRoom(roomId);
    r.shooting = false;
    io.to(roomId).emit("room-state", state(roomId));
  });

  socket.on("disconnect", () => leave(socket));
});

server.listen(PORT, () => {
  console.log(`Cheezy by Billy v10 Austria Safe running on http://localhost:${PORT}`);
});
