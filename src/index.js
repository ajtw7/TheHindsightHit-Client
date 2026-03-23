import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './Components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { initCache } from './utils/cache';
import reportWebVitals from './reportWebVitals';
import './index.css';

initCache();

if (!process.env.REACT_APP_API_URL) {
  throw new Error(
    'REACT_APP_API_URL is not set. Copy .env.example to .env.local and fill in the API base URL.'
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
