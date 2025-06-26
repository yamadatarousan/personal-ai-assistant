import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  captureScreenshot: () => Promise<Buffer>;
  captureAreaScreenshot: () => Promise<{image: Buffer, selection: {x: number, y: number, width: number, height: number}}>;
  getAppVersion: () => Promise<string>;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),
  captureAreaScreenshot: () => ipcRenderer.invoke('capture-area-screenshot'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
} as ElectronAPI);