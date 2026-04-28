// ═══════════════════════════════════════════════════
// SATURDYYYY — SPOTIFY BACKEND SERVER
// ═══════════════════════════════════════════════════
// SETUP STEPS:
// 1. npm install express axios cors
// 2. Paste your CLIENT_SECRET below (never share it)
// 3. node server.js
// 4. Visit http://localhost:3001/login in your browser
// 5. Approve Spotify access
// 6. Copy the refresh token shown on screen
// 7. Paste it into REFRESH_TOKEN below
// 8. Restart: node server.js
// 9. Your portfolio now has live Spotify data!
// ═══════════════════════════════════════════════════

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── YOUR CREDENTIALS ───────────────────────────────
const CLIENT_ID     = '20cbe9b5e25a4c808410b2d0ad5f01be';
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI  = 'http://127.0.0.1:3001/callback';
// ────────────────────────────────────────────────────

// After step 5-6 above, paste your refresh token here:
let REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const B64 = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

// ─── GET ACCESS TOKEN ────────────────────────────────
async function getAccessToken() {
  const res = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN
    }),
    {
      headers: {
        Authorization: `Basic ${B64}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return res.data.access_token;
}

// ─── STEP 1: LOGIN ──────────────────────────────────
app.get('/login', (req, res) => {
  const scopes = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-modify-playback-state',
    'user-read-playback-state',
    'streaming'
  ].join(' ');

  const url = 'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URI
    });

  res.redirect(url);
});

// ─── STEP 2: CALLBACK (gets refresh token) ──────────
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('Error: no code received');

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          Authorization: `Basic ${B64}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    REFRESH_TOKEN = response.data.refresh_token;

    res.send(`
      <html>
      <body style="background:#080808;color:#ebdb4c;font-family:monospace;padding:40px;">
        <h2 style="color:#3cda7e;">✅ SPOTIFY CONNECTED!</h2>
        <p>Copy this refresh token and paste it into server.js as REFRESH_TOKEN:</p>
        <div style="background:#1a1a1a;padding:20px;margin:20px 0;word-break:break-all;color:#fff;border:1px solid #333;">
          ${REFRESH_TOKEN}
        </div>
        <p style="color:#666;">Then restart: <code style="color:#ebdb4c;">node server.js</code></p>
        <p style="color:#666;">Your portfolio Spotify is now live 🎵</p>
      </body>
      </html>
    `);
  } catch (e) {
    res.send('Error getting token: ' + e.message + '<br/>Make sure your CLIENT_SECRET is correct and redirect URI matches.');
  }
});

// ─── NOW PLAYING ─────────────────────────────────────
app.get('/now-playing', async (req, res) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/currently-playing',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.data || response.status === 204) {
      return res.json({ isPlaying: false });
    }

    const item = response.data.item;
    res.json({
      isPlaying: response.data.is_playing,
      trackName: item.name,
      artist: item.artists.map(a => a.name).join(', '),
      album: item.album.name,
      albumArt: item.album.images[0]?.url,
      progress: response.data.progress_ms,
      duration: item.duration_ms,
      uri: item.uri
    });
  } catch (e) {
    console.error('now-playing error:', e.message);
    res.json({ isPlaying: false });
  }
});

// ─── RECENT PLAYS ────────────────────────────────────
app.get('/recent', async (req, res) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played?limit=5',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const tracks = response.data.items.map(i => ({
      name: i.track.name,
      artist: i.track.artists.map(a => a.name).join(', '),
      albumArt: i.track.album.images[2]?.url || i.track.album.images[0]?.url,
      uri: i.track.uri
    }));

    res.json(tracks);
  } catch (e) {
    console.error('recent error:', e.message);
    res.json([]);
  }
});

// ─── PLAYBACK CONTROLS ───────────────────────────────
app.post('/play', async (req, res) => {
  try {
    const token = await getAccessToken();
    await axios.put('https://api.spotify.com/v1/me/player/play', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json({ ok: true });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

app.post('/pause', async (req, res) => {
  try {
    const token = await getAccessToken();
    await axios.put('https://api.spotify.com/v1/me/player/pause', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json({ ok: true });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

app.post('/next', async (req, res) => {
  try {
    const token = await getAccessToken();
    await axios.post('https://api.spotify.com/v1/me/player/next', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json({ ok: true });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

app.post('/prev', async (req, res) => {
  try {
    const token = await getAccessToken();
    await axios.post('https://api.spotify.com/v1/me/player/previous', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json({ ok: true });
  } catch (e) { res.json({ ok: false, error: e.message }); }
});

// ─── START SERVER ────────────────────────────────────
app.listen(3001, () => {
  console.log('');
  console.log('🎵 SATURDYYYY Spotify Server running!');
  console.log('');
  console.log('If first time setup → visit: http://localhost:3001/login');
  console.log('Otherwise your portfolio is live on: http://localhost:3001');
  console.log('');
});
