# Online Photo Booth — WebRTC Option 2

This is a two-person online photo booth.

## What it does
- Creates a shareable room link
- Two people join the same room
- Both cameras connect live using WebRTC
- Socket.IO handles signaling and the shared countdown
- Either person can press **Take Together**
- Both browsers capture their own photo at the countdown
- The final image shows both people together in one frame
- The final frame can be downloaded as PNG

## How to run locally

Install Node.js first.

Then run:

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Copy the room link and open it in another browser/device.

## Important notes
- Camera usually requires `localhost` or HTTPS.
- For real online use, deploy the app to a server with HTTPS.
- The included STUN server is enough for many tests, but real production usually needs a TURN server so WebRTC works on strict networks.
- This starter supports 2 people per room.
