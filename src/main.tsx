import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { BrowserRouter } from 'react-router-dom'

// Debug environment
console.log('Application starting...', {
  nodeEnv: import.meta.env.MODE,
  buildTime: new Date().toISOString()
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

try {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  
  // Render error to the screen if React fails to mount
  const errorElement = document.createElement('div');
  errorElement.style.padding = '2rem';
  errorElement.style.fontFamily = 'sans-serif';
  errorElement.style.color = '#721c24';
  errorElement.style.backgroundColor = '#f8d7da';
  errorElement.style.border = '1px solid #f5c6cb';
  errorElement.style.borderRadius = '4px';
  errorElement.innerHTML = `
    <h2>Application Error</h2>
    <p>Failed to initialize the application. Please check the console for more details.</p>
    <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
  `;
  
  document.body.innerHTML = '';
  document.body.appendChild(errorElement);
}
