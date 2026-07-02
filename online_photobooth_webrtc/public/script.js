const socket = io();

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const shareLink = document.getElementById("shareLink");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const startBtn = document.getElementById("startBtn");
const takeTogetherBtn = document.getElementById("takeTogetherBtn");
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("status");
const countdownEl = document.getElementById("countdown");
const finalCanvas = document.getElementById("finalCanvas");
const ctx = finalCanvas.getContext("2d");
const downloadLink = document.getElementById("downloadLink");

const localBadge = document.getElementById("localBadge");
const remoteBadge = document.getElementById("remoteBadge");
const resultBadge = document.getElementById("resultBadge");

let localStream = null;
let peerConnection = null;
let peerId = null;
let roomId = getOrCreateRoomId();

let localPhoto = null;
let remotePhoto = null;

const peerConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

shareLink.value = `${location.origin}/room/${roomId}`;

startBtn.addEventListener("click", startCameraAndJoin);
copyLinkBtn.addEventListener("click", copyRoomLink);
takeTogetherBtn.addEventListener("click", () => {
  resetPhotos();
  socket.emit("request-countdown");
});
resetBtn.addEventListener("click", resetPhotos);

drawEmptyFrame();

function getOrCreateRoomId() {
  const pathParts = location.pathname.split("/").filter(Boolean);
  if (pathParts[0] === "room" && pathParts[1]) return pathParts[1];

  const id = Math.random().toString(36).slice(2, 8).toUpperCase();
  history.replaceState(null, "", `/room/${id}`);
  return id;
}

function setStatus(message) {
  statusEl.textContent = message;
}

function setBadge(element, text, type = "") {
  element.textContent = text;
  element.className = `badge ${type}`;
}

async function copyRoomLink() {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    copyLinkBtn.textContent = "Copied!";
    setTimeout(() => (copyLinkBtn.textContent = "Copy Link"), 1300);
  } catch {
    shareLink.select();
    document.execCommand("copy");
  }
}

async function startCameraAndJoin() {
  try {
    setStatus("Requesting camera permission...");

    localStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 960 },
        facingMode: "user"
      },
      audio: true
    });

    localVideo.srcObject = localStream;
    setBadge(localBadge, "Live", "good");

    socket.emit("join-room", { roomId });

    startBtn.disabled = true;
    setStatus("Joined room. Send the link to your friend.");
  } catch (error) {
    console.error(error);
    setStatus("Camera or microphone access failed. Allow permissions and try again.");
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
    setBadge(remoteBadge, "Connected", "good");
    takeTogetherBtn.disabled = false;
    setStatus("Connected! Press Take Together when both people are ready.");
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
    if (["failed", "disconnected", "closed"].includes(peerConnection.connectionState)) {
      setBadge(remoteBadge, "Disconnected", "warn");
      takeTogetherBtn.disabled = true;
      setStatus("Peer disconnected. Refresh or create a new room.");
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

socket.on("room-joined", ({ userCount }) => {
  setStatus(userCount === 1 ? "Waiting for your friend to join..." : "Friend found. Connecting...");
});

socket.on("waiting-for-peer", () => {
  setBadge(remoteBadge, "Waiting", "warn");
  setStatus("Waiting. Send the room link to your friend.");
});

socket.on("peer-ready", async ({ peerId: id, shouldCreateOffer }) => {
  peerId = id;
  setStatus("Friend joined. Creating live connection...");
  setBadge(remoteBadge, "Connecting", "warn");

  if (!peerConnection) createPeerConnection();

  if (shouldCreateOffer) {
    await makeOffer();
  }
});

socket.on("signal", handleSignal);

socket.on("room-full", () => {
  setStatus("This room is full. Create a new room.");
  startBtn.disabled = true;
});

socket.on("peer-left", () => {
  setBadge(remoteBadge, "Left", "warn");
  takeTogetherBtn.disabled = true;
  setStatus("Your friend left the room.");
});

socket.on("countdown-start", async ({ startAt, seconds }) => {
  resetPhotos();

  const delay = Math.max(0, startAt - Date.now());
  await sleep(delay);
  await runCountdown(seconds);

  localPhoto = captureFromVideo(localVideo, true);
  socket.emit("photo-captured", { imageData: localPhoto });

  tryRenderFinal();
});

socket.on("peer-photo", ({ imageData }) => {
  remotePhoto = imageData;
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

  countdownEl.textContent = "Smile!";
  await sleep(420);
  countdownEl.classList.add("hidden");
}

function captureFromVideo(video, mirror = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
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
    setStatus("Photo taken. Waiting for the other photo...");
    return;
  }

  const localImg = await loadImage(localPhoto);
  const remoteImg = await loadImage(remotePhoto);

  drawFinalFrame(localImg, remoteImg);

  downloadLink.href = finalCanvas.toDataURL("image/png");
  downloadLink.classList.remove("disabled");

  setBadge(resultBadge, "Ready", "good");
  resetBtn.disabled = false;
  setStatus("Final photo is ready!");
}

function drawEmptyFrame() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 56px Arial";
  ctx.textAlign = "center";
  ctx.fillText("ONLINE PHOTO BOOTH", finalCanvas.width / 2, 100);

  ctx.fillStyle = "#f97316";
  ctx.fillRect(300, 130, 600, 10);

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(90, 190, 480, 360);
  ctx.fillRect(630, 190, 480, 360);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 5;
  ctx.strokeRect(90, 190, 480, 360);
  ctx.strokeRect(630, 190, 480, 360);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 32px Arial";
  ctx.fillText("You", 330, 380);
  ctx.fillText("Friend", 870, 380);

  ctx.fillStyle = "#64748b";
  ctx.font = "24px Arial";
  ctx.fillText("Take a photo together to fill this frame", finalCanvas.width / 2, 680);
}

function drawFinalFrame(leftImg, rightImg) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 56px Arial";
  ctx.textAlign = "center";
  ctx.fillText("ONLINE PHOTO BOOTH", finalCanvas.width / 2, 92);

  ctx.fillStyle = "#f97316";
  ctx.fillRect(300, 120, 600, 10);

  drawPhoto(leftImg, 80, 170, 500, 375);
  drawPhoto(rightImg, 620, 170, 500, 375);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 34px Arial";
  ctx.fillText("Together from anywhere", finalCanvas.width / 2, 640);

  ctx.fillStyle = "#64748b";
  ctx.font = "24px Arial";
  ctx.fillText(new Date().toLocaleString(), finalCanvas.width / 2, 684);

  ctx.fillStyle = "#f97316";
  ctx.fillRect(300, 720, 600, 10);
}

function drawPhoto(img, x, y, w, h) {
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(x - 16, y - 16, w + 32, h + 32);

  ctx.drawImage(img, x, y, w, h);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 10;
  ctx.strokeRect(x, y, w, h);
}

function resetPhotos() {
  localPhoto = null;
  remotePhoto = null;
  drawEmptyFrame();
  downloadLink.classList.add("disabled");
  downloadLink.removeAttribute("href");
  resetBtn.disabled = true;
  setBadge(resultBadge, "Not ready");
}
