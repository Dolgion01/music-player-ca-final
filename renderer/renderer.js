// Get HTML elements
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const volume = document.getElementById('volume');
const progress = document.getElementById('progress');
const muteBtn = document.getElementById('mute');
const lyricsBox = document.getElementById('lyricsBox');
const toggleTheme = document.getElementById('toggleTheme');
const selectFolderBtn = document.getElementById('selectFolder');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const playlistElem = document.getElementById('playlist');

let tracks = [];
let currentTrack = 0;

// Theme toggle
toggleTheme?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Load theme from storage
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  toggleTheme.checked = true;
}

//  Mute audio 
muteBtn?.addEventListener('click', () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? '🔈' : '🔇';
});

//  Keyboard shortcuts for play, pause, next, previous, volume up and down
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return; // Ignore typing in input fields

  switch (e.key) {
    case ' ':
      e.preventDefault();
      audio.paused ? audio.play() : audio.pause();
      break;
    case 'ArrowRight':
      if (currentTrack < tracks.length - 1) loadTrack(++currentTrack);
      audio.play();
      break;
    case 'ArrowLeft':
      if (currentTrack > 0) loadTrack(--currentTrack);
      audio.play();
      break;
    case 'ArrowUp':
      e.preventDefault();
      audio.volume = Math.min(1, audio.volume + 0.1);
      volume.value = audio.volume;
      break;
    case 'ArrowDown':
      e.preventDefault();
      audio.volume = Math.max(0, audio.volume - 0.1);
      volume.value = audio.volume;
      break;
    case 'm':
    case 'M':
      audio.muted = !audio.muted;
      break;
  }
});

//  Show notification with current track information
function showTrackNotification(track) {
  new Notification('🎵 Now Playing', {
    body: `${track.title} — ${track.artist}`
  });
}

//  Remove extra info from song title/artist
function cleanMetadata(text) {
  return text
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*/i, '')
    .replace(/ft\..*/i, '')
    .replace(/- .*$/, '')
    .trim();
}

//  Fetch lyrics from lyrics API
async function fetchLyrics(artist, title) {
  const cleanArtist = cleanMetadata(artist);
  const cleanTitle = cleanMetadata(title);

  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`);
    const data = await res.json();
    return data.lyrics || ' Lyrics not found.';
  } catch {
    return ' Error fetching lyrics.';
  }
}

// Visualizer Setup
const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');
let audioCtx, analyser, source, dataArray, bufferLength;

// Initialize audio visualizer
function setupVisualizer() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  animateVisualizer();
}

// Draw bars for visualizer
function animateVisualizer() {
  requestAnimationFrame(animateVisualizer);

  analyser.getByteFrequencyData(dataArray);

  const width = canvas.width;
  const height = canvas.height;
  const barWidth = (width / bufferLength) * 1.5;
  let x = 0;

  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i];
    ctx.fillStyle = `rgb(${barHeight + 100}, 100, 180)`;
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

// Load track into player
function loadTrack(index) {
  currentTrack = index;
  const track = tracks[index];
  if (!track) return;

  audio.src = track.path;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  audio.load();
  showTrackNotification(track);

  fetchLyrics(track.artist, track.title).then(lyrics => {
    lyricsBox.textContent = lyrics;
  });

  highlightActiveTrack();
  setupVisualizer();
}

// Select folder and load playlist
selectFolderBtn?.addEventListener('click', async () => {
  const folder = await window.electronAPI.selectFolder();
  if (!folder) return;

  const files = window.electronAPI.getFiles(folder);
  tracks = await Promise.all(files.map(async file => {
    const meta = await window.electronAPI.getMetadata(file.path);
    return { ...file, ...meta };
  }));

  // Display playlist
  playlistElem.innerHTML = tracks.map((track, index) =>
    `<li data-index="${index}">${track.title} - ${track.artist}</li>`
  ).join('');

  // Add click to play functionality
  playlistElem.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.getAttribute('data-index'));
      loadTrack(index);
      audio.play();
    });
  });

  loadTrack(0);
});

// Highlight current track in playlist
function highlightActiveTrack() {
  const items = playlistElem.querySelectorAll('li');
  items.forEach((item, index) => {
    item.style.fontWeight = index === currentTrack ? 'bold' : 'normal';
    item.style.background = index === currentTrack ? 'rgba(255,255,255,0.2)' : 'transparent';
  });
}

// Playback buttons
playBtn.onclick = () => audio.paused ? audio.play() : audio.pause();
nextBtn.onclick = () => { if (currentTrack < tracks.length - 1) loadTrack(++currentTrack); audio.play(); };
prevBtn.onclick = () => { if (currentTrack > 0) loadTrack(--currentTrack); audio.play(); };

// Volume and progress slider
volume.oninput = () => audio.volume = volume.value;
audio.ontimeupdate = () => progress.value = (audio.currentTime / audio.duration) * 100;
progress.oninput = () => audio.currentTime = (progress.value / 100) * audio.duration;

// Resize canvas when window resizes
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
