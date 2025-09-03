import { app, BrowserWindow } from 'electron';
import path from 'path';
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('use-gl', 'swiftshader');   // force software GL

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    kiosk: true,               // full-screen kiosk; set false for windowed
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, '../out/index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
