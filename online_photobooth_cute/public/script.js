const socket = io();
const $ = id => document.getElementById(id);

const localVideo = $("localVideo");
const remoteVideo = $("remoteVideo");
const shareLink = $("shareLink");
const copyLinkBtn = $("copyLinkBtn");
const startBtn = $("startBtn");
const readyBtn = $("readyBtn");
const shootBtn = $("shootBtn");
const resetBtn = $("resetBtn");
const statusTitle = $("statusTitle");
const statusEl = $("status");
const countdownEl = $("countdown");
const countdownText = $("countdownText");
const countdownPose = $("countdownPose");
const nameInput = $("nameInput");
const modeSelect = $("modeSelect");
const layoutSelect = $("layoutSelect");
const filterSelect = $("filterSelect");
const timerSelect = $("timerSelect");
const poseNote = $("poseNote");
const localBadge = $("localBadge");
const remoteBadge = $("remoteBadge");
const resultBadge = $("resultBadge");
const localSub = $("localSub");
const remoteSub = $("remoteSub");
const resultSub = $("resultSub");
const localNameLabel = $("localNameLabel");
const remoteNameLabel = $("remoteNameLabel");
const localOverlay = $("localOverlay");
const remoteOverlay = $("remoteOverlay");
const friendCard = $("friendCard");
const youDot = $("youDot");
const friendDot = $("friendDot");
const roomChip = $("roomChip");
const roleChip = $("roleChip");
const languageBtn = $("languageBtn");
const finalCanvas = $("finalCanvas");
const ctx = finalCanvas.getContext("2d");
const downloadLink = $("downloadLink");

const TEXT = {
  en: {
    btn: "MN",
    tagline: "vintage online photo booth",
    heroTitle: "Let’s get Cheezy",
    nameLabel: "Name",
    modeLabel: "Mode",
    layoutLabel: "Layout",
    filterLabel: "Filter",
    timerLabel: "Seconds each turn",
    shareLabel: "Send this room link",
    copyLink: "Copy link",
    readyToStart: "Ready to start",
    initialStatus: "Start your camera. In 2-person mode, send the room link to your friend.",
    youTitle: "You",
    friendTitle: "Friend",
    cameraNotStarted: "Camera not started",
    offline: "offline",
    startCameraShort: "Start camera",
    waitingForFriend: "Waiting for friend",
    waiting: "waiting",
    sendRoomLink: "Send room link",
    startJoin: "Start camera & join",
    imReady: "I'm ready",
    readyDone: "Ready ✓",
    startBooth: "Start photo booth",
    retake: "Retake",
    finalPrint: "Final booth print",
    resultHint: "Choose layout and filter, then start the booth.",
    notReady: "not ready",
    downloadPng: "Download PNG",
    modeOne: "1 person",
    modeTwo: "2 people",
    filterNone: "No filter",
    filterContrast: "More contrast",
    filterBoothBw: "Vintage booth B/W",
    filterOldBw: "Old black & white",
    filterVintage: "Retro warm",
    filterSoft: "Soft pastel",
    timer2: "2 seconds",
    timer3: "3 seconds",
    timer5: "5 seconds",
    timer7: "7 seconds",
    hostRole: "Host",
    guestRole: "Guest",
    guestNote: "Guest mode: press Ready and wait for the host to start.",
    copied: "Copied",
    live: "live",
    ready: "ready",
    connected: "connected",
    cameraReady: "Camera ready",
    youReady: "You are ready",
    friendReady: "Friend is ready",
    friendConnected: "Friend connected",
    waitingSets: "Waiting for both photo sets.",
    finalReady: "Your Cheezy by Billy print is ready."
  },
  mn: {
    btn: "EN",
    tagline: "чимэг онлайн фото booth",
    heroTitle: "Cheezy зураг авцгаая",
    nameLabel: "Нэр",
    modeLabel: "Горим",
    layoutLabel: "Зургийн загвар",
    filterLabel: "Өнгөний эффект",
    timerLabel: "Зураг бүрийн хугацаа",
    shareLabel: "Найздаа явуулах холбоос",
    copyLink: "Холбоос хуулах",
    readyToStart: "Эхлэхэд бэлэн",
    initialStatus: "Камераа асаана уу. 2 хүний горимд холбоосоо найздаа явуулаарай.",
    youTitle: "Та",
    friendTitle: "Найз",
    cameraNotStarted: "Камер асаагүй байна",
    offline: "асаагүй",
    startCameraShort: "Камераа асаах",
    waitingForFriend: "Найзыгаа хүлээж байна",
    waiting: "хүлээж байна",
    sendRoomLink: "Холбоосоо явуулна уу",
    startJoin: "Камер асааж орох",
    imReady: "Би бэлэн",
    readyDone: "Бэлэн ✓",
    startBooth: "Зураг авч эхлэх",
    retake: "Дахин авах",
    finalPrint: "Бэлэн зураг",
    resultHint: "Загвар, эффектээ сонгоод зураг авч эхлээрэй.",
    notReady: "бэлэн биш",
    downloadPng: "PNG татах",
    modeOne: "1 хүн",
    modeTwo: "2 хүн",
    filterNone: "Эффектгүй",
    filterContrast: "Контраст нэмэх",
    filterBoothBw: "Хуучны booth хар-цагаан",
    filterOldBw: "Сонгодог хар-цагаан",
    filterVintage: "Дулаан ретро",
    filterSoft: "Зөөлөн пастел",
    timer2: "2 секунд",
    timer3: "3 секунд",
    timer5: "5 секунд",
    timer7: "7 секунд",
    hostRole: "Host",
    guestRole: "Guest",
    guestNote: "Guest горим: Бэлэн дарж host эхлүүлэхийг хүлээнэ.",
    copied: "Хуулагдлаа",
    live: "асаалттай",
    ready: "бэлэн",
    connected: "холбогдсон",
    cameraReady: "Камер бэлэн",
    youReady: "Та бэлэн байна",
    friendReady: "Найз бэлэн байна",
    friendConnected: "Найз холбогдлоо",
    waitingSets: "Хоёр хүний зураг бүрэн орохыг хүлээж байна.",
    finalReady: "Cheezy by Billy зураг бэлэн боллоо."
  }
};

let lang = localStorage.getItem("cheezyLang") || "en";

function tr(key) {
  return (TEXT[lang] && TEXT[lang][key]) || TEXT.en[key] || key;
}

function renderHeroTitle() {
  const hero = document.getElementById("heroTitle");
  if (!hero) return;
  const text = lang === "mn" ? "Cheezy зураг авцгаая" : "Let’s get Cheezy";
  hero.setAttribute("aria-label", text);
  hero.innerHTML = "";
  [...text].forEach((ch, index) => {
    const span = document.createElement("span");
    span.className = ch === " " ? "letter space" : "letter";
    span.style.setProperty("--i", index);
    span.textContent = ch === " " ? "" : ch;
    hero.appendChild(span);
  });
}

const LAYOUTS = {
  A: { name: "Layout A", size: "2x6", poses: 3, w: 800, h: 2400, slots: [[80,80,640,520],[80,640,640,520],[80,1200,640,520]] },
  B: { name: "Layout B", size: "2x6", poses: 4, w: 800, h: 2400, slots: [[80,80,640,440],[80,560,640,440],[80,1040,640,440],[80,1520,640,440]] },
  C: { name: "Layout C", size: "4x6", poses: 4, w: 1600, h: 2400, slots: [[100,120,680,860],[820,120,680,860],[100,1040,680,860],[820,1040,680,860]] },
  D: { name: "Layout D", size: "4x6", poses: 1, w: 1600, h: 2400, slots: [[160,160,1280,1700]] },
  E: { name: "Layout E", size: "4x6", poses: 2, w: 1600, h: 2400, slots: [[140,120,1320,820],[140,980,1320,820]] },
  F: { name: "Layout F", size: "4x6", poses: 1, w: 1600, h: 2400, slots: [[120,320,1360,820]] },
  G: { name: "Layout G", size: "4x6", poses: 2, w: 1600, h: 2400, slots: [[120,260,660,560],[820,260,660,560]] },
  H: { name: "Layout H", size: "4x6", poses: 4, w: 1600, h: 2400, slots: [[120,120,620,620],[120,790,420,430],[590,790,420,430],[1060,790,420,430]] },
  I: { name: "Layout I", size: "4x6", poses: 3, w: 1600, h: 2400, slots: [[120,130,650,540],[120,720,650,540],[820,720,650,540]] },
  J: { name: "Layout J", size: "4x6", poses: 3, w: 1600, h: 2400, slots: [[120,130,650,540],[820,130,650,540],[120,720,650,540]] },
  K: { name: "Layout K", size: "4x6", poses: 2, w: 1600, h: 2400, slots: [[120,140,650,540],[120,730,650,540]] }
};

let localStream = null;
let pc = null;
let peerId = null;
let yourId = null;
let roomId = getRoom();
let localReady = false;
let remoteReady = false;
let connected = false;
let isHost = true;
let roleKnown = false;
let remoteName = "Friend";
let localPhotos = [];
let remotePhotos = [];
let shooting = false;
let roomSettings = { mode: "two", layout: "B", filter: "boothbw", seconds: 3 };

const peerConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

shareLink.value = `${location.origin}/room/${roomId}`;
roomChip.textContent = `Room ${roomId}`;

function getRoom() {
  const parts = location.pathname.split("/").filter(Boolean);
  if (parts[0] === "room" && parts[1]) return parts[1];
  const id = Math.random().toString(36).slice(2, 8).toUpperCase();
  history.replaceState(null, "", `/room/${id}`);
  return id;
}

function getName() {
  return nameInput.value.trim() || "Me";
}

function layout() {
  return LAYOUTS[layoutSelect.value] || LAYOUTS.B;
}

function setStatus(title, message) {
  statusTitle.textContent = title;
  statusEl.textContent = message;
}

function badge(el, text, cls = "") {
  el.textContent = text;
  el.className = cls;
}

function applyLanguage() {
  document.body.classList.toggle("lang-mn", lang === "mn");
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = tr(el.dataset.i18n);
  });
  languageBtn.textContent = tr("btn");
  renderHeroTitle();
  roleChip.textContent = isHost ? tr("hostRole") : tr("guestRole");
  readyBtn.textContent = localReady ? tr("readyDone") : tr("imReady");
  updatePoseNote();
}

function updatePoseNote() {
  const l = layout();
  if (modeSelect.value === "two") {
    const hostTurns = Math.ceil(l.poses / 2);
    const guestTurns = Math.floor(l.poses / 2);
    let order = [];
    for (let i = 1; i <= l.poses; i++) {
      order.push(`${i}) ${i % 2 === 1 ? "Host" : "Guest"}`);
    }
    poseNote.textContent = `${l.name}: ${l.poses} slots — ${order.join(", ")}. Host takes ${hostTurns}; Guest takes ${guestTurns}. Each turn ${timerSelect.value}s.`;
  } else {
    poseNote.textContent = `${l.name}: ${l.poses} photo${l.poses > 1 ? "s" : ""}, ${timerSelect.value}s each.`;
  }
}

function currentSettings() {
  return {
    mode: modeSelect.value,
    layout: layoutSelect.value,
    filter: filterSelect.value,
    seconds: Number(timerSelect.value)
  };
}

function emitSettings() {
  if (!isHost || !yourId) return;
  socket.emit("update-settings", { settings: currentSettings() });
}

function applySettings(settings) {
  if (!settings) return;
  roomSettings = settings;

  if (!isHost) {
    modeSelect.value = settings.mode || "two";
    layoutSelect.value = settings.layout || "B";
    filterSelect.value = settings.filter || "boothbw";
    timerSelect.value = String(settings.seconds || 3);
  }

  updateModeUI(false);
  updatePoseNote();
  updateLayoutCards();
  drawEmptyFrame();
}

function applyRoleUI() {
  document.body.classList.toggle("host-role", roleKnown && isHost);
  document.body.classList.toggle("guest-role", roleKnown && !isHost);
  roleChip.textContent = isHost ? tr("hostRole") : tr("guestRole");

  layoutSelect.disabled = !isHost;
  filterSelect.disabled = !isHost;
  timerSelect.disabled = !isHost;

  updateShootButton();
}

function updateModeUI(emit = true) {
  document.body.classList.toggle("solo-mode", modeSelect.value === "one");

  if (modeSelect.value === "one") {
    remoteReady = false;
    setStatus("Solo mode", "Start camera, press Ready, then start the booth.");
  } else {
    setStatus("Two-person mode", "Both people join and press Ready. Host starts the booth.");
  }

  if (emit) emitSettings();
  updateShootButton();
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    copyLinkBtn.textContent = tr("copied");
    setTimeout(() => copyLinkBtn.textContent = tr("copyLink"), 1200);
  } catch {
    shareLink.select();
    document.execCommand("copy");
  }
}

async function startCameraAndJoin() {
  try {
    setStatus("Starting camera", "Allow camera permission.");
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: "user" },
      audio: true
    });

    localVideo.srcObject = localStream;
    await localVideo.play();

    localOverlay.classList.add("hidden");
    localNameLabel.textContent = getName();
    badge(localBadge, tr("live"), "good");
    localSub.textContent = tr("cameraReady");
    youDot.classList.add("on");

    socket.emit("join-room", { roomId, name: getName() });

    startBtn.disabled = true;
    readyBtn.disabled = false;
    setStatus("Joined", modeSelect.value === "two" ? "Send the link to your friend." : "Press Ready, then start.");
    updateShootButton();
  } catch (err) {
    console.error(err);
    setStatus("Camera blocked", "Allow camera/microphone permission, then try again.");
    badge(localBadge, "blocked", "warn");
  }
}

function makePC() {
  if (!localStream) return;
  if (pc) pc.close();

  pc = new RTCPeerConnection(peerConfig);
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.play().catch(() => {});
    remoteOverlay.classList.add("hidden");
    connected = true;
    friendDot.classList.add("on");
    badge(remoteBadge, remoteReady ? tr("ready") : tr("connected"), remoteReady ? "ready" : "good");
    remoteSub.textContent = remoteReady ? tr("friendReady") : tr("friendConnected");
    socket.emit("peer-connected");
    updateShootButton();
  };

  pc.onicecandidate = event => {
    if (event.candidate && peerId) {
      socket.emit("signal", { to: peerId, data: { type: "candidate", candidate: event.candidate } });
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "connected") {
      connected = true;
      socket.emit("peer-connected");
    }
    if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
      connected = false;
      socket.emit("peer-disconnected");
      friendDot.classList.remove("on");
      badge(remoteBadge, "optional live off", "warn");
      remoteSub.textContent = "Live video optional. Photo booth still works.";
      remoteOverlay.classList.remove("hidden");
    }
    updateShootButton();
  };
}

async function makeOffer() {
  if (!pc) makePC();
  if (!pc) return;
  const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
  await pc.setLocalDescription(offer);
  socket.emit("signal", { to: peerId, data: { type: "offer", offer } });
}

async function handleSignal({ from, data }) {
  peerId = from;
  if (!pc) makePC();
  if (!pc) return;

  if (data.type === "offer") {
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("signal", { to: peerId, data: { type: "answer", answer } });
  }

  if (data.type === "answer") {
    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
  }

  if (data.type === "candidate") {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
      console.error(err);
    }
  }
}

function toggleReady() {
  localReady = !localReady;
  readyBtn.textContent = localReady ? tr("readyDone") : tr("imReady");
  badge(localBadge, localReady ? tr("ready") : tr("live"), localReady ? "ready" : "good");
  localSub.textContent = localReady ? tr("youReady") : tr("cameraReady");
  socket.emit("set-ready", { ready: localReady });
  updateShootButton();
}

function updateShootButton() {
  // Host start button should be clickable once the host has camera ON and pressed Ready.
  // The server will check whether the guest is ready and show a message if not.
  if (!isHost || shooting || !localStream || !localReady) {
    shootBtn.disabled = true;
    return;
  }

  shootBtn.disabled = false;
}

function requestShoot() {
  if (!isHost) {
    setStatus("Guest mode", "Only the host can start the photo booth.");
    return;
  }

  if (shooting) return;

  emitSettings();
  resetPhotos(false, false);
  const l = layout();

  if (modeSelect.value === "two") {
    setStatus("Checking guest", "Starting if both people are ready. If your friend is not ready, I will show a message.");
  } else {
    setStatus("Starting", "Get ready for the countdown.");
  }

  socket.emit("request-shoot", { poses: l.poses });
}

function handleState(state) {
  if (!state) return;

  if (yourId) {
    isHost = state.hostId === yourId;
    roleKnown = true;
    applyRoleUI();
  }

  if (state.settings) {
    applySettings(state.settings);
  }

  const ids = Object.keys(state.names || {});
  const otherId = ids.find(id => id !== yourId);

  if (otherId) {
    remoteName = state.names[otherId] || "Friend";
    remoteNameLabel.textContent = remoteName;
  }

  remoteReady = Boolean(otherId && state.ready && state.ready[otherId]);
  shooting = Boolean(state.shooting);

  if (remoteReady) {
    badge(remoteBadge, tr("ready"), "ready");
    remoteSub.textContent = tr("friendReady");
    if (isHost && localReady && modeSelect.value === "two") {
      setStatus(tr("ready"), "Both people are ready. Order: Host 1, Guest 1, Host 2, Guest 2.");
    }
  } else if (connected) {
    badge(remoteBadge, tr("connected"), "good");
    remoteSub.textContent = tr("friendConnected");
  }

  updateShootButton();
}

socket.on("room-joined", state => {
  yourId = state.yourId;
  handleState(state);
  if (isHost) emitSettings();
});

socket.on("room-state", handleState);

socket.on("settings-updated", ({ settings, state }) => {
  applySettings(settings);
  handleState(state);
});

socket.on("waiting-for-peer", () => {
  if (modeSelect.value === "two") {
    badge(remoteBadge, tr("waiting"), "warn");
    remoteSub.textContent = tr("waitingForFriend");
  }
});

socket.on("peer-ready", async ({ peerId: id, shouldCreateOffer, state }) => {
  peerId = id;
  handleState(state);
  if (modeSelect.value === "one") return;

  if (!pc) makePC();
  if (shouldCreateOffer) await makeOffer();
});

socket.on("signal", handleSignal);

socket.on("room-full", () => {
  setStatus("Room full", "This room already has two people. Create a new room.");
  startBtn.disabled = true;
});

socket.on("peer-left", state => {
  handleState(state);
  connected = false;
  remoteReady = false;
  friendDot.classList.remove("on");
  badge(remoteBadge, "left", "warn");
  remoteSub.textContent = "Friend left";
  remoteOverlay.classList.remove("hidden");
  updateShootButton();
});

socket.on("not-ready", ({ message }) => {
  shooting = false;
  setStatus("Not ready", message || "Press Ready first.");
  updateShootButton();
});

socket.on("shoot-start", async ({ startAt, seconds, poses, mode, state }) => {
  handleState(state);
  shooting = true;
  updateShootButton();
  resetPhotos(false, false);

  await sleep(Math.max(0, startAt - Date.now()));

  localPhotos = await captureSequence(poses, seconds, mode);

  if (mode === "two") {
    socket.emit("photos-captured", { images: localPhotos, name: getName() });
  } else {
    remotePhotos = [];
  }

  tryRenderFinal();
  socket.emit("shoot-complete");
});

socket.on("peer-photos", ({ images, name }) => {
  remotePhotos = Array.isArray(images) ? images : [];
  if (name) {
    remoteName = name;
    remoteNameLabel.textContent = remoteName;
  }
  tryRenderFinal();
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isHostTurn(slotNumber) {
  return slotNumber % 2 === 1;
}

function isMyTurn(slotNumber, mode) {
  if (mode !== "two") return true;
  return isHost ? isHostTurn(slotNumber) : !isHostTurn(slotNumber);
}

function myRequiredPhotos(totalSlots, mode) {
  if (mode !== "two") return totalSlots;
  return isHost ? Math.ceil(totalSlots / 2) : Math.floor(totalSlots / 2);
}

function friendRequiredPhotos(totalSlots, mode) {
  if (mode !== "two") return 0;
  return isHost ? Math.floor(totalSlots / 2) : Math.ceil(totalSlots / 2);
}

async function captureSequence(totalSlots, seconds, mode) {
  const images = [];

  for (let slot = 1; slot <= totalSlots; slot++) {
    const mine = isMyTurn(slot, mode);
    await runCountdown(seconds, slot, totalSlots, mine, mode);

    if (mine) {
      images.push(capture(localVideo, true));
      setStatus("Captured", `Captured slot ${slot} of ${totalSlots}.`);
      await sleep(250);
    }
  }

  return images;
}

async function runCountdown(seconds, slot, totalSlots, mine, mode) {
  const turnName = mode === "two" ? (isHostTurn(slot) ? "Host" : "Guest") : "You";

  countdownPose.textContent = `Slot ${slot} / ${totalSlots} · ${turnName} turn`;
  countdownEl.classList.remove("hidden");

  for (let i = seconds; i > 0; i--) {
    countdownText.textContent = i;
    statusTitle.textContent = mine ? "Your turn" : "Friend turn";
    statusEl.textContent = mode === "two"
      ? (mine ? `Get ready — you take slot ${slot} now.` : `Please wait — your friend takes slot ${slot} now.`)
      : `Get ready for pose ${slot}.`;
    await sleep(1000);
  }

  countdownText.textContent = mine ? "CHEESE" : "WAIT";
  await sleep(300);
  countdownEl.classList.add("hidden");
}

function filter() {
  const value = filterSelect.value;
  if (value === "contrast") return "contrast(132%) saturate(118%)";
  if (value === "boothbw") return "grayscale(100%) contrast(145%) brightness(94%) sepia(12%)";
  if (value === "oldbw") return "grayscale(100%) contrast(120%) brightness(96%)";
  if (value === "vintage") return "sepia(45%) contrast(112%) saturate(82%) brightness(96%)";
  if (value === "soft") return "brightness(110%) contrast(92%) saturate(90%)";
  return "none";
}

function capture(video, mirror = false) {
  const c = document.createElement("canvas");
  c.width = 1200;
  c.height = 900;
  const t = c.getContext("2d");
  t.filter = filter();

  if (mirror) {
    t.translate(c.width, 0);
    t.scale(-1, 1);
  }

  t.drawImage(video, 0, 0, c.width, c.height);

  if (filterSelect.value === "boothbw") {
    const img = t.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 22;
      img.data[i] += grain;
      img.data[i + 1] += grain;
      img.data[i + 2] += grain;
    }
    t.putImageData(img, 0, 0);
  }

  return c.toDataURL("image/jpeg", 0.9);
}

function loadImage(src) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = src;
  });
}

async function tryRenderFinal() {
  const l = layout();
  const localNeed = myRequiredPhotos(l.poses, modeSelect.value);
  const remoteNeed = friendRequiredPhotos(l.poses, modeSelect.value);

  if (modeSelect.value === "two" && (localPhotos.length < localNeed || remotePhotos.length < remoteNeed)) {
    badge(resultBadge, tr("waiting"), "warn");
    resultSub.textContent = `Waiting for photos… Host needs ${Math.ceil(l.poses / 2)}, Guest needs ${Math.floor(l.poses / 2)}.`;
    return;
  }

  if (localPhotos.length < localNeed) return;

  const localImages = await Promise.all(localPhotos.map(loadImage));
  const remoteImages = await Promise.all(remotePhotos.map(loadImage));

  drawFinal(localImages, remoteImages);

  downloadLink.href = finalCanvas.toDataURL("image/png");
  downloadLink.classList.remove("disabled");
  badge(resultBadge, tr("ready"), "good");
  resultSub.textContent = tr("finalReady");
  resetBtn.disabled = false;
  shooting = false;
  updateShootButton();
}

function resetPhotos(redraw = true, notify = true) {
  localPhotos = [];
  remotePhotos = [];
  downloadLink.classList.add("disabled");
  downloadLink.removeAttribute("href");
  resetBtn.disabled = true;
  badge(resultBadge, tr("notReady"));
  resultSub.textContent = tr("resultHint");
  shooting = false;
  if (notify) socket.emit("reset-shoot");
  if (redraw) drawEmptyFrame();
  updateShootButton();
}

function drawIfReady() {
  if (!localPhotos.length) drawEmptyFrame();
  else tryRenderFinal();
}

function setupCanvas(l) {
  finalCanvas.width = l.w;
  finalCanvas.height = l.h;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function layoutAccent() {
  const key = layoutSelect.value;
  if (key === "C") return "#9a0f24";
  if (key === "H") return "#2d3030";
  if (key === "K" || key === "E" || key === "D") return "#fff8ea";
  return "#050505";
}

function paper(l) {
  ctx.fillStyle = layoutAccent();
  ctx.fillRect(0, 0, l.w, l.h);

  ctx.fillStyle = "#15110d";
  for (let i = 0; i < 5000; i++) {
    ctx.globalAlpha = Math.random() * 0.07;
    ctx.fillRect(Math.random() * l.w, Math.random() * l.h, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
}

function drawEmptyFrame() {
  const l = layout();
  setupCanvas(l);
  paper(l);

  l.slots.forEach((s, i) => {
    const label = modeSelect.value === "two"
      ? `${i % 2 === 0 ? "Host" : "Guest"} ${Math.floor(i / 2) + 1}`
      : `Pose ${i + 1}`;
    drawSlot(s, label);
  });

  brand(l);
}

function drawSlot(s, text) {
  const [x, y, w, h] = s;
  ctx.fillStyle = "#fffdf5";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#080808";
  ctx.lineWidth = 12;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#766b5f";
  ctx.textAlign = "center";
  ctx.font = `bold ${Math.max(24, Math.min(w, h) * 0.08)}px Arial`;
  ctx.fillText(text, x + w / 2, y + h / 2);
}

function orderImages(localImages, remoteImages, totalSlots) {
  if (modeSelect.value === "one" || !remoteImages.length) {
    return Array.from({ length: totalSlots }, (_, i) => localImages[i % localImages.length]);
  }

  const hostImages = isHost ? localImages : remoteImages;
  const guestImages = isHost ? remoteImages : localImages;

  const output = [];

  for (let i = 0; i < totalSlots; i++) {
    if (i % 2 === 0) {
      output.push(hostImages[Math.floor(i / 2)] || hostImages[hostImages.length - 1] || guestImages[0]);
    } else {
      output.push(guestImages[Math.floor(i / 2)] || guestImages[guestImages.length - 1] || hostImages[0]);
    }
  }

  return output;
}

function drawFinal(localImages, remoteImages) {
  const l = layout();
  setupCanvas(l);
  paper(l);

  const images = orderImages(localImages, remoteImages, l.poses);

  l.slots.forEach((s, i) => {
    cover(images[i % images.length], ...s);
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = 12;
    ctx.strokeRect(...s);
  });

  brand(l);
}

function cover(img, x, y, w, h) {
  const imageRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imageRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);

  const g = ctx.createRadialGradient(
    x + w / 2,
    y + h / 2,
    Math.min(w, h) * 0.1,
    x + w / 2,
    y + h / 2,
    Math.max(w, h) * 0.65
  );
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(0,0,0,.22)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function brand(l) {
  const strip = l.size === "2x6";
  const y1 = strip ? l.h - 295 : l.h - 330;
  const y2 = strip ? l.h - 220 : l.h - 245;
  const y3 = strip ? l.h - 155 : l.h - 175;

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff8ea";
  ctx.font = `900 ${strip ? 72 : 110}px Arial`;
  ctx.fillText("CHEEZY", l.w / 2, y1);

  ctx.fillStyle = "#a9dcf7";
  ctx.font = `bold ${strip ? 30 : 48}px Arial`;
  ctx.fillText("by Billy", l.w / 2, y2);

  ctx.fillStyle = "#b88a5a";
  ctx.font = `${strip ? 22 : 34}px Arial`;
  ctx.fillText(new Date().toLocaleDateString(), l.w / 2, y3);
}


function updateLayoutCards() {
  document.querySelectorAll(".layout-card").forEach(card => {
    card.classList.toggle("active", card.dataset.layout === layoutSelect.value);
  });
}

document.querySelectorAll(".layout-card").forEach(card => {
  card.addEventListener("click", () => {
    if (!isHost) return;
    layoutSelect.value = card.dataset.layout;
    updateLayoutCards();
    updatePoseNote();
    resetPhotos(true, false);
    emitSettings();
  });
});

languageBtn.onclick = () => {
  lang = lang === "en" ? "mn" : "en";
  localStorage.setItem("cheezyLang", lang);
  applyLanguage();
};

startBtn.onclick = startCameraAndJoin;
copyLinkBtn.onclick = copyLink;
readyBtn.onclick = toggleReady;
shootBtn.onclick = requestShoot;
resetBtn.onclick = () => resetPhotos(true, true);

modeSelect.onchange = () => {
  updateModeUI(true);
  resetPhotos(true, false);
};

layoutSelect.onchange = () => {
  updateLayoutCards();
  if (!isHost) {
    applySettings(roomSettings);
    return;
  }
  updatePoseNote();
  resetPhotos(true, false);
  emitSettings();
};

filterSelect.onchange = () => {
  if (!isHost) {
    applySettings(roomSettings);
    return;
  }
  drawIfReady();
  emitSettings();
};

timerSelect.onchange = () => {
  if (!isHost) {
    applySettings(roomSettings);
    return;
  }
  updatePoseNote();
  emitSettings();
};

nameInput.oninput = () => {
  localNameLabel.textContent = getName();
  drawIfReady();
  socket.emit("update-profile", { name: getName() });
};

applyRoleUI();
applyLanguage();
updateModeUI(false);
updatePoseNote();
updateLayoutCards();
drawEmptyFrame();
