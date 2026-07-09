# Cheezy by Billy v21 Redeem + Contact

Current features:
- Landing page before the booth app.
- 3 free tokens on first visit.
- 1 token = 1 captured photo.
- Instagram follow bonus now gives 3 tokens.
- Admin can create 6 digit redeem codes at `/admin`.
- Each redeem code gives 5 tokens and can be used once.
- Users can redeem codes from the landing page or booth page.
- Gmail icon links to `mailto:biltrixtech@gmail.com`.
- Person icon opens the animated Biltrix business card modal.
- Keeps current pose/frame/token/photo booth logic.

Admin:
- Open `/admin`
- Click "Create 6 digit code"
- Give the code to a user
- User enters it in the redeem code bar
- Code adds 5 tokens

Important:
- Redeem codes are stored in server memory.
- Codes reset when Render restarts.
- For production, add password protection and a database later.

Render:
Build Command: npm install
Start Command: npm start
