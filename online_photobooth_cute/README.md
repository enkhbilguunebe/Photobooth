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


## v10 Austria-safe update
This version fixes long-distance 2-person photo taking.

Important change:
- 2-person photo taking no longer requires WebRTC live video to connect.
- Both people only need to join the same room and press Ready.
- The host can start the booth even if live video preview fails.
- Photos are exchanged through the Render Socket.IO server, so Canada ↔ Austria should work better.

Live video note:
- The live video preview still tries to connect peer-to-peer.
- If live video does not connect across countries, that is a NAT/firewall issue.
- For true reliable live video, add a TURN server such as Twilio, Metered, or your own coturn server.


## v11 Turn-based 2-person posing
- Slot order is fixed: Host 1, Guest 1, Host 2, Guest 2.
- Each person only poses on their own turn.
- Final layout always keeps the host in host slots and the guest in guest slots.
