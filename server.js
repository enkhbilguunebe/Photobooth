const express=require('express'),http=require('http'),path=require('path');
const {Server}=require('socket.io');
const app=express(),server=http.createServer(app),io=new Server(server,{maxHttpBufferSize:25e6,cors:{origin:'*',methods:['GET','POST']}});
const PORT=process.env.PORT||3000,rooms=new Map();
app.use(express.static(path.join(__dirname,'public')));
app.get('/room/:roomId',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
function room(id){if(!rooms.has(id))rooms.set(id,{users:[],names:{},ready:{}});return rooms.get(id)}
function state(id){const r=room(id);return{roomId:id,userCount:r.users.length,names:r.names,ready:r.ready}}
function leave(s){const id=s.data.roomId;if(!id||!rooms.has(id))return;const r=rooms.get(id);r.users=r.users.filter(x=>x!==s.id);delete r.names[s.id];delete r.ready[s.id];if(!r.users.length)rooms.delete(id);else{io.to(id).emit('room-state',state(id));s.to(id).emit('peer-left',state(id))}}
io.on('connection',s=>{
 s.on('join-room',({roomId,name})=>{if(!roomId)return;const r=room(roomId);if(r.users.length>=2&&!r.users.includes(s.id))return s.emit('room-full');if(!r.users.includes(s.id))r.users.push(s.id);s.data.roomId=roomId;s.join(roomId);r.names[s.id]=name||'Guest';r.ready[s.id]=false;s.emit('room-joined',{...state(roomId),yourId:s.id});s.to(roomId).emit('room-state',state(roomId));if(r.users.length===1)return s.emit('waiting-for-peer',state(roomId));const[a,b]=r.users;io.to(a).emit('peer-ready',{peerId:b,shouldCreateOffer:true,state:state(roomId)});io.to(b).emit('peer-ready',{peerId:a,shouldCreateOffer:false,state:state(roomId)})});
 s.on('update-profile',({name})=>{const id=s.data.roomId;if(!id||!rooms.has(id))return;room(id).names[s.id]=name||'Guest';io.to(id).emit('room-state',state(id))});
 s.on('set-ready',({ready})=>{const id=s.data.roomId;if(!id||!rooms.has(id))return;room(id).ready[s.id]=!!ready;io.to(id).emit('room-state',state(id))});
 s.on('signal',({to,data})=>{if(to&&data)io.to(to).emit('signal',{from:s.id,data})});
 s.on('request-shoot',({mode='two',poses=1,seconds=3})=>{const id=s.data.roomId;if(!id||!rooms.has(id))return;const r=room(id);poses=Math.max(1,Math.min(+poses||1,4));seconds=Math.max(1,Math.min(+seconds||3,10));if(mode==='two'){if(!(r.users.length===2&&r.users.every(u=>r.ready[u])))return s.emit('not-ready',{message:'Both people must be connected and ready.'});return io.to(id).emit('shoot-start',{startAt:Date.now()+1000,seconds,poses,mode:'two',state:state(id)})}if(!r.ready[s.id])return s.emit('not-ready',{message:'Press Ready first.'});s.emit('shoot-start',{startAt:Date.now()+700,seconds,poses,mode:'one',state:state(id)})});
 s.on('photos-captured',({images,name})=>{const id=s.data.roomId;if(id&&Array.isArray(images))s.to(id).emit('peer-photos',{images,name:name||'Friend'})});
 s.on('disconnect',()=>leave(s));
});
server.listen(PORT,()=>console.log('Cheezy by Billy running on http://localhost:'+PORT));
