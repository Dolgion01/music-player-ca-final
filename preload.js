// Import needed modules
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata'); // Library to read music file metadata

console.log("✅ preload.js loaded");

// Expose some APIs safely to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  
  // Function to select a folder 
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // Get the list of audio files from the folder
  getFiles: (dir) => {
    const files = fs.readdirSync(dir).filter(file => {
      return ['.mp3', '.wav', '.ogg'].includes(path.extname(file).toLowerCase());
    });

    // Return file names and the full path
    return files.map(file => ({
      name: file,
      path: path.join(dir, file)
    }));
  },

  // Read metadata (title, artist, duration) from the music file
  getMetadata: async (filePath) => {
    try {
      const metadata = await mm.parseFile(filePath);
      return {
        title: metadata.common.title || path.basename(filePath),
        artist: metadata.common.artist || 'Unknown Artist',
        duration: metadata.format.duration
      };
    } catch {
      // return fallback values if the reading fails
      return { title: path.basename(filePath), artist: 'Unknown', duration: 0 };
    }
  }
});

