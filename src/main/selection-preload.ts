import { contextBridge, ipcRenderer } from 'electron';

// Expose selection methods
contextBridge.exposeInMainWorld('electronAPI', {
  sendSelection: (selection: { x: number, y: number, width: number, height: number }) => {
    ipcRenderer.send('area-selected', selection);
  },
  
  cancelSelection: () => {
    ipcRenderer.send('selection-cancelled');
  }
});