import { app, BrowserWindow, ipcMain, desktopCapturer, nativeImage } from 'electron';
import * as path from 'path';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false, // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    // Open DevTools in production for debugging
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle full screenshot capture
ipcMain.handle('capture-screenshot', async () => {
  try {
    // Hide main window before taking screenshot
    if (mainWindow) {
      mainWindow.hide();
      // Wait a bit for window to hide
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });
    
    // Show window again
    if (mainWindow) {
      mainWindow.show();
    }
    
    if (sources.length > 0) {
      const screenshot = sources[0].thumbnail;
      return screenshot.toPNG();
    }
    
    throw new Error('No screen sources found');
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    // Make sure window is shown even if error occurs
    if (mainWindow) {
      mainWindow.show();
    }
    throw error;
  }
});

// Handle area selection screenshot
ipcMain.handle('capture-area-screenshot', async () => {
  return new Promise((resolve, reject) => {
    // Create a transparent overlay window for area selection
    const selectionWindow = new BrowserWindow({
      fullscreen: true,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'selection-preload.js'),
      },
    });

    // Load selection overlay HTML
    selectionWindow.loadFile(path.join(__dirname, '../renderer/selection.html'));

    // Handle selection completion
    selectionWindow.webContents.on('ipc-message', async (event, channel, data) => {
      if (channel === 'area-selected') {
        selectionWindow.close();
        
        try {
          // Capture full screen first
          const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
          });
          
          if (sources.length > 0) {
            const fullScreenshot = sources[0].thumbnail;
            const { x, y, width, height } = data;
            
            // Crop the selected area (this would need image processing)
            // For now, return full screenshot with selection data
            resolve({
              image: fullScreenshot.toPNG(),
              selection: { x, y, width, height }
            });
          } else {
            reject(new Error('No screen sources found'));
          }
        } catch (error) {
          reject(error);
        }
      } else if (channel === 'selection-cancelled') {
        selectionWindow.close();
        reject(new Error('Selection cancelled'));
      }
    });

    selectionWindow.on('closed', () => {
      reject(new Error('Selection window closed'));
    });
  });
});

// Handle app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    console.log('Blocked new window creation to:', url);
    return { action: 'deny' };
  });
});