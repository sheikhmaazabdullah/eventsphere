import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid #334155',
          borderRadius: '12px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#0f172a' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
      }}
    />
  </React.StrictMode>
);
