# Cheezy by Billy v12 Clean Fixed

This version is rebuilt cleanly.

Fixes:
- Removed the Live together preview section completely.
- Fixed broken/messy JavaScript from previous patches.
- Start camera button is always visible.
- Host sees Start photo booth button.
- Guest does not see host-only controls.
- Guest can press Ready and download PNG.
- 2-person photo capture does not require live WebRTC video.
- Turn-based 2-person flow:
  - Slot 1 = Host pose 1
  - Slot 2 = Guest pose 1
  - Slot 3 = Host pose 2
  - Slot 4 = Guest pose 2
- Final layout keeps Host photos in Host slots and Guest photos in Guest slots.

Render:
Build Command: npm install
Start Command: npm start

Upload these top-level files to GitHub:
- package.json
- server.js
- README.md
- public/


## v13 Start button fix
- Host Start photo booth button no longer waits for the browser to perfectly detect the guest ready state.
- Host button activates when host camera is on and host has pressed Ready.
- When clicked, the server checks whether the guest is ready.
- If guest is not ready, the host sees a clear message instead of a permanently disabled button.
