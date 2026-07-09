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

const redeemCodes = new Map();
const REDEEM_TOKENS = 5;

function makeRedeemCode() {
  let code = "";
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (redeemCodes.has(code));
  return code;
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/admin/create-code", (req, res) => {
  const code = makeRedeemCode();
  const tokens = REDEEM_TOKENS;
  redeemCodes.set(code, {
    code,
    tokens,
    used: false,
    createdAt: new Date().toISOString(),
    usedAt: null
  });
  res.json({ ok: true, code, tokens });
});

app.get("/api/admin/codes", (req, res) => {
  res.json({
    codes: Array.from(redeemCodes.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  });
});

app.post("/api/redeem-code", (req, res) => {
  const code = String((req.body && req.body.code) || "").replace(/\D/g, "").slice(0, 6);

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ ok: false, message: "Enter a valid 6 digit code." });
  }

  const item = redeemCodes.get(code);

  if (!item) {
    return res.status(404).json({ ok: false, message: "Code not found." });
  }

  if (item.used) {
    return res.status(409).json({ ok: false, message: "This code was already used." });
  }

  item.used = true;
  item.usedAt = new Date().toISOString();
  res.json({ ok: true, tokens: item.tokens, message: `Code accepted. ${item.tokens} tokens added.` });
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/room/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function defaultSettings() {
  return {
    mode: "two",
    poseCount: 4,
    frameId: "classic-black-4",
    filter: "boothbw",
    seconds: 3
  };
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

function state(roomId) {
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
    io.to(roomId).emit("peer-left", state(roomId));
    io.to(roomId).emit("room-state", state(roomId));
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

    socket.emit("room-joined", { ...state(roomId), yourId: socket.id });
    socket.to(roomId).emit("room-state", state(roomId));

    if (room.users.length === 2) {
      const [a, b] = room.users;
      io.to(a).emit("peer-ready", { peerId: b, shouldCreateOffer: true, state: state(roomId) });
      io.to(b).emit("peer-ready", { peerId: a, shouldCreateOffer: false, state: state(roomId) });
    } else {
      socket.emit("waiting-for-peer", state(roomId));
    }
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

  socket.on("update-settings", ({ settings }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = getRoom(roomId);
    if (socket.id !== room.hostId) return;

    const next = settings || {};
    const mode = next.mode === "one" ? "one" : "two";
    let poseCount = Number(next.poseCount) || 4;
    const allowed = mode === "one" ? [1, 2, 4, 6] : [2, 4, 6];
    if (!allowed.includes(poseCount)) poseCount = mode === "one" ? 1 : 2;

    room.settings = {
      mode,
      poseCount,
      frameId: String(next.frameId || "classic-black-4"),
      filter: String(next.filter || "boothbw"),
      seconds: Math.max(1, Math.min(Number(next.seconds) || 3, 10))
    };

    io.to(roomId).emit("settings-updated", {
      settings: room.settings,
      state: state(roomId)
    });
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

  socket.on("request-shoot", () => {
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

    const { mode, poseCount, seconds } = room.settings;

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
    } else if (!room.ready[socket.id]) {
      socket.emit("not-ready", { message: "Press Ready first." });
      return;
    }

    room.shooting = true;
    io.to(roomId).emit("shoot-start", {
      startAt: Date.now() + 900,
      seconds,
      poseCount,
      mode,
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

  socket.on("reset-shoot", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    getRoom(roomId).shooting = false;
    io.to(roomId).emit("room-state", state(roomId));
  });

  socket.on("disconnect", () => leaveRoom(socket));
});

server.listen(PORT, () => {
  console.log(`Cheezy by Billy v21 redeem/contact running on http://localhost:${PORT}`);
});
