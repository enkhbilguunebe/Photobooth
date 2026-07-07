# Cheezy by Billy v8 Stable

Fixes:
- 2-person Start photo booth button logic fixed.
- Button enables only when both videos are truly connected and both users are ready.
- Server tracks peer-connected state.
- Live together preview included.
- Reduced shooting delay with server timestamp sync.
- 2-second timer option added.
- Reconnection state handling improved.

Important:
- True zero-delay is impossible across the internet.
- If two users are far away and video does not connect on some Wi-Fi/cellular networks, you need a TURN server for production WebRTC reliability.

Render:
Build Command: npm install
Start Command: npm start


## v9 Admin/Guest mode
- The first person who creates/opens a room is the Host/Admin.
- Host can choose layout, filter, timer, mode, and start the photo booth.
- Guest can choose only 1-person/2-person mode, start/join camera, press Ready, retake, and download PNG.
- In 2-person mode, Guest cannot change layout/filter/timer or start the booth.
- Host settings sync automatically to the guest.
