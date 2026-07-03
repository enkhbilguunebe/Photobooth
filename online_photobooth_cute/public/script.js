// ===== LANGUAGE BUTTON FIX =====
const CHEEZY_TEXT = {
  en: {
    btn: "MN",
    heroTitle: "Let’s get Cheezy",
    name: "Name",
    mode: "Mode",
    layout: "Layout",
    filter: "Filter",
    timer: "Seconds each pose",
    share: "Send this room link",
    copy: "Copy link",
    readyStart: "Ready to start",
    initialStatus: "Start your camera. In 2-person mode, send the room link to your friend.",
    cameraNotStarted: "Camera not started",
    waitingFriend: "Waiting for friend",
    startCamera: "Start camera",
    sendRoom: "Send room link",
    startJoin: "Start camera & join",
    ready: "I'm ready",
    readyDone: "Ready ✓",
    startBooth: "Start photo booth",
    retake: "Retake",
    finalPrint: "Final booth print",
    resultHint: "Choose layout and filter, then start the booth.",
    download: "Download PNG",
    offline: "offline",
    waiting: "waiting",
    notReady: "not ready",
    onePerson: "1 person",
    twoPeople: "2 people",
    noFilter: "No filter",
    contrast: "More contrast",
    boothbw: "Vintage booth B/W",
    oldbw: "Old black & white",
    vintage: "Retro warm",
    soft: "Soft pastel"
  },

  mn: {
    btn: "EN",
    heroTitle: "Cheezy зураг авцгаая",
    name: "Нэр",
    mode: "Горим",
    layout: "Загвар",
    filter: "Өнгөний эффект",
    timer: "Зураг бүрийн тоолуур",
    share: "Найздаа явуулах холбоос",
    copy: "Холбоос хуулах",
    readyStart: "Эхлэхэд бэлэн",
    initialStatus: "Камераа асаана уу. 2 хүний горимд холбоосоо найздаа явуулна.",
    cameraNotStarted: "Камер асаагүй байна",
    waitingFriend: "Найзыгаа хүлээж байна",
    startCamera: "Камераа асаах",
    sendRoom: "Холбоосоо явуулна уу",
    startJoin: "Камер асааж орох",
    ready: "Би бэлэн",
    readyDone: "Бэлэн ✓",
    startBooth: "Зураг авч эхлэх",
    retake: "Дахин авах",
    finalPrint: "Бэлэн зураг",
    resultHint: "Загвар, эффектээ сонгоод зураг авч эхлээрэй.",
    download: "PNG татах",
    offline: "асаагүй",
    waiting: "хүлээж байна",
    notReady: "бэлэн биш",
    onePerson: "1 хүн",
    twoPeople: "2 хүн",
    noFilter: "Эффектгүй",
    contrast: "Контраст нэмэх",
    boothbw: "Хуучны хар-цагаан",
    oldbw: "Сонгодог хар-цагаан",
    vintage: "Дулаан ретро",
    soft: "Зөөлөн пастел"
  }
};

let cheezyLang = localStorage.getItem("cheezyLang") || "en";

function getLangBtn() {
  let btn = document.getElementById("languageBtn");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "languageBtn";
    btn.className = "lang-btn";
    btn.type = "button";

    const room = document.getElementById("roomChip");
    if (room && room.parentElement) {
      room.parentElement.insertBefore(btn, room);
    } else {
      document.body.prepend(btn);
    }
  }

  btn.style.pointerEvents = "auto";
  btn.style.cursor = "pointer";
  btn.style.zIndex = "999999";
  btn.style.position = "relative";

  return btn;
}

function setLabel(controlId, text) {
  const el = document.getElementById(controlId);
  if (!el) return;

  const label = el.closest("label");
  if (!label) return;

  for (const node of label.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      node.textContent = text;
      break;
    }
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function applyCheezyLanguage() {
  const T = CHEEZY_TEXT[cheezyLang];
  const btn = getLangBtn();

  btn.textContent = T.btn;

  const hero = document.querySelector("[data-i18n='heroTitle']");
  if (hero) hero.textContent = T.heroTitle;

  setLabel("nameInput", T.name);
  setLabel("modeSelect", T.mode);
  setLabel("layoutSelect", T.layout);
  setLabel("filterSelect", T.filter);
  setLabel("timerSelect", T.timer);
  setLabel("shareLink", T.share);

  setText("copyLinkBtn", T.copy);
  setText("startBtn", T.startJoin);

  if (!readyBtn.disabled && localReady) {
    readyBtn.textContent = T.readyDone;
  } else {
    setText("readyBtn", T.ready);
  }

  setText("shootBtn", T.startBooth);
  setText("resetBtn", T.retake);
  setText("downloadLink", T.download);

  if (statusTitle.textContent === "Ready to start" || statusTitle.textContent === "Эхлэхэд бэлэн") {
    statusTitle.textContent = T.readyStart;
  }

  if (
    statusEl.textContent.includes("Start your camera") ||
    statusEl.textContent.includes("Камераа асаана")
  ) {
    statusEl.textContent = T.initialStatus;
  }

  if (
    localSub.textContent === "Camera not started" ||
    localSub.textContent === "Камер асаагүй байна"
  ) {
    localSub.textContent = T.cameraNotStarted;
  }

  if (
    remoteSub.textContent === "Waiting for friend" ||
    remoteSub.textContent === "Найзыгаа хүлээж байна"
  ) {
    remoteSub.textContent = T.waitingFriend;
  }

  if (
    localOverlay.textContent === "Start camera" ||
    localOverlay.textContent === "Камераа асаах"
  ) {
    localOverlay.textContent = T.startCamera;
  }

  if (
    remoteOverlay.textContent === "Send room link" ||
    remoteOverlay.textContent === "Холбоосоо явуулна уу"
  ) {
    remoteOverlay.textContent = T.sendRoom;
  }

  const finalTitle = document.querySelector("[data-i18n='finalPrint']");
  if (finalTitle) finalTitle.textContent = T.finalPrint;

  if (
    resultSub.textContent.includes("Choose layout") ||
    resultSub.textContent.includes("Загвар")
  ) {
    resultSub.textContent = T.resultHint;
  }

  if (localBadge.textContent === "offline" || localBadge.textContent === "асаагүй") {
    localBadge.textContent = T.offline;
  }

  if (remoteBadge.textContent === "waiting" || remoteBadge.textContent === "хүлээж байна") {
    remoteBadge.textContent = T.waiting;
  }

  if (resultBadge.textContent === "not ready" || resultBadge.textContent === "бэлэн биш") {
    resultBadge.textContent = T.notReady;
  }

  const modeOptions = modeSelect.options;
  if (modeOptions.length >= 2) {
    modeOptions[0].textContent = T.onePerson;
    modeOptions[1].textContent = T.twoPeople;
  }

  const filterOptions = filterSelect.options;
  if (filterOptions.length >= 6) {
    filterOptions[0].textContent = T.noFilter;
    filterOptions[1].textContent = T.contrast;
    filterOptions[2].textContent = T.boothbw;
    filterOptions[3].textContent = T.oldbw;
    filterOptions[4].textContent = T.vintage;
    filterOptions[5].textContent = T.soft;
  }
}

getLangBtn().onclick = function () {
  cheezyLang = cheezyLang === "en" ? "mn" : "en";
  localStorage.setItem("cheezyLang", cheezyLang);
  applyCheezyLanguage();
};

applyCheezyLanguage();
