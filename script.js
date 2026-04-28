// ═══════════════════════════════════════
// CLOCK
// ═══════════════════════════════════════
function updateClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('clock').textContent =
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  document.getElementById('dt').textContent =
    `${days[now.getDay()]}, ${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}`;
}
updateClock();
setInterval(updateClock, 1000);

// ═══════════════════════════════════════
// PAINT PENCIL CURSOR + QUICK TRAIL
// ═══════════════════════════════════════
const paintCursor = document.createElement('div');
paintCursor.id = 'paint-cursor';
paintCursor.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 21l1.5-5.5L18 2l4 4L8.5 19.5 3 21z" fill="white" stroke="white" stroke-width="0.4"/>
  <path d="M14.5 6.5l3 3" stroke="#bbb" stroke-width="1"/>
</svg>`;
document.body.appendChild(paintCursor);

let mouseX = 0, mouseY = 0;
let lastSpawn = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  paintCursor.style.left = mouseX + 'px';
  paintCursor.style.top = mouseY + 'px';

  const now = Date.now();
  if (now - lastSpawn < 20) return;
  lastSpawn = now;

  // White paint trail dot — vanishes in 0.5s
  const dot = document.createElement('div');
  dot.className = 'trail-stroke';
  const s = Math.random() * 5 + 2;
  dot.style.cssText = `width:${s}px;height:${s}px;left:${mouseX}px;top:${mouseY}px;`;
  document.body.appendChild(dot);
  setTimeout(() => dot.remove(), 550);
});

// ═══════════════════════════════════════
// TEXT SCRAMBLE — TITLES ONLY (.scramble)
// ═══════════════════════════════════════
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&!?';

function scramble(el) {
  if (el._scr) return;
  el._scr = true;
  const original = el.dataset.text || el.textContent;
  let f = 0;
  const total = Math.min(original.replace(/\s/g,'').length * 2, 20);
  const iv = setInterval(() => {
    el.textContent = original.split('').map((ch, i) => {
      if (' \n·—'.includes(ch)) return ch;
      if (i < Math.floor((f/total)*original.length)) return ch;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    f++;
    if (f > total) { el.textContent = original; el._scr = false; clearInterval(iv); }
  }, 32);
}

document.querySelectorAll('.scramble').forEach(el => {
  el.addEventListener('mouseenter', () => scramble(el));
});

// ═══════════════════════════════════════
// ZOOM + SCROLL
// ═══════════════════════════════════════
const zo = document.getElementById('zo');
const zl = document.getElementById('zl');

function zoom(letter, sectionId) {
  zl.textContent = letter;
  zo.classList.add('active');
  setTimeout(() => {
    zo.classList.remove('active');
    setTimeout(() => {
      const t = document.getElementById(sectionId);
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }, 650);
}

document.querySelectorAll('.nav-lw').forEach(el => {
  el.addEventListener('click', () => {
    zoom(el.dataset.l, el.dataset.s);
    document.querySelectorAll('.nav-lw').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
  });
});

document.querySelectorAll('.big-lw').forEach(el => {
  el.addEventListener('click', () => {
    zoom(el.dataset.l, el.dataset.s);
    document.querySelectorAll('.big-lw').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
  });
});

// ═══════════════════════════════════════
// SCROLL ACTIVE SECTION
// ═══════════════════════════════════════
const sections = ['soundcheck','alter-ego','tracklist','unreleased','reverb','directors-cut','now-playing'];
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      document.querySelectorAll('.nav-lw').forEach(el => el.classList.toggle('active', el.dataset.s === id));
      document.querySelectorAll('.big-lw').forEach(el => el.classList.toggle('active', el.dataset.s === id));
    }
  });
}, { threshold: 0.3 });
sections.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });

// ═══════════════════════════════════════
// DOTS CANVAS — mouse reactive, coloured
// ═══════════════════════════════════════
const canvas = document.getElementById('dotsCanvas');
const ctx = canvas.getContext('2d');
let dots = [], W, H;

function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }

function makeDots() {
  dots = [];
  const palette = ['rgba(60,218,126,','rgba(235,219,76,','rgba(91,156,246,','rgba(167,139,250,','rgba(80,80,80,'];
  for (let i = 0; i < 65; i++) {
    dots.push({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.4+0.4, vx:(Math.random()-.5)*.38, vy:(Math.random()-.5)*.38, a:Math.random()*.22+.04, col:palette[Math.floor(Math.random()*palette.length)] });
  }
}

function draw() {
  ctx.clearRect(0,0,W,H);
  dots.forEach(d => {
    d.x+=d.vx; d.y+=d.vy;
    if(d.x<0||d.x>W)d.vx*=-1; if(d.y<0||d.y>H)d.vy*=-1;
    const mdx=d.x-mouseX, mdy=d.y-mouseY, md=Math.sqrt(mdx*mdx+mdy*mdy);
    if(md<130){ctx.beginPath();ctx.strokeStyle=`rgba(235,219,76,${.1*(1-md/130)})`;ctx.lineWidth=.5;ctx.moveTo(d.x,d.y);ctx.lineTo(mouseX,mouseY);ctx.stroke();}
    dots.forEach(d2=>{const dx=d.x-d2.x,dy=d.y-d2.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<110){ctx.beginPath();ctx.strokeStyle=`rgba(40,40,40,${.25*(1-dist/110)})`;ctx.lineWidth=.5;ctx.moveTo(d.x,d.y);ctx.lineTo(d2.x,d2.y);ctx.stroke();}});
    ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fillStyle=`${d.col}${d.a})`;ctx.fill();
  });
  requestAnimationFrame(draw);
}
resize(); makeDots(); draw();
window.addEventListener('resize',()=>{resize();makeDots();});

// ═══════════════════════════════════════
// BEAT CATCH GAME
// ═══════════════════════════════════════
const gc = document.getElementById('gameCanvas');
const gx = gc?.getContext('2d');
const gOverlay = document.getElementById('gameOverlay');
const gBtn = document.getElementById('gameStartBtn');
const gScoreEl = document.getElementById('gameScore');
const gBestEl = document.getElementById('gameBest');

let gRunning=false, gScore=0, gBest=0, gNotes=[], gAnim=null;
const gPaddle = { x:130, y:175, w:44, h:7 };
const gSyms = ['♪','♫','♩','♬','♭'];
const gCols = ['#3cda7e','#ebdb4c','#5b9cf6','#a78bfa','#e05252'];

function gSpawn() {
  gNotes.push({ x:Math.random()*(gc.width-24)+12, y:-18, vy:1.4+gScore*.035, sym:gSyms[Math.floor(Math.random()*gSyms.length)], col:gCols[Math.floor(Math.random()*gCols.length)], sz:14+Math.random()*8 });
}

function gLoop() {
  gx.clearRect(0,0,gc.width,gc.height);
  // Grid
  gx.strokeStyle='#111'; gx.lineWidth=0.4;
  for(let x=0;x<gc.width;x+=20){gx.beginPath();gx.moveTo(x,0);gx.lineTo(x,gc.height);gx.stroke();}
  for(let y=0;y<gc.height;y+=20){gx.beginPath();gx.moveTo(0,y);gx.lineTo(gc.width,y);gx.stroke();}

  // Paddle glow
  gx.shadowColor='#ebdb4c'; gx.shadowBlur=8;
  gx.fillStyle='#ebdb4c';
  gx.fillRect(gPaddle.x-gPaddle.w/2, gPaddle.y, gPaddle.w, gPaddle.h);
  gx.shadowBlur=0;

  gNotes = gNotes.filter(n => {
    n.y += n.vy;
    const caught = n.y+14>=gPaddle.y && n.y<=gPaddle.y+gPaddle.h && n.x>=gPaddle.x-gPaddle.w/2-6 && n.x<=gPaddle.x+gPaddle.w/2+6;
    if(caught){ gScore++; gScoreEl.textContent=gScore; if(gScore>gBest){gBest=gScore;gBestEl.textContent=gBest;} return false; }
    if(n.y>gc.height+20){ gEnd(); return false; }
    gx.font=`${n.sz}px serif`; gx.fillStyle=n.col; gx.shadowColor=n.col; gx.shadowBlur=6; gx.fillText(n.sym,n.x-8,n.y); gx.shadowBlur=0;
    return true;
  });

  if(gRunning){
    if(Math.random()<.02+gScore*.0008) gSpawn();
    gAnim=requestAnimationFrame(gLoop);
  }
}

function gStart(){ gScore=0;gNotes=[];gPaddle.x=130;gScoreEl.textContent='0';gOverlay.classList.add('hidden');gRunning=true;gLoop(); }
function gEnd(){ gRunning=false;cancelAnimationFrame(gAnim);gOverlay.classList.remove('hidden');gBtn.textContent=`RETRY ▶  BEST:${gBest}`; }

if(gBtn) gBtn.addEventListener('click', gStart);
if(gc) gc.addEventListener('mousemove', e => { const r=gc.getBoundingClientRect(); gPaddle.x=Math.max(gPaddle.w/2,Math.min(gc.width-gPaddle.w/2,e.clientX-r.left)); });

// ═══════════════════════════════════════
// SPOTIFY BACKEND INTEGRATION
//
// ⚠️ Spotify blocks direct browser API calls (CORS).
// You need a tiny Node.js proxy server.
//
// SETUP:
// 1. npm install express axios cors
// 2. Create app at developer.spotify.com/dashboard
// 3. Paste CLIENT_ID + SECRET below in server.js
// 4. node server.js → visit localhost:3001/login → approve
// 5. Paste your refresh token back into server.js
// 6. Deploy server to Render (free) → update BACKEND below
//
// ─── server.js ───────────────────────────
// const express=require('express'),axios=require('axios'),cors=require('cors'),app=express();
// app.use(cors({origin:'*'}));
// const CID='YOUR_CLIENT_ID',CSC='YOUR_CLIENT_SECRET';
// let RT='YOUR_REFRESH_TOKEN';
// const B64=Buffer.from(CID+':'+CSC).toString('base64');
// async function tok(){const r=await axios.post('https://accounts.spotify.com/api/token',new URLSearchParams({grant_type:'refresh_token',refresh_token:RT}),{headers:{Authorization:'Basic '+B64,'Content-Type':'application/x-www-form-urlencoded'}});return r.data.access_token;}
// app.get('/login',(req,res)=>res.redirect('https://accounts.spotify.com/authorize?response_type=code&client_id='+CID+'&scope=user-read-currently-playing+user-read-recently-played+user-modify-playback-state+user-read-playback-state&redirect_uri=http://localhost:3001/cb'));
// app.get('/cb',async(req,res)=>{const r=await axios.post('https://accounts.spotify.com/api/token',new URLSearchParams({grant_type:'authorization_code',code:req.query.code,redirect_uri:'http://localhost:3001/cb'}),{headers:{Authorization:'Basic '+B64,'Content-Type':'application/x-www-form-urlencoded'}});RT=r.data.refresh_token;res.send('Refresh token: '+RT);});
// app.get('/now-playing',async(req,res)=>{try{const t=await tok(),r=await axios.get('https://api.spotify.com/v1/me/player/currently-playing',{headers:{Authorization:'Bearer '+t}});if(!r.data||r.status===204)return res.json({isPlaying:false});const i=r.data.item;res.json({isPlaying:r.data.is_playing,trackName:i.name,artist:i.artists.map(a=>a.name).join(', '),album:i.album.name,albumArt:i.album.images[0]?.url,progress:r.data.progress_ms,duration:i.duration_ms});}catch(e){res.json({isPlaying:false});}});
// app.get('/recent',async(req,res)=>{try{const t=await tok(),r=await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=5',{headers:{Authorization:'Bearer '+t}});res.json(r.data.items.map(i=>({name:i.track.name,artist:i.track.artists.map(a=>a.name).join(', '),albumArt:i.track.album.images[2]?.url})));}catch(e){res.json([]);}});
// app.post('/play',async(req,res)=>{try{const t=await tok();await axios.put('https://api.spotify.com/v1/me/player/play',{},{headers:{Authorization:'Bearer '+t}});res.json({ok:true});}catch(e){res.json({ok:false});}});
// app.post('/pause',async(req,res)=>{try{const t=await tok();await axios.put('https://api.spotify.com/v1/me/player/pause',{},{headers:{Authorization:'Bearer '+t}});res.json({ok:true});}catch(e){res.json({ok:false});}});
// app.post('/next',async(req,res)=>{try{const t=await tok();await axios.post('https://api.spotify.com/v1/me/player/next',{},{headers:{Authorization:'Bearer '+t}});res.json({ok:true});}catch(e){res.json({ok:false});}});
// app.post('/prev',async(req,res)=>{try{const t=await tok();await axios.post('https://api.spotify.com/v1/me/player/previous',{},{headers:{Authorization:'Bearer '+t}});res.json({ok:true});}catch(e){res.json({ok:false});}});
// app.listen(3001,()=>console.log('Running on :3001'));
// ─────────────────────────────────────────

// 🔁 Replace with your deployed backend URL
const BACKEND = 'http://127.0.0.1:3001';
let isPlaying = false;

const miniPlay = document.getElementById('miniPlay');
const miniTrack = document.getElementById('miniTrack');
const miniArtist = document.getElementById('miniArtist');
const miniAlbum = document.getElementById('miniAlbum');

miniPlay?.addEventListener('click', async () => {
  try {
    const endpoint = isPlaying ? '/pause' : '/play';
    await fetch(BACKEND + endpoint, { method: 'POST' });
    isPlaying = !isPlaying;
    miniPlay.textContent = isPlaying ? '⏸' : '▶';
  } catch(e) { console.log('Backend not connected — see script.js'); }
});

document.getElementById('miniNext')?.addEventListener('click', async () => {
  try { await fetch(BACKEND+'/next',{method:'POST'}); setTimeout(fetchNowPlaying,600); } catch(e){}
});

document.getElementById('miniPrev')?.addEventListener('click', async () => {
  try { await fetch(BACKEND+'/prev',{method:'POST'}); setTimeout(fetchNowPlaying,600); } catch(e){}
});

async function fetchNowPlaying() {
  try {
    const res = await fetch(BACKEND+'/now-playing');
    const d = await res.json();
    const tn=document.getElementById('track-name'),ta=document.getElementById('track-artist');
    const ns=document.getElementById('np-status'),ai=document.getElementById('album-img');
    const af=document.getElementById('album-fallback'),nf=document.getElementById('np-fill');
    if(d.isPlaying){
      isPlaying=true;
      const name=d.trackName?.toUpperCase()||'UNKNOWN';
      if(tn)tn.textContent=name;
      if(ta)ta.textContent=(d.artist+' · '+d.album).toUpperCase();
      if(ns)ns.textContent='▶ NOW PLAYING';
      if(miniTrack)miniTrack.textContent=name;
      if(miniArtist)miniArtist.textContent=d.artist?.toUpperCase()||'';
      if(miniPlay)miniPlay.textContent='⏸';
      if(d.albumArt){
        if(ai){ai.src=d.albumArt;ai.style.display='block';}
        if(af)af.style.display='none';
        if(miniAlbum)miniAlbum.innerHTML=`<img src="${d.albumArt}" style="width:100%;height:100%;object-fit:cover;display:block;"/>`;
      }
      if(d.progress&&d.duration&&nf)nf.style.width=((d.progress/d.duration)*100)+'%';
    } else {
      isPlaying=false;
      if(tn)tn.textContent='NOT PLAYING';
      if(ta)ta.textContent='OPEN SPOTIFY TO TUNE IN';
      if(ns)ns.textContent='OFFLINE';
      if(miniTrack)miniTrack.textContent='NOT PLAYING';
      if(miniArtist)miniArtist.textContent='SPOTIFY';
      if(miniPlay)miniPlay.textContent='▶';
      if(ai)ai.style.display='none';
      if(af)af.style.display='block';
    }
  } catch(e){
    const ns=document.getElementById('np-status');
    if(ns)ns.textContent='// CONNECT BACKEND';
  }
}

async function fetchRecentPlays() {
  const list = document.getElementById('recentList');
  if(!list) return;
  try {
    const res = await fetch(BACKEND+'/recent');
    const tracks = await res.json();
    if(!tracks.length) throw new Error('empty');
    list.innerHTML = tracks.map(t=>`
      <div class="recent-item">
        <div class="ri-art">${t.albumArt?`<img src="${t.albumArt}" alt=""/>`:' 🎵'}</div>
        <div class="ri-info">
          <div class="ri-name">${t.name.toUpperCase()}</div>
          <div class="ri-artist">${t.artist.toUpperCase()}</div>
        </div>
      </div>`).join('');
  } catch(e){
    if(list) list.innerHTML=`<div class="recent-item rp-loading"><div class="ri-art">🎵</div><div class="ri-info"><div class="ri-name">SETUP BACKEND</div><div class="ri-artist">SEE SCRIPT.JS COMMENTS</div></div></div>`;
  }
}

fetchNowPlaying();
fetchRecentPlays();
setInterval(fetchNowPlaying, 30000);
setInterval(fetchRecentPlays, 60000);
