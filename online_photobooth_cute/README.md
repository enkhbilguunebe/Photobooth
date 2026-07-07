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
