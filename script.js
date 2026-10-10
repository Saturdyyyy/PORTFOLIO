const BACKEND='https://saturdyyyy-server.onrender.com';
const $=id=>document.getElementById(id);
// dots
(()=>{const d=document.createElement('div');d.className='dots';document.body.prepend(d)})();
let playing=false;
async function np(){
  try{
    const r=await fetch(BACKEND+'/now-playing');const d=await r.json();
    playing=!!d.isPlaying;
    const name=d.trackName||'Not playing',art=d.artist||'Spotify';
    if($('mTrack'))$('mTrack').textContent=name;
    if($('mPlay'))$('mPlay').textContent=playing?'⏸':'▶';
    if($('mArt')&&d.albumArt){$('mArt').src=d.albumArt}
    if($('npTrack'))$('npTrack').textContent=name;
    if($('npArtist'))$('npArtist').textContent=d.trackName?art:'Nothing on right now';
    if($('npStatus'))$('npStatus').textContent=playing?'● LIVE ON SPOTIFY':'LAST SEEN OFFLINE';
    if($('npImg')&&d.albumArt)$('npImg').src=d.albumArt;
  }catch(e){}
}
async function recent(){
  const l=$('recent');if(!l)return;
  try{const r=await fetch(BACKEND+'/recent');const t=await r.json();
    if(t.length)l.innerHTML=t.map(x=>`<li>${x.name.replace(/</g,'&lt;')} <span style="color:#666">· ${x.artist.replace(/</g,'&lt;')}</span></li>`).join('');}catch(e){}
}
async function ctl(p){try{await fetch(BACKEND+p,{method:'POST'});setTimeout(np,600)}catch(e){}}
$('mPlay')?.addEventListener('click',()=>ctl(playing?'/pause':'/play'));
$('mNext')?.addEventListener('click',()=>ctl('/next'));
$('mPrev')?.addEventListener('click',()=>ctl('/prev'));
np();recent();setInterval(np,5000);
