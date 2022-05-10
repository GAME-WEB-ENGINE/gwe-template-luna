const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  createWindow()
});

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 600,
    maxWidth: 600,
    maxHeight: 600,
    resizable: false,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.setMenuBarVisibility(false)
  win.loadFile('index.html');
  win.openDevTools();
}