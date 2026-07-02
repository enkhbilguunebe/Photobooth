# Cute Online Photo Booth

This is an upgraded two-person online photo booth using WebRTC + Socket.IO.

## Features
- Shareable room link
- Two-person live video connection
- Cute pastel design
- Display names
- Four theme choices:
  - Strawberry Milk
  - Soft Sky
  - Lavender Dream
  - Mint Matcha
- Ready button for both users
- Shared countdown
- Combined final image with cute frame
- Download PNG
- Better lobby/status messages

## Run locally

Install Node.js, then run:

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Copy the room link and open it in another browser or device.

## Use with far-away friend

Localhost only works on your own computer. For a real friend far away, deploy this project as a Node.js web service on Render, Railway, or another platform with HTTPS.

Render settings:

```text
Build Command: npm install
Start Command: npm start
```

## Important production note

The project uses a free public STUN server:

```js
stun:stun.l.google.com:19302
```

This works for many tests, but production WebRTC often needs a TURN server so people on strict Wi-Fi/cellular networks can connect.
