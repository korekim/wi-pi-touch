// frontend/electron/main.cjs
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // preload: path.join(__dirname, 'preload.cjs') // if you use one
    }
  });

  // dev vs prod
  win.loadURL('http://127.0.0.1:3000/ui');

}

app.whenReady().then(createWindow).catch(err => console.error(err));
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
