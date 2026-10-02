import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './fonts.css';
import './style.css';
import './typography.css';
import './content.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

import './device.css';
