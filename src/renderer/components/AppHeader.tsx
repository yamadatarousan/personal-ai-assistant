import React, { useState, useEffect } from 'react';

export const AppHeader: React.FC = () => {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    // Get app version from Electron
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setVersion).catch(console.error);
    }
  }, []);

  return (
    <header className="app-header">
      <div className="app-title">
        🤖 Personal AI Assistant
      </div>
      <div className="app-version">
        v{version}
      </div>
    </header>
  );
};