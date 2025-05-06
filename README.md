# music-player-ca-final
# 🎵 Electron Desktop Music Player

A sleek, offline desktop music player built with Electron and JavaScript. Supports MP3/WAV files, metadata display, live audio visualizer, lyrics fetching, and light/dark mode. Designed with 💖 and powered by HTML/CSS/JS.

---

## ✨ Features

- 🎧 Play `.mp3` and `.wav` files from a local folder
- 📁 Load all tracks from selected folder
- 🏷️ Displays track title and artist (from metadata)
- 🔊 Playback controls (play, pause, next, previous)
- 📈 Live waveform audio visualizer (Web Audio API)
- 🎤 Lyrics fetched via [lyrics.ovh](https://lyricsovh.docs.apiary.io/)
- 💡 Light/dark theme toggle (saved in browser storage)
- 🔔 Desktop notification on track change
- 🎹 Keyboard shortcuts for playback & volume
- 💽 Fully offline (no login, no internet required — except for lyrics)

---

## 🖥️ How It Works

1. User clicks **"Select Folder"** to load a folder with audio files.
2. App reads all `.mp3` and `.wav` files and extracts their metadata (title/artist).
3. First track auto-loads; playlist appears in the sidebar.
4. User can:
   - Click a track to play
   - Use on-screen buttons or keyboard shortcuts
   - See lyrics fetched based on track metadata
   - Watch a live waveform visualizer
   - Switch between light and dark theme
5. When a track changes, a notification pops up with song details.

---
> ## 🎮 Keyboard Shortcuts

| Action            | Shortcut           |
|-------------------|--------------------|
| Play / Pause      | `Space`            |
| Next Track        | `→` (Arrow Right)  |
| Previous Track    | `←` (Arrow Left)   |
| Volume Up         | `↑` (Arrow Up)     |
| Volume Down       | `↓` (Arrow Down)   |
| Mute / Unmute     | `M` or `m`         |


## 🧑‍💻 Installation & Setup

> ⚠️ You must have [Node.js](https://nodejs.org) installed first.


```bash
# 1. Clone the repository
git clone https://github.com/Dolgion01/music-player-ca-final.git
cd music-player-ca-final



# 2. Install dependencies
npm install

# 3. Start the app
npm start


