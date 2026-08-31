import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n';
import { toast } from 'react-hot-toast';

// Globally extend react-hot-toast to support toast.info()
toast.info = (message, options) => toast(message, { ...options, icon: 'ℹ️' });

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
