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
const poseSelect = $("poseSelect");
const filterSelect = $("filterSelect");
const timerSelect = $("timerSelect");
const poseNote = $("poseNote");
const frameGrid = $("frameGrid");
const posePills = $("posePills");
const modePills = $("modePills");
const filterPills = $("filterPills");
const timerPills = $("timerPills");
const resultScreen = $("resultScreen");
const homeFromResultBtn = $("homeFromResultBtn");
const frameHint = $("frameHint");
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

// Landing / token elements
const landing = $("landing");
const boothApp = $("boothApp");
const enterBoothBtn = $("enterBoothBtn");
const backToLandingBtn = $("backToLandingBtn");
const landingLangBtn = $("landingLangBtn");
const landingGallery = $("landingGallery");
const landingTokenCount = $("landingTokenCount");
const appTokenCount = $("appTokenCount");
const landingTokenChip = $("landingTokenChip");
const appTokenChip = $("appTokenChip");
const igEarnBtnLanding = $("igEarnBtnLanding");
const igEarnBtnApp = $("igEarnBtnApp");
const tokenStatus = $("tokenStatus");
const redeemInputLanding = $("redeemInputLanding");
const redeemBtnLanding = $("redeemBtnLanding");
const redeemMsgLanding = $("redeemMsgLanding");
const redeemInputApp = $("redeemInputApp");
const redeemBtnApp = $("redeemBtnApp");
const redeemMsgApp = $("redeemMsgApp");
const businessCardModal = $("businessCardModal");
const closeBusinessCardBtn = $("closeBusinessCardBtn");
const businessCardBackdrop = $("businessCardBackdrop");

const TEXT = {
  en: {
    tokensWord: "tokens", landingEyebrow: "Free vintage photo booth",
    enterBooth: "Start a Cheezy session", igEarnBtn: "Follow on Instagram plus 5 tokens", igClaimedBtn: "Bonus claimed",
    tokenHint: "Each photo costs 1 token. New here? You start with a few on the house.",
    step1Title: "Choose your setup", step1Body: "Pick 1, 2, 4 or 6 poses and a matching frame, like polaroid, film strip, or scrapbook.",
    step2Title: "Send the link, strike a pose", step2Body: "Solo, or share the room link so a friend anywhere can join and take turns with you.",
    step3Title: "Download your print", step3Body: "Your finished scrapbook strip is ready to save and share in seconds.",
    landingFooter: "Made for people who miss real photo booths.",
    needTokens: "You need TOKEN_N token(s) for your photos. Follow us on Instagram for 5 free.",
    outOfTokens: "Out of tokens for this turn. Earn more, then retake.",
    tokensLeft: "You have TOKEN_N token(s) left.",
    igBonusToast: "Plus 3 tokens added! Thanks for the follow.",
    redeemBtn: "Redeem code", redeemSuccess: "Code accepted. TOKEN_N tokens added.", redeemInvalid: "Enter a valid 6 digit code.", redeemError: "Code not valid or already used.",
    backHome: "Back to home",
    btn: "MN", nameLabel: "Name", modeLabel: "Mode", poseLabel: "Pose count", filterLabel: "Filter", timerLabel: "Seconds each turn",
    shareLabel: "Send this room link", copyLink: "Copy link", readyToStart: "Ready to start",
    initialStatus: "Start your camera. In 2-person mode, send the room link to your friend.",
    youTitle: "You", friendTitle: "Friend", cameraNotStarted: "Camera not started", offline: "offline",
    startCameraShort: "Start camera", waitingForFriend: "Waiting for friend", waiting: "waiting", sendRoomLink: "Send room link",
    startJoin: "Start camera & join", imReady: "I'm ready", readyDone: "Ready ✓", startBooth: "Start photo booth",
    retake: "Retake", finalPrint: "Final booth print", resultHint: "Choose pose count and frame, then start the booth.",
    notReady: "not ready", downloadPng: "Download PNG", modeOne: "1 person", modeTwo: "2 people",
    filterNone: "No filter", filterContrast: "More contrast", filterBoothBw: "Vintage booth B/W", filterOldBw: "Old black & white",
    filterVintage: "Retro warm", filterSoft: "Soft pastel", frameTitle: "Choose a frame", hostRole: "Host", guestRole: "Guest",
    guestNote: "Guest mode: press Ready and wait for the host to start.", copied: "Copied", live: "live", ready: "ready",
    connected: "connected", cameraReady: "Camera ready", youReady: "You are ready", friendReady: "Friend is ready",
    friendConnected: "Friend connected", finalReady: "Your Cheezy by Billy print is ready."
  },
  mn: {
    tokensWord: "токен", landingEyebrow: "Үнэгүй ретро фото будк",
    enterBooth: "Cheezy эхлүүлэх", igEarnBtn: "Instagram дагаад, 5 токен ав", igClaimedBtn: "Бонус авсан",
    tokenHint: "Зураг бүр 1 токен зарцуулна. Шинэ хэрэглэгч бол хэдэн токен үнэгүй өгнө.",
    step1Title: "Тохиргоогоо сонго", step1Body: "1, 2, 4 эсвэл 6 pose, тохирох frame-аа сонго, polaroid, film strip, scrapbook гэх мэт.",
    step2Title: "Холбоос явуулаад зураг ав", step2Body: "Ганцаараа эсвэл room холбоосоо явуулж найзтайгаа ээлжлэн зураг ав.",
    step3Title: "Зургаа татаж ав", step3Body: "Бэлэн scrapbook зураг хэдхэн секундэд татахад бэлэн болно.",
    landingFooter: "Жинхэнэ фото будкийг санадаг хүмүүст зориулав.",
    needTokens: "Зургаа авахад TOKEN_N токен хэрэгтэй. Instagram дагаад 5 үнэгүй ав.",
    outOfTokens: "Энэ эргэлтэд токен дууслаа. Нэмж аваад дахин оролдоорой.",
    tokensLeft: "Танд TOKEN_N токен байна.",
    igBonusToast: "Нэмж 3 токен нэмэгдлээ! Дагасанд баярлалаа.",
    redeemBtn: "Код ашиглах", redeemSuccess: "Код амжилттай. TOKEN_N токен нэмэгдлээ.", redeemInvalid: "6 оронтой код оруулна уу.", redeemError: "Код буруу эсвэл ашиглагдсан байна.",
    backHome: "Нүүр хуудас руу буцах",
    btn: "EN", nameLabel: "Нэр", modeLabel: "Горим", poseLabel: "Зургийн тоо", filterLabel: "Өнгөний эффект", timerLabel: "Зураг бүрийн хугацаа",
    shareLabel: "Найздаа явуулах холбоос", copyLink: "Холбоос хуулах", readyToStart: "Эхлэхэд бэлэн",
    initialStatus: "Камераа асаана уу. 2 хүний горимд холбоосоо найздаа явуулаарай.",
    youTitle: "Та", friendTitle: "Найз", cameraNotStarted: "Камер асаагүй байна", offline: "асаагүй",
    startCameraShort: "Камераа асаах", waitingForFriend: "Найзыгаа хүлээж байна", waiting: "хүлээж байна", sendRoomLink: "Холбоосоо явуулна уу",
    startJoin: "Камер асааж орох", imReady: "Би бэлэн", readyDone: "Бэлэн ✓", startBooth: "Зураг авч эхлэх",
    retake: "Дахин авах", finalPrint: "Бэлэн зураг", resultHint: "Зургийн тоо, frame сонгоод эхлээрэй.",
    notReady: "бэлэн биш", downloadPng: "PNG татах", modeOne: "1 хүн", modeTwo: "2 хүн",
    filterNone: "Эффектгүй", filterContrast: "Контраст нэмэх", filterBoothBw: "Хуучны booth хар-цагаан", filterOldBw: "Сонгодог хар-цагаан",
    filterVintage: "Дулаан ретро", filterSoft: "Зөөлөн пастел", frameTitle: "Frame сонгох", hostRole: "Host", guestRole: "Guest",
    guestNote: "Guest горим: Бэлэн дарж host эхлүүлэхийг хүлээнэ.", copied: "Хуулагдлаа", live: "асаалттай", ready: "бэлэн",
    connected: "холбогдсон", cameraReady: "Камер бэлэн", youReady: "Та бэлэн байна", friendReady: "Найз бэлэн байна",
    friendConnected: "Найз холбогдлоо", finalReady: "Cheezy by Billy зураг бэлэн боллоо."
  }
};

function trTokens(key, n) { return tr(key).replace("TOKEN_N", n); }

/* ---------------- Token economy ---------------- */
const TOKEN_COST_PER_PHOTO = 1;
const FREE_TOKENS_ON_FIRST_VISIT = 3;
const INSTAGRAM_BONUS_TOKENS = 3;
const INSTAGRAM_URL = "https://www.instagram.com/cheezybybilly?igsh=bzJzZjdkYjhiZWdv&utm_source=qr";

function getTokens() {
  const raw = localStorage.getItem("cheezyTokens");
  if (raw === null) {
    localStorage.setItem("cheezyTokens", String(FREE_TOKENS_ON_FIRST_VISIT));
    return FREE_TOKENS_ON_FIRST_VISIT;
  }
  return Math.max(0, Number(raw) || 0);
}

function setTokens(n) {
  localStorage.setItem("cheezyTokens", String(Math.max(0, n)));
  renderTokenUI();
}

function addTokens(n) { setTokens(getTokens() + n); }
function spendTokens(n) { setTokens(getTokens() - n); }

function igClaimed() { return localStorage.getItem("cheezyIgClaimed") === "1"; }

function claimInstagramBonus() {
  window.open(INSTAGRAM_URL, "_blank", "noopener");
  if (igClaimed()) return;
  localStorage.setItem("cheezyIgClaimed", "1");
  addTokens(INSTAGRAM_BONUS_TOKENS);
  setStatus(tr("igBonusToast"), trTokens("tokensLeft", getTokens()));
  renderTokenUI();
}


async function redeemCode(input, msgEl) {
  const code = (input.value || "").replace(/\D/g, "").slice(0, 6);
  input.value = code;

  if (!/^\d{6}$/.test(code)) {
    msgEl.textContent = tr("redeemInvalid");
    msgEl.classList.add("error");
    return;
  }

  try {
    const res = await fetch("/api/redeem-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      msgEl.textContent = (data && data.message) || tr("redeemError");
      msgEl.classList.add("error");
      return;
    }

    addTokens(Number(data.tokens) || 3);
    msgEl.textContent = trTokens("redeemSuccess", Number(data.tokens) || 3);
    msgEl.classList.remove("error");
    input.value = "";
    setStatus("Redeemed", trTokens("redeemSuccess", Number(data.tokens) || 3));
  } catch (err) {
    console.error(err);
    msgEl.textContent = tr("redeemError");
    msgEl.classList.add("error");
  }
}

function openBusinessCard() {
  businessCardModal.classList.remove("hidden");
  businessCardModal.setAttribute("aria-hidden", "false");
}

function closeBusinessCard() {
  businessCardModal.classList.add("hidden");
  businessCardModal.setAttribute("aria-hidden", "true");
}

function renderTokenUI() {
  const n = getTokens();
  if (landingTokenCount) landingTokenCount.textContent = n;
  if (appTokenCount) appTokenCount.textContent = n;
  [landingTokenChip, appTokenChip].forEach(chip => { if (chip) chip.classList.toggle("low", n < 1); });
  [igEarnBtnLanding, igEarnBtnApp].forEach(btn => {
    if (!btn) return;
    btn.classList.toggle("claimed", igClaimed());
    const label = btn.querySelector("[data-i18n]") || btn;
    label.textContent = igClaimed() ? tr("igClaimedBtn") : tr("igEarnBtn");
  });
  updateShootButton();
}

function requiredTokensForMe() {
  const frame = selectedFrame();
  return myRequiredPhotos(frame.poses, modeSelect.value) * TOKEN_COST_PER_PHOTO;
}

function renderLandingGallery() {
  if (!landingGallery || landingGallery.dataset.built) return;
  landingGallery.dataset.built = "1";
  const specs = [
    { cls: "s1", rows: 4 },
    { cls: "s2", rows: 1 },
    { cls: "s3", rows: 2 },
    { cls: "s4", rows: 2 }
  ];
  specs.forEach(spec => {
    const strip = document.createElement("div");
    strip.className = `scatter-strip ${spec.cls}`;
    for (let i = 0; i < spec.rows; i++) strip.appendChild(document.createElement("i"));
    landingGallery.appendChild(strip);
  });
}

function showScreen(name) {
  landing.classList.toggle("hidden", name !== "landing");
  boothApp.classList.toggle("hidden", name !== "booth");
  resultScreen.classList.toggle("hidden", name !== "result");
}

function showLanding() { showScreen("landing"); }
function showBoothApp() { showScreen("booth"); }

function showResultScreen() {
  showScreen("result");
  finalCanvas.classList.remove("printing");
  void finalCanvas.offsetWidth;
  requestAnimationFrame(() => finalCanvas.classList.add("printing"));
}

let lang = localStorage.getItem("cheezyLang") || "en";
function tr(key) { return (TEXT[lang] && TEXT[lang][key]) || TEXT.en[key] || key; }

const FRAMES = [
  { id:"hawaii-license-1", name:"Hawaii License", poses:1, style:"hawaii", ratio:"license", w:1700, h:1050 },
  { id:"bikini-license-1", name:"Bikini Bottom ID", poses:1, style:"license", ratio:"license", w:2000, h:1200 },
  { id:"double-strip-2", name:"Double Strip", poses:2, style:"classic", ratio:"2x6", w:800, h:2400 },
  { id:"polaroid-duo-2", name:"Polaroid Duo", poses:2, style:"polaroid", ratio:"4x6", w:1600, h:2400 },
  { id:"gingham-duo-2", name:"Gingham Duo", poses:2, style:"gingham", ratio:"4x6", w:1600, h:2400 },
  { id:"classic-black-4", name:"Classic Black", poses:4, style:"classic", ratio:"2x6", w:800, h:2400 },
  { id:"film-strip-4", name:"Film Strip", poses:4, style:"film", ratio:"2x6", w:900, h:2500 },
  { id:"red-lips-4", name:"Red Lips Strip", poses:4, style:"lips", ratio:"4x6", w:1600, h:2400 },
  { id:"scrapbook-4", name:"Scrapbook 4", poses:4, style:"scrapbook", ratio:"4x6", w:1600, h:2400 },
  { id:"long-film-6", name:"Long Film 6", poses:6, style:"film", ratio:"2x6", w:900, h:2800 },
  { id:"cream-strip-6", name:"Cream Strip 6", poses:6, style:"cream", ratio:"4x6", w:1600, h:2400 },
  { id:"collage-6", name:"Collage 6", poses:6, style:"scrapbook", ratio:"4x6", w:1600, h:2400 },
  { id:"gingham-6", name:"Gingham 6", poses:6, style:"gingham", ratio:"4x6", w:1600, h:2400 }
];

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
let currentFrameId = "classic-black-4";
let roomSettings = { mode:"two", poseCount:4, frameId:"classic-black-4", filter:"boothbw", seconds:3 };

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

function getName() { return nameInput.value.trim() || "Me"; }

function selectedPoseCount() { return Number(poseSelect.value) || 4; }

function selectedFrame() {
  return FRAMES.find(f => f.id === currentFrameId) || FRAMES.find(f => f.poses === selectedPoseCount()) || FRAMES[0];
}

function setStatus(title, message) { statusTitle.textContent = title; statusEl.textContent = message; }
function badge(el, text, cls = "") { el.textContent = text; el.className = cls; }

function renderHeroTitle() {
  const lines = lang === "mn" ? ["Cheezy", "зураг", "авцгаая"] : ["Let’s", "get", "Cheezy"];
  ["heroTitle", "landingHeroTitle"].forEach(id => {
    const hero = document.getElementById(id);
    if (!hero) return;
    hero.innerHTML = "";
    let idx = 0;
    lines.forEach(line => {
      const row = document.createElement("span");
      row.className = "cutout-line";
      [...line].forEach(ch => {
        const span = document.createElement("span");
        span.className = ch === " " ? "letter space" : "letter";
        span.style.setProperty("--i", idx++);
        span.textContent = ch === " " ? "" : ch;
        row.appendChild(span);
      });
      hero.appendChild(row);
    });
  });
}

function applyLanguage() {
  document.body.classList.toggle("lang-mn", lang === "mn");
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = tr(el.dataset.i18n); });
  languageBtn.textContent = tr("btn");
  roleChip.textContent = isHost ? tr("hostRole") : tr("guestRole");
  readyBtn.textContent = localReady ? tr("readyDone") : tr("imReady");
  renderHeroTitle();
  refreshFrameUI();
  renderTokenUI();
}

function allowedPoses() {
  return modeSelect.value === "two" ? [2, 4, 6] : [1, 2, 4, 6];
}

function normalizePoseForMode() {
  const allowed = allowedPoses();
  if (!allowed.includes(selectedPoseCount())) {
    poseSelect.value = String(allowed[0]);
  }
  Array.from(poseSelect.options).forEach(opt => {
    opt.hidden = !allowed.includes(Number(opt.value));
  });
}

function availableFrames() {
  return FRAMES.filter(f => f.poses === selectedPoseCount());
}

function ensureFrameMatchesPose() {
  const frames = availableFrames();
  if (!frames.some(f => f.id === currentFrameId)) {
    currentFrameId = frames[0]?.id || FRAMES[0].id;
  }
}

function renderModePills() {
  modePills.innerHTML = "";
  [["one", tr("modeOne")], ["two", tr("modeTwo")]].forEach(([val, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pose-pill" + (modeSelect.value === val ? " active" : "");
    btn.textContent = label;
    btn.onclick = () => {
      if (!isHost) return;
      if (modeSelect.value === val) return;
      modeSelect.value = val;
      updateModeUI(true);
    };
    modePills.appendChild(btn);
  });
}

const FILTER_OPTIONS = [
  ["none", "filterNone"], ["contrast", "filterContrast"], ["boothbw", "filterBoothBw"],
  ["oldbw", "filterOldBw"], ["vintage", "filterVintage"], ["soft", "filterSoft"]
];

function renderFilterPills() {
  filterPills.innerHTML = "";
  FILTER_OPTIONS.forEach(([val, key]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pose-pill" + (filterSelect.value === val ? " active" : "");
    btn.textContent = tr(key);
    btn.onclick = () => {
      if (!isHost) return;
      filterSelect.value = val;
      renderFilterPills();
      drawIfReady();
      emitSettings();
    };
    filterPills.appendChild(btn);
  });
}

function renderTimerPills() {
  timerPills.innerHTML = "";
  [2, 3, 5, 7].forEach(sec => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pose-pill" + (Number(timerSelect.value) === sec ? " active" : "");
    btn.textContent = `${sec}s`;
    btn.onclick = () => {
      if (!isHost) return;
      timerSelect.value = String(sec);
      renderTimerPills();
      updatePoseNote();
      emitSettings();
    };
    timerPills.appendChild(btn);
  });
}

function renderPosePills() {
  posePills.innerHTML = "";
  allowedPoses().forEach(count => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pose-pill" + (selectedPoseCount() === count ? " active" : "");
    btn.textContent = `${count} pose${count > 1 ? "s" : ""}`;
    btn.onclick = () => {
      if (!isHost) return;
      poseSelect.value = String(count);
      onSettingsChanged(true);
    };
    posePills.appendChild(btn);
  });
}

function frameLayout(frame) {
  if (frame.style === "license" || frame.style === "hawaii") return { cols: 1, rows: 1 };
  if (frame.ratio === "2x6") return { cols: 1, rows: frame.poses };
  if (frame.poses <= 2) return { cols: 1, rows: frame.poses };
  if (frame.poses === 4) return { cols: 2, rows: 2 };
  if (frame.poses === 6) return { cols: 2, rows: 3 };
  return { cols: 1, rows: frame.poses };
}

function miniClass(frame) {
  if (frame.style === "film") return "mini film";
  if (frame.style === "lips") return "mini red";
  if (frame.style === "scrapbook") return "mini stars";
  if (frame.style === "gingham") return "mini gingham";
  if (frame.style === "polaroid" || frame.style === "cream") return "mini cream";
  if (frame.style === "camera") return "mini white";
  if (frame.style === "license") return "mini license-mini";
  if (frame.style === "hawaii") return "mini hawaii-mini";
  return "mini";
}

function renderFrameCards() {
  frameGrid.innerHTML = "";
  const frames = availableFrames();
  frameHint.textContent = `${frames.length} frame option${frames.length !== 1 ? "s" : ""} available for ${selectedPoseCount()} pose${selectedPoseCount() > 1 ? "s" : ""}.`;

  frames.forEach(frame => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "frame-card" + (frame.id === currentFrameId ? " active" : "");
    card.dataset.frame = frame.id;

    const mini = document.createElement("span");
    mini.className = miniClass(frame);
    const { cols, rows } = frameLayout(frame);
    mini.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    mini.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    mini.style.width = cols === 1 && rows > 1 ? "58px" : cols === 2 ? "112px" : "100%";
    for (let i = 0; i < Math.min(frame.poses, 6); i++) {
      mini.appendChild(document.createElement("i"));
    }

    const name = document.createElement("b");
    name.textContent = frame.name;

    const small = document.createElement("small");
    small.textContent = `${frame.poses} slot${frame.poses > 1 ? "s" : ""}`;

    card.appendChild(mini);
    card.appendChild(name);
    card.appendChild(small);
    card.onclick = () => {
      if (!isHost) return;
      currentFrameId = frame.id;
      onSettingsChanged(true);
    };

    frameGrid.appendChild(card);
  });
}

function updatePoseNote() {
  normalizePoseForMode();
  ensureFrameMatchesPose();
  const count = selectedPoseCount();

  if (modeSelect.value === "two") {
    const perPerson = count / 2;
    const order = [];
    for (let i = 1; i <= count; i++) order.push(i % 2 === 1 ? `Host ${Math.ceil(i / 2)}` : `Guest ${i / 2}`);
    poseNote.textContent = `${count} total slots — each person takes ${perPerson}. Order: ${order.join(" → ")}.`;
  } else {
    poseNote.textContent = `${count} pose${count > 1 ? "s" : ""}. One person takes all photos.`;
  }
}

function currentSettings() {
  return {
    mode: modeSelect.value,
    poseCount: selectedPoseCount(),
    frameId: currentFrameId,
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
    poseSelect.value = String(settings.poseCount || 4);
    filterSelect.value = settings.filter || "boothbw";
    timerSelect.value = String(settings.seconds || 3);
    currentFrameId = settings.frameId || currentFrameId;
  } else {
    currentFrameId = settings.frameId || currentFrameId;
  }

  updateModeUI(false);
  refreshFrameUI();
  drawIfReady();
}

function refreshFrameUI() {
  normalizePoseForMode();
  ensureFrameMatchesPose();
  renderModePills();
  renderFilterPills();
  renderTimerPills();
  renderPosePills();
  renderFrameCards();
  updatePoseNote();
}

function applyRoleUI() {
  document.body.classList.toggle("host-role", roleKnown && isHost);
  document.body.classList.toggle("guest-role", roleKnown && !isHost);
  roleChip.textContent = isHost ? tr("hostRole") : tr("guestRole");

  modeSelect.disabled = !isHost;
  poseSelect.disabled = !isHost;
  filterSelect.disabled = !isHost;
  timerSelect.disabled = !isHost;

  updateShootButton();
}

function updateModeUI(emit = true) {
  normalizePoseForMode();
  document.body.classList.toggle("solo-mode", modeSelect.value === "one");

  if (modeSelect.value === "one") {
    remoteReady = false;
    setStatus("Solo mode", "Start camera, press Ready, then start the booth.");
  } else {
    setStatus("Two-person mode", "Both people join and press Ready. Host starts the booth.");
  }

  refreshFrameUI();
  if (emit) emitSettings();
  updateShootButton();
}

function onSettingsChanged(emit = true) {
  refreshFrameUI();
  resetPhotos(true, false);
  drawEmptyFrame();
  if (emit) emitSettings();
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
    if (event.candidate && peerId) socket.emit("signal", { to: peerId, data: { type: "candidate", candidate: event.candidate } });
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
  if (data.type === "answer") await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
  if (data.type === "candidate") {
    try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (err) { console.error(err); }
  }
}

function toggleReady() {
  if (!localReady) {
    const need = requiredTokensForMe();
    if (getTokens() < need) {
      tokenStatus.textContent = trTokens("needTokens", need);
      tokenStatus.classList.remove("hidden");
      setStatus("Not enough tokens", trTokens("needTokens", need));
      return;
    }
  }
  tokenStatus.classList.add("hidden");
  localReady = !localReady;
  readyBtn.textContent = localReady ? tr("readyDone") : tr("imReady");
  badge(localBadge, localReady ? tr("ready") : tr("live"), localReady ? "ready" : "good");
  localSub.textContent = localReady ? tr("youReady") : tr("cameraReady");
  socket.emit("set-ready", { ready: localReady });
  updateShootButton();
}

function updateShootButton() {
  if (!isHost || shooting || !localStream || !localReady) {
    shootBtn.disabled = true;
    return;
  }
  shootBtn.disabled = getTokens() < requiredTokensForMe();
}

function requestShoot() {
  if (!isHost) {
    setStatus("Guest mode", "Only the host can start the photo booth.");
    return;
  }
  if (shooting) return;
  const need = requiredTokensForMe();
  if (getTokens() < need) {
    tokenStatus.textContent = trTokens("needTokens", need);
    tokenStatus.classList.remove("hidden");
    setStatus("Not enough tokens", trTokens("needTokens", need));
    return;
  }
  emitSettings();
  resetPhotos(false, false);
  setStatus("Checking", modeSelect.value === "two" ? "Starting if both people are ready." : "Starting countdown.");
  socket.emit("request-shoot");
}

function handleState(state) {
  if (!state) return;

  if (yourId) {
    isHost = state.hostId === yourId;
    roleKnown = true;
    applyRoleUI();
  }

  if (state.settings) applySettings(state.settings);

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
    if (isHost && localReady && modeSelect.value === "two") setStatus(tr("ready"), "Both people are ready. Order: Host → Guest → Host → Guest.");
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
socket.on("settings-updated", ({ settings, state }) => { applySettings(settings); handleState(state); });
socket.on("waiting-for-peer", () => { if (modeSelect.value === "two") { badge(remoteBadge, tr("waiting"), "warn"); remoteSub.textContent = tr("waitingForFriend"); } });
socket.on("peer-ready", async ({ peerId: id, shouldCreateOffer, state }) => { peerId = id; handleState(state); if (modeSelect.value === "one") return; if (!pc) makePC(); if (shouldCreateOffer) await makeOffer(); });
socket.on("signal", handleSignal);
socket.on("room-full", () => { setStatus("Room full", "This room already has two people. Create a new room."); startBtn.disabled = true; });
socket.on("peer-left", state => { handleState(state); connected = false; remoteReady = false; friendDot.classList.remove("on"); badge(remoteBadge, "left", "warn"); remoteSub.textContent = "Friend left"; remoteOverlay.classList.remove("hidden"); updateShootButton(); });
socket.on("not-ready", ({ message }) => { shooting = false; setStatus("Not ready", message || "Press Ready first."); updateShootButton(); });

socket.on("shoot-start", async ({ startAt, seconds, poseCount, mode, state }) => {
  handleState(state);
  shooting = true;
  updateShootButton();
  resetPhotos(false, false);

  await sleep(Math.max(0, startAt - Date.now()));
  localPhotos = await captureSequence(poseCount, seconds, mode);

  if (mode === "two") socket.emit("photos-captured", { images: localPhotos, name: getName() });
  else remotePhotos = [];

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

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function isHostTurn(slotNumber) { return slotNumber % 2 === 1; }
function isMyTurn(slotNumber, mode) { if (mode !== "two") return true; return isHost ? isHostTurn(slotNumber) : !isHostTurn(slotNumber); }
function myRequiredPhotos(totalSlots, mode) { if (mode !== "two") return totalSlots; return isHost ? Math.ceil(totalSlots / 2) : Math.floor(totalSlots / 2); }
function friendRequiredPhotos(totalSlots, mode) { if (mode !== "two") return 0; return isHost ? Math.floor(totalSlots / 2) : Math.ceil(totalSlots / 2); }

async function captureSequence(totalSlots, seconds, mode) {
  const images = [];
  for (let slot = 1; slot <= totalSlots; slot++) {
    const mine = isMyTurn(slot, mode);
    await runCountdown(seconds, slot, totalSlots, mine, mode);
    if (mine) {
      if (getTokens() < TOKEN_COST_PER_PHOTO) {
        tokenStatus.textContent = tr("outOfTokens");
        tokenStatus.classList.remove("hidden");
        setStatus("Out of tokens", tr("outOfTokens"));
        break;
      }
      spendTokens(TOKEN_COST_PER_PHOTO);
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
  const frame = selectedFrame();
  const total = frame.poses;
  const mode = modeSelect.value;
  const localNeed = myRequiredPhotos(total, mode);
  const remoteNeed = friendRequiredPhotos(total, mode);

  if (mode === "two" && (localPhotos.length < localNeed || remotePhotos.length < remoteNeed)) {
    badge(resultBadge, tr("waiting"), "warn");
    resultSub.textContent = `Waiting for photos… Host needs ${Math.ceil(total / 2)}, Guest needs ${Math.floor(total / 2)}.`;
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
  shooting = false;
  updateShootButton();
  showResultScreen();
}

function resetPhotos(redraw = true, notify = true) {
  localPhotos = [];
  remotePhotos = [];
  downloadLink.classList.add("disabled");
  downloadLink.removeAttribute("href");
  badge(resultBadge, tr("notReady"));
  resultSub.textContent = tr("resultHint");
  shooting = false;
  if (notify) socket.emit("reset-shoot");
  if (redraw) drawEmptyFrame();
  updateShootButton();
}

function drawIfReady() { if (!localPhotos.length) drawEmptyFrame(); else tryRenderFinal(); }

function setupCanvas(frame) {
  finalCanvas.width = frame.w;
  finalCanvas.height = frame.h;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function frameBg(frame) {
  if (frame.style === "lips") return "#8b1018";
  if (frame.style === "gingham") return "#fff8ea";
  if (frame.style === "license") return "#f7ecd7";
  if (frame.style === "hawaii") return "#ffffff";
  if (frame.style === "polaroid" || frame.style === "camera" || frame.style === "tv" || frame.style === "cream") return "#fff8ea";
  if (frame.style === "scrapbook") return "#f6ead2";
  return "#050505";
}

function paper(frame) {
  ctx.fillStyle = frameBg(frame);
  ctx.fillRect(0, 0, frame.w, frame.h);

  if (frame.style === "gingham") {
    ctx.fillStyle = "rgba(154,15,36,.22)";
    const s = 90;
    for (let x = 0; x < frame.w; x += s * 2) ctx.fillRect(x, 0, s, frame.h);
    for (let y = 0; y < frame.h; y += s * 2) ctx.fillRect(0, y, frame.w, s);
  }

  if (frame.style === "film") drawFilmHoles(frame);
  if (frame.style === "lips") drawLipPattern(frame);
  if (frame.style === "camera") drawCameraDecor(frame);
  if (frame.style === "tv") drawTvDecor(frame);
  if (frame.style === "scrapbook") drawScrapbookTape(frame);
  if (frame.style === "license") drawLicenseDecor(frame);
  if (frame.style === "hawaii") drawHawaiiLicenseDecor(frame);
}

function drawFilmHoles(frame) {
  ctx.fillStyle = "#f7f7f0";
  const holeW = 55, holeH = 35;
  for (let y = 80; y < frame.h - 80; y += 95) {
    ctx.fillRect(20, y, holeW, holeH);
    ctx.fillRect(frame.w - 75, y, holeW, holeH);
  }
}

function drawLipPattern(frame) {
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#fff";
  ctx.font = "bold 90px Arial";
  for (let y = 120; y < frame.h; y += 210) {
    for (let x = 35; x < frame.w; x += 190) ctx.fillText("♡", x, y);
  }
  ctx.globalAlpha = 1;
}

function drawCameraDecor(frame) {
  ctx.fillStyle = "#c9c2ad";
  ctx.fillRect(80, 80, frame.w - 160, frame.h - 160);
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath();
  ctx.arc(frame.w - 260, 230, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f7f7f0";
  ctx.font = "bold 60px Arial";
  ctx.fillText("CHEEZY CAM", 160, 230);
}

function drawTvDecor(frame) {
  ctx.fillStyle = "#5f5147";
  ctx.fillRect(90, 120, frame.w - 180, frame.h - 240);
  ctx.fillStyle = "#2a201d";
  ctx.fillRect(frame.w - 340, 220, 170, frame.h - 460);
  ctx.fillStyle = "#f7f7f0";
  ctx.beginPath();
  ctx.arc(frame.w - 255, 360, 55, 0, Math.PI * 2);
  ctx.fill();
}

function drawScrapbookTape(frame) {
  ctx.fillStyle = "rgba(255,236,173,.8)";
  ctx.save();
  ctx.translate(120, 120);
  ctx.rotate(-0.15);
  ctx.fillRect(0, 0, 260, 70);
  ctx.restore();
  ctx.save();
  ctx.translate(frame.w - 380, frame.h - 210);
  ctx.rotate(0.12);
  ctx.fillRect(0, 0, 260, 70);
  ctx.restore();
}


function drawLicenseDecor(frame) {
  const w = frame.w, h = frame.h;

  // rounded ID card background
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,.28)";
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, w - 48, h - 48);
  ctx.restore();

  // orange top stripes
  ctx.fillStyle = "#d86612";
  roundRect(70, 70, 350, 18, 8, true, false);
  roundRect(70, 105, 350, 55, 10, true, false);
  roundRect(w - 420, 70, 350, 18, 8, true, false);
  roundRect(w - 420, 105, 350, 55, 10, true, false);

  // faded seal
  ctx.save();
  ctx.globalAlpha = 0.11;
  ctx.strokeStyle = "#3f6f9c";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(w - 520, h / 2 + 90, 260, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = "900 80px Georgia";
  ctx.textAlign = "center";
  ctx.fillStyle = "#3f6f9c";
  ctx.fillText("BIKINI", w - 520, h / 2 + 50);
  ctx.fillText("BOTTOM", w - 520, h / 2 + 145);
  ctx.restore();

  // shell-like decorations
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#d8c8ac";
  ctx.beginPath();
  ctx.ellipse(850, 565, 105, 150, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(760, 985, 80, 65, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // title
  ctx.fillStyle = "#0e0d0c";
  ctx.textAlign = "center";
  ctx.font = "900 118px Georgia";
  ctx.fillText("BIKINI BOTTOM", w / 2 + 120, 150);
  ctx.font = "900 68px Georgia";
  ctx.fillText("DRIVER LICENSE", w / 2 + 120, 240);

  ctx.fillStyle = "#175c25";
  ctx.font = "900 64px Georgia";
  ctx.fillText("A1356021", w / 2 + 140, 330);

  ctx.fillStyle = "#111";
  ctx.font = "900 44px Georgia";
  ctx.fillText("CLASS: S", w - 245, 245);

  ctx.fillStyle = "#971719";
  ctx.textAlign = "left";
  ctx.font = "900 44px Georgia";
  ctx.fillText("EXPIRES: 12-14-03", 190, 400);

  // portrait box outline
  ctx.strokeStyle = "#4b1f77";
  ctx.lineWidth = 9;
  roundRect(130, 470, 580, 640, 18, false, true);

  // text information
  ctx.fillStyle = "#111";
  ctx.font = "48px Georgia";
  ctx.fillText("NAME:", 800, 555);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#111";
  ctx.beginPath();
  ctx.moveTo(970, 560);
  ctx.lineTo(w - 180, 560);
  ctx.stroke();

  ctx.font = "900 60px Georgia";
  ctx.fillText("124 CONCH ST.", 800, 700);
  ctx.fillText("BIKINI BOTTOM", 800, 790);

  ctx.font = "900 42px Georgia";
  ctx.fillText("SEX: M", 800, 875);
  ctx.fillText("HAIR: YELLOW", 980, 875);
  ctx.fillText("EYES: BLUE", 1390, 875);

  ctx.fillText("HT: 0-04", 800, 940);
  ctx.fillText("WT: 1oz", 1020, 940);

  ctx.fillStyle = "#971719";
  ctx.fillText("DOB: 07-14-86", 1240, 940);

  ctx.fillStyle = "#111";
  ctx.font = "44px Georgia";
  ctx.fillText("SIGNATURE:", 960, 1080);
  ctx.beginPath();
  ctx.moveTo(1230, 1082);
  ctx.lineTo(w - 90, 1082);
  ctx.stroke();
}

function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}


function drawHawaiiLicenseDecor(frame) {
  const w = frame.w, h = frame.h;

  ctx.save();
  ctx.fillStyle = "#fffdf7";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 4;
  roundRect(50, 45, w - 100, h - 90, 22, false, true);
  ctx.restore();

  ctx.textAlign = "left";
  ctx.fillStyle = "#1f71c9";
  ctx.font = "900 108px Impact, Arial Black, Arial";
  ctx.fillText("HAWAII", 710, 135);
  ctx.font = "900 46px Arial";
  ctx.fillText("DRIVER", 1188, 90);
  ctx.fillText("LICENSE", 1188, 140);

  ctx.fillStyle = "#111";
  ctx.font = "34px Arial";
  ctx.fillText("NUMBER", 710, 205);
  ctx.font = "900 54px Arial";
  ctx.fillText("01-47-87441", 900, 210);

  const colors = ["#e5292f", "#ff8f1f", "#ffe12b", "#21a950", "#2878d5", "#7a3db8"];
  ctx.save();
  ctx.translate(650, 250);
  ctx.rotate(0.28);
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, i * 34, 1050, 34);
  });
  ctx.restore();

  ctx.fillStyle = "#111";
  ctx.font = "900 38px Arial";
  ctx.fillText("DOB 06/03/1981", 710, 305);
  ctx.fillText("EXP 06/03/2008", 1175, 305);

  ctx.font = "28px Arial";
  ctx.fillText("HT", 720, 385);
  ctx.fillText("WT", 865, 385);
  ctx.fillText("HAIR", 1010, 385);
  ctx.fillText("EYES", 1160, 385);
  ctx.fillText("SEX", 1310, 385);
  ctx.fillText("CTY", 1455, 385);

  ctx.font = "30px Arial";
  ctx.fillText("6-10", 720, 435);
  ctx.fillText("150", 865, 435);
  ctx.fillText("BRO", 1010, 435);
  ctx.fillText("BRO", 1160, 435);
  ctx.fillText("YES", 1310, 435);
  ctx.fillText("0", 1455, 435);

  ctx.font = "28px Arial";
  ctx.fillText("ISSUE   DATE   CLASS   RESTR   ENDORSE", 710, 505);
  ctx.fillText("06/18/1998        3", 710, 560);

  ctx.fillStyle = "#f9f9f9";
  ctx.fillRect(90, 90, 580, 475);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 5;
  ctx.strokeRect(90, 90, 580, 475);

  ctx.fillStyle = "#111";
  let x = 95;
  const bars = [6,3,8,2,4,7,3,9,2,5,4,8,2,6,3,7,5,2,9,4,3,7,2,6,5,3,8,2,4,7,3,9,2,5];
  bars.forEach((bw, i) => {
    if (i % 2 === 0) ctx.fillRect(x, 610, bw, 120);
    x += bw + 4;
  });

  ctx.font = "900 40px Arial";
  ctx.fillText("Mc LOVIN", 100, 780);
  ctx.fillText("892 MOMONA ST", 100, 840);
  ctx.fillText("HONOLULU , HI 96820", 100, 900);

  ctx.font = "54px cursive";
  ctx.fillText("McLovin", 850, 735);
}


function slotsFor(frame) {
  if (frame.style === "hawaii") return [[90, 90, 580, 475]];
  if (frame.style === "license") return [[130, 470, 580, 640]];
  const p = frame.poses;
  const w = frame.w, h = frame.h;
  const slots = [];

  if (frame.ratio === "2x6") {
    const marginX = frame.style === "film" ? 105 : 80;
    const top = 90;
    const bottom = 420;
    const gap = 36;
    const slotW = w - marginX * 2;
    const slotH = (h - top - bottom - gap * (p - 1)) / p;
    for (let i = 0; i < p; i++) slots.push([marginX, top + i * (slotH + gap), slotW, slotH]);
    return slots;
  }

  if (p === 1) return [[180, 320, w - 360, h - 760]];
  if (p === 2) return [[160, 170, w - 320, 820], [160, 1050, w - 320, 820]];
  if (p === 4) return [[120, 160, 640, 760], [840, 160, 640, 760], [120, 1000, 640, 760], [840, 1000, 640, 760]];
  if (p === 6) {
    const colW = 680, rowH = 520, gapX = 40, gapY = 30, marginX = 100, top = 120;
    const x1 = marginX, x2 = marginX + colW + gapX;
    const y1 = top, y2 = y1 + rowH + gapY, y3 = y2 + rowH + gapY;
    return [
      [x1, y1, colW, rowH], [x2, y1, colW, rowH],
      [x1, y2, colW, rowH], [x2, y2, colW, rowH],
      [x1, y3, colW, rowH], [x2, y3, colW, rowH]
    ];
  }
  return slots;
}

function drawEmptyFrame() {
  const frame = selectedFrame();
  setupCanvas(frame);
  paper(frame);
  const slots = slotsFor(frame);
  slots.forEach((slot, i) => {
    const label = modeSelect.value === "two" ? `${i % 2 === 0 ? "Host" : "Guest"} ${Math.floor(i / 2) + 1}` : `Pose ${i + 1}`;
    drawSlot(slot, label, frame);
  });
  brand(frame);
}

function drawSlot(slot, text, frame) {
  const [x, y, w, h] = slot;
  ctx.fillStyle = (frame.style === "license" || frame.style === "hawaii") ? "#efefef" : (frame.style === "classic" ? "#fffdf5" : "#ffffff");
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = frame.style === "lips" ? "#3b0509" : "#080808";
  ctx.lineWidth = frame.style === "polaroid" ? 18 : 10;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#766b5f";
  ctx.textAlign = "center";
  ctx.font = `bold ${Math.max(24, Math.min(w, h) * 0.08)}px Arial`;
  ctx.fillText(text, x + w / 2, y + h / 2);
}

function orderImages(localImages, remoteImages, totalSlots) {
  if (modeSelect.value === "one" || !remoteImages.length) return Array.from({ length: totalSlots }, (_, i) => localImages[i % localImages.length]);
  const hostImages = isHost ? localImages : remoteImages;
  const guestImages = isHost ? remoteImages : localImages;
  const output = [];
  for (let i = 0; i < totalSlots; i++) {
    if (i % 2 === 0) output.push(hostImages[Math.floor(i / 2)] || hostImages[hostImages.length - 1] || guestImages[0]);
    else output.push(guestImages[Math.floor(i / 2)] || guestImages[guestImages.length - 1] || hostImages[0]);
  }
  return output;
}

function drawFinal(localImages, remoteImages) {
  const frame = selectedFrame();
  setupCanvas(frame);
  paper(frame);
  const slots = slotsFor(frame);
  const images = orderImages(localImages, remoteImages, frame.poses);

  slots.forEach((slot, i) => {
    cover(images[i % images.length], ...slot);
    ctx.strokeStyle = frame.style === "lips" ? "#3b0509" : "#080808";
    ctx.lineWidth = frame.style === "polaroid" ? 18 : 10;
    ctx.strokeRect(...slot);
  });

  brand(frame);
}

function cover(img, x, y, w, h) {
  const imageRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imageRatio > boxRatio) { sw = img.height * boxRatio; sx = (img.width - sw) / 2; }
  else { sh = img.width / boxRatio; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);

  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.1, x + w / 2, y + h / 2, Math.max(w, h) * 0.65);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(0,0,0,.18)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function brand(frame) {
  if (frame.style === "license" || frame.style === "hawaii") return;
  ctx.textAlign = "center";
  const strip = frame.ratio === "2x6";
  const y1 = frame.h - (strip ? 310 : 260);
  const y2 = frame.h - (strip ? 235 : 180);
  ctx.fillStyle = frame.style === "classic" || frame.style === "film" ? "#fff8ea" : "#160d0d";
  ctx.font = `900 ${strip ? 70 : 86}px Arial`;
  ctx.fillText("CHEEZY", frame.w / 2, y1);
  ctx.fillStyle = frame.style === "classic" || frame.style === "film" ? "#a9dcf7" : "#9a0f24";
  ctx.font = `bold ${strip ? 30 : 38}px Arial`;
  ctx.fillText("by Billy", frame.w / 2, y2);
}

languageBtn.onclick = () => { lang = lang === "en" ? "mn" : "en"; localStorage.setItem("cheezyLang", lang); applyLanguage(); };
landingLangBtn.onclick = () => { lang = lang === "en" ? "mn" : "en"; localStorage.setItem("cheezyLang", lang); applyLanguage(); };
startBtn.onclick = startCameraAndJoin;
copyLinkBtn.onclick = copyLink;
readyBtn.onclick = toggleReady;
shootBtn.onclick = requestShoot;
resetBtn.onclick = () => { resetPhotos(true, true); showBoothApp(); };
homeFromResultBtn.onclick = () => { resetPhotos(true, true); showLanding(); };
enterBoothBtn.onclick = showBoothApp;
backToLandingBtn.onclick = showLanding;
igEarnBtnLanding.onclick = claimInstagramBonus;
igEarnBtnApp.onclick = claimInstagramBonus;
redeemBtnLanding.onclick = () => redeemCode(redeemInputLanding, redeemMsgLanding);
redeemBtnApp.onclick = () => redeemCode(redeemInputApp, redeemMsgApp);
[redeemInputLanding, redeemInputApp].forEach((input, idx) => {
  const btn = idx === 0 ? redeemBtnLanding : redeemBtnApp;
  input.addEventListener("input", () => input.value = input.value.replace(/\D/g, "").slice(0, 6));
  input.addEventListener("keydown", event => { if (event.key === "Enter") btn.click(); });
});
document.querySelectorAll(".person-card-btn").forEach(btn => btn.addEventListener("click", openBusinessCard));
closeBusinessCardBtn.onclick = closeBusinessCard;
businessCardBackdrop.onclick = closeBusinessCard;

modeSelect.onchange = () => { updateModeUI(true); onSettingsChanged(true); };
poseSelect.onchange = () => onSettingsChanged(true);
filterSelect.onchange = () => { drawIfReady(); emitSettings(); };
timerSelect.onchange = () => { updatePoseNote(); emitSettings(); };
nameInput.oninput = () => { localNameLabel.textContent = getName(); drawIfReady(); socket.emit("update-profile", { name: getName() }); };

applyRoleUI();
applyLanguage();
refreshFrameUI();
updateModeUI(false);
drawEmptyFrame();
renderLandingGallery();
renderTokenUI();
tokenStatus.classList.add("hidden");
showLanding();
