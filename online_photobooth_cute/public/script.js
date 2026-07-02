const socket = io();

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const shareLink = document.getElementById("shareLink");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const startBtn = document.getElementById("startBtn");
const readyBtn = document.getElementById("readyBtn");
const takeTogetherBtn = document.getElementById("takeTogetherBtn");
const resetBtn = document.getElementById("resetBtn");

const statusTitle = document.getElementById("statusTitle");
const statusEl = document.getElementById("status");
const countdownEl = document.getElementById("countdown");

const nameInput = document.getElementById("nameInput");
const themeSelect = document.getElementById("themeSelect");
const timerSelect = document.getElementById("timerSelect");

const localBadge = document.getElementById("localBadge");
const remoteBadge = document.getElementById("remoteBadge");
const resultBadge = document.getElementById("resultBadge");

const localSub = document.getElementById("localSub");
const remoteSub = document.getElementById("remoteSub");
const resultSub = document.getElementById("resultSub");

const localNameLabel = document.getElementById("localNameLabel");
const remoteNameLabel = document.getElementById("remoteNameLabel");

const localOverlay = document.getElementById("localOverlay");
const remoteOverlay = document.getElementById("remoteOverlay");

const youDot = document.getElementById("youDot");
const friendDot = document.getElementById("friendDot");

const finalCanvas = document.getElementById("finalCanvas");
const ctx = finalCanvas.getContext("2d");
const downloadLink = document.getElementById("downloadLink");

const PHOTO_WIDTH = 520;
const PHOTO_HEIGHT = 390;

let localStream = null;
let peerConnection = null;
let peerId = null;
let yourId = null;
let roomId = getOrCreateRoomId();

let localPhoto = null;
let remotePhoto = null;
let localReady = false;
let remoteReady = false;
let remoteName = "Friend";

const peerConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

shareLink.value = `${location.origin}/room/${roomId}`;
applyTheme(themeSelect.value);
drawEmptyFrame();

startBtn.addEventListener("click", startCameraAndJoin);
copyLinkBtn.addEventListener("click", copyRoomLink);
readyBtn.addEventListener("click", toggleReady);
takeTogetherBtn.addEventListener("click", requestCountdown);
resetBtn.addEventListener("click", resetPhotos);

nameInput.addEventListener("input", () => {
  localNameLabel.textContent = nameInput.value.trim() || "You";
  drawIfReady();
  socket.emit("update-profile", {
    name: getLocalName(),
    theme: themeSelect.value
  });
});

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
  drawIfReady();
  socket.emit("update-profile", {
    name: getLocalName(),
    theme: themeSelect.value
  });
});

function getOrCreateRoomId() {
  const pathParts = location.pathname.split("/").filter(Boolean);
  if (pathParts[0] === "room" && pathParts[1]) return pathParts[1];

  const id = Math.random().toString(36).slice(2, 8).toUpperCase();
  history.replaceState(null, "", `/room/${id}`);
  return id;
}

function getLocalName() {
  return nameInput.value.trim() || "Me";
}

function setStatus(title, message) {
  statusTitle.textContent = title;
  statusEl.textContent = message;
}

function setBadge(element, text, type = "") {
  element.textContent = text;
  element.className = `badge ${type}`;
}

function applyTheme(theme) {
  document.body.className = "";
  document.body.classList.add(`theme-${theme}`);
}

async function copyRoomLink() {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    copyLinkBtn.textContent = "Copied 💕";
    setTimeout(() => (copyLinkBtn.textContent = "Copy Link"), 1300);
  } catch {
    shareLink.select();
    document.execCommand("copy");
  }
}

async function startCameraAndJoin() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus("Camera unsupported", "This browser does not support camera access.");
    return;
  }

  try {
    setStatus("Starting camera", "Allow camera and microphone permission.");

    localStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 960 },
        facingMode: "user"
      },
      audio: true
    });

    localVideo.srcObject = localStream;
    localOverlay.classList.add("hidden");
    localNameLabel.textContent = getLocalName();

    setBadge(localBadge, "Live", "good");
    localSub.textContent = "Camera ready";
    youDot.classList.add("on");

    socket.emit("join-room", {
      roomId,
      name: getLocalName(),
      theme: themeSelect.value
    });

    startBtn.disabled = true;
    readyBtn.disabled = false;

    setStatus("Joined room", "Send the link to your friend and wait for them to join.");
  } catch (error) {
    console.error(error);
    setStatus("Camera blocked", "Allow camera/microphone permission, then try again.");
    setBadge(localBadge, "Blocked", "warn");
  }
}

function createPeerConnection() {
  peerConnection = new RTCPeerConnection(peerConfig);

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
    remoteOverlay.classList.add("hidden");
    setBadge(remoteBadge, remoteReady ? "Ready" : "Connected", remoteReady ? "ready" : "good");
    remoteSub.textContent = remoteReady ? "Friend is ready" : "Friend connected";
    friendDot.classList.add("on");
    updateTakeButton();
    setStatus("Connected", "Both people press I'm Ready, then take the photo together.");
  };

  peerConnection.onicecandidate = event => {
    if (event.candidate && peerId) {
      socket.emit("signal", {
        to: peerId,
        data: {
          type: "candidate",
          candidate: event.candidate
        }
      });
    }
  };

  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection.connectionState;

    if (state === "connected") {
      setBadge(remoteBadge, remoteReady ? "Ready" : "Connected", remoteReady ? "ready" : "good");
    }

    if (["failed", "disconnected", "closed"].includes(state)) {
      setBadge(remoteBadge, "Disconnected", "warn");
      remoteSub.textContent = "Connection lost";
      remoteOverlay.classList.remove("hidden");
      takeTogetherBtn.disabled = true;
      setStatus("Friend disconnected", "Refresh or create a new room.");
    }
  };
}

async function makeOffer() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit("signal", {
    to: peerId,
    data: {
      type: "offer",
      offer
    }
  });
}

async function handleSignal({ from, data }) {
  peerId = from;

  if (!peerConnection) createPeerConnection();

  if (data.type === "offer") {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit("signal", {
      to: peerId,
      data: {
        type: "answer",
        answer
      }
    });
  }

  if (data.type === "answer") {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  }

  if (data.type === "candidate") {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
      console.error("ICE candidate error:", error);
    }
  }
}

function toggleReady() {
  localReady = !localReady;
  readyBtn.textContent = localReady ? "Ready ✓" : "I'm Ready";
  setBadge(localBadge, localReady ? "Ready" : "Live", localReady ? "ready" : "good");
  localSub.textContent = localReady ? "You are ready" : "Camera ready";

  socket.emit("set-ready", { ready: localReady });
  updateTakeButton();
}

function updateTakeButton() {
  takeTogetherBtn.disabled = !(localReady && remoteReady && remoteVideo.srcObject);
}

function requestCountdown() {
  resetPhotos();
  socket.emit("request-countdown", {
    seconds: Number(timerSelect.value)
  });
}

function handleRoomState(state) {
  if (!state) return;

  if (state.roomTheme && state.roomTheme !== themeSelect.value) {
    themeSelect.value = state.roomTheme;
    applyTheme(state.roomTheme);
  }

  const ids = Object.keys(state.names || {});
  const otherId = ids.find(id => id !== yourId);

  if (otherId) {
    remoteName = state.names[otherId] || "Friend";
    remoteNameLabel.textContent = remoteName;
  }

  if (yourId && state.ready) {
    remoteReady = otherId ? Boolean(state.ready[otherId]) : false;
  }

  if (remoteReady) {
    setBadge(remoteBadge, "Ready", "ready");
    remoteSub.textContent = "Friend is ready";
  }

  updateTakeButton();
}

socket.on("room-joined", state => {
  yourId = state.yourId;
  handleRoomState(state);

  if (state.userCount === 1) {
    setStatus("Waiting for friend", "Copy the room link and send it.");
  } else {
    setStatus("Friend found", "Creating live connection.");
  }
});

socket.on("room-state", handleRoomState);

socket.on("waiting-for-peer", () => {
  setBadge(remoteBadge, "Waiting", "warn");
  remoteSub.textContent = "Waiting for friend";
  setStatus("Waiting for friend", "Copy the room link and send it.");
});

socket.on("peer-ready", async ({ peerId: id, shouldCreateOffer, state }) => {
  peerId = id;
  handleRoomState(state);

  setStatus("Connecting", "Friend joined. Building live video connection.");
  setBadge(remoteBadge, "Connecting", "warn");
  remoteSub.textContent = "Connecting...";

  if (!peerConnection) createPeerConnection();

  if (shouldCreateOffer) {
    await makeOffer();
  }
});

socket.on("signal", handleSignal);

socket.on("room-full", () => {
  setStatus("Room is full", "This room already has two people. Create a new room.");
  startBtn.disabled = true;
});

socket.on("peer-left", state => {
  handleRoomState(state);
  setBadge(remoteBadge, "Left", "warn");
  remoteSub.textContent = "Friend left";
  remoteOverlay.classList.remove("hidden");
  friendDot.classList.remove("on");
  takeTogetherBtn.disabled = true;
  remoteReady = false;
  setStatus("Friend left", "Send the link again or create a new room.");
});

socket.on("not-ready", () => {
  setStatus("Not ready yet", "Both people must press I'm Ready first.");
});

socket.on("countdown-start", async ({ startAt, seconds, state }) => {
  handleRoomState(state);
  resetPhotos();

  setStatus("Countdown started", "Smile together!");

  const delay = Math.max(0, startAt - Date.now());
  await sleep(delay);
  await runCountdown(seconds);

  localPhoto = captureFromVideo(localVideo, true);
  socket.emit("photo-captured", {
    imageData: localPhoto,
    name: getLocalName()
  });

  tryRenderFinal();
});

socket.on("peer-photo", ({ imageData, name }) => {
  remotePhoto = imageData;
  if (name) {
    remoteName = name;
    remoteNameLabel.textContent = remoteName;
  }
  tryRenderFinal();
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCountdown(seconds) {
  countdownEl.classList.remove("hidden");

  for (let i = seconds; i > 0; i--) {
    countdownEl.textContent = i;
    await sleep(1000);
  }

  countdownEl.textContent = "♡";
  await sleep(450);
  countdownEl.classList.add("hidden");
}

function captureFromVideo(video, mirror = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 750;
  const tempCtx = canvas.getContext("2d");

  if (mirror) {
    tempCtx.translate(canvas.width, 0);
    tempCtx.scale(-1, 1);
  }

  tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

async function tryRenderFinal() {
  if (!localPhoto || !remotePhoto) {
    setBadge(resultBadge, "Waiting", "warn");
    resultSub.textContent = "Waiting for both photos.";
    setStatus("Photo captured", "Waiting for the other photo.");
    return;
  }

  const localImg = await loadImage(localPhoto);
  const remoteImg = await loadImage(remotePhoto);

  drawFinalFrame(localImg, remoteImg);

  downloadLink.href = finalCanvas.toDataURL("image/png");
  downloadLink.classList.remove("disabled");

  setBadge(resultBadge, "Ready", "good");
  resultSub.textContent = "Your cute frame is ready.";
  resetBtn.disabled = false;
  setStatus("Final photo ready", "Download your cute combined frame!");
}

function themeColors() {
  const styles = getComputedStyle(document.body);
  return {
    main: styles.getPropertyValue("--main").trim(),
    dark: styles.getPropertyValue("--main-dark").trim(),
    soft: styles.getPropertyValue("--soft").trim(),
    text: styles.getPropertyValue("--text").trim(),
    muted: styles.getPropertyValue("--muted").trim()
  };
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fillRoundRect(x, y, w, h, r, color) {
  ctx.fillStyle = color;
  roundRect(x, y, w, h, r);
  ctx.fill();
}

function strokeRoundRect(x, y, w, h, r, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  roundRect(x, y, w, h, r);
  ctx.stroke();
}

function drawCuteBackground(colors) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  ctx.fillStyle = colors.soft;
  ctx.beginPath();
  ctx.arc(170, 160, 170, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(1240, 860, 210, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.main;
  ctx.globalAlpha = 0.13;
  for (let i = 0; i < 22; i++) {
    const x = 80 + (i * 137) % 1260;
    const y = 150 + (i * 83) % 740;
    ctx.font = `${24 + (i % 3) * 10}px Arial`;
    ctx.fillText(i % 2 === 0 ? "♡" : "✦", x, y);
  }
  ctx.globalAlpha = 1;
}

function drawEmptyFrame() {
  const colors = themeColors();
  drawCuteBackground(colors);

  ctx.textAlign = "center";
  ctx.fillStyle = colors.dark;
  ctx.font = "bold 68px Arial";
  ctx.fillText("CUTE ONLINE PHOTO BOOTH", finalCanvas.width / 2, 105);

  ctx.fillStyle = colors.main;
  ctx.font = "36px Arial";
  ctx.fillText("♡ waiting for your together moment ♡", finalCanvas.width / 2, 160);

  drawPhotoPlaceholder(100, 235, PHOTO_WIDTH, PHOTO_HEIGHT, "You");
  drawPhotoPlaceholder(780, 235, PHOTO_WIDTH, PHOTO_HEIGHT, "Friend");

  ctx.fillStyle = colors.muted;
  ctx.font = "26px Arial";
  ctx.fillText("Start camera, connect, get ready, and take one frame together.", finalCanvas.width / 2, 780);

  drawFooter(colors);
}

function drawPhotoPlaceholder(x, y, w, h, label) {
  const colors = themeColors();
  fillRoundRect(x - 18, y - 18, w + 36, h + 36, 36, "#ffffff");
  strokeRoundRect(x - 18, y - 18, w + 36, h + 36, 36, colors.main, 6);
  fillRoundRect(x, y, w, h, 26, colors.soft);

  ctx.fillStyle = colors.dark;
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  ctx.fillText(label, x + w / 2, y + h / 2);
}

function drawFinalFrame(leftImg, rightImg) {
  const colors = themeColors();
  drawCuteBackground(colors);

  ctx.textAlign = "center";
  ctx.fillStyle = colors.dark;
  ctx.font = "bold 70px Arial";
  ctx.fillText("ONLINE PHOTO BOOTH", finalCanvas.width / 2, 105);

  ctx.fillStyle = colors.main;
  ctx.font = "38px Arial";
  ctx.fillText("♡ together from anywhere ♡", finalCanvas.width / 2, 160);

  drawPhotoCard(leftImg, 90, 235, PHOTO_WIDTH, PHOTO_HEIGHT, getLocalName());
  drawPhotoCard(rightImg, 790, 235, PHOTO_WIDTH, PHOTO_HEIGHT, remoteName);

  ctx.fillStyle = colors.dark;
  ctx.font = "bold 42px Arial";
  ctx.fillText("same frame, different places", finalCanvas.width / 2, 760);

  ctx.fillStyle = colors.muted;
  ctx.font = "26px Arial";
  ctx.fillText(new Date().toLocaleString(), finalCanvas.width / 2, 812);

  drawFooter(colors);
}

function drawPhotoCard(img, x, y, w, h, name) {
  const colors = themeColors();

  fillRoundRect(x - 22, y - 22, w + 44, h + 92, 40, "#ffffff");
  strokeRoundRect(x - 22, y - 22, w + 44, h + 92, 40, colors.main, 7);

  ctx.save();
  roundRect(x, y, w, h, 30);
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();

  ctx.fillStyle = colors.dark;
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "center";
  ctx.fillText(name, x + w / 2, y + h + 54);

  ctx.fillStyle = colors.main;
  ctx.font = "36px Arial";
  ctx.fillText("♡", x + w - 30, y + 44);
}

function drawFooter(colors) {
  ctx.fillStyle = colors.main;
  fillRoundRect(395, 885, 610, 18, 999, colors.main);

  ctx.fillStyle = colors.muted;
  ctx.font = "22px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Made with Cute Online Photo Booth", finalCanvas.width / 2, 940);
}

function drawIfReady() {
  if (localPhoto && remotePhoto) {
    Promise.all([loadImage(localPhoto), loadImage(remotePhoto)]).then(([left, right]) => {
      drawFinalFrame(left, right);
      downloadLink.href = finalCanvas.toDataURL("image/png");
    });
  } else {
    drawEmptyFrame();
  }
}

function resetPhotos() {
  localPhoto = null;
  remotePhoto = null;
  drawEmptyFrame();
  downloadLink.classList.add("disabled");
  downloadLink.removeAttribute("href");
  resetBtn.disabled = true;
  setBadge(resultBadge, "Not ready");
  resultSub.textContent = "Your combined result appears here.";
}
