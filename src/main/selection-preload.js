const { contextBridge, ipcRenderer } = require('electron');

// Expose selection methods
contextBridge.exposeInMainWorld('electronAPI', {
  sendSelection: (selection) => {
    ipcRenderer.send('area-selected', selection);
  },
  
  cancelSelection: () => {
    ipcRenderer.send('selection-cancelled');
  }
});