// Import needed modules from Electron
const { app, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

// Function to create the main window for the app
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // preload script
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // app icon
  });

  mainWindow.loadFile('renderer/index.html'); // Load the main html file
  mainWindow.webContents.openDevTools(); // Open developer tools (for debugging)
}

// create window when the app is ready
app.whenReady().then(createWindow);

// Handle folder selection from renderer process
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'] // Allow to pick folder only
  });

  if (result.canceled) return null;
  return result.filePaths[0]; // Return the selected folder path
});
