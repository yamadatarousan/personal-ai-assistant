import React from 'react';
import { createRoot } from 'react-dom/client';
import SimpleApp from './SimpleApp';

console.log('Renderer process starting...');

const container = document.getElementById('root');
if (!container) {
  console.error('Root container not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Root container not found!</div>';
  throw new Error('Root container not found');
}

console.log('Root container found, creating React app...');

const root = createRoot(container);
root.render(<SimpleApp />);

console.log('React app rendered successfully!');