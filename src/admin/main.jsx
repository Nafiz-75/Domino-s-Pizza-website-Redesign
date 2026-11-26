/* Entry for the separate admin page (admin/index.html → <site>/admin/). */
import './root';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '../index.css';
import AdminApp from './AdminApp';

createRoot(document.getElementById('root')).render(<StrictMode><HashRouter><AdminApp /></HashRouter></StrictMode>);
