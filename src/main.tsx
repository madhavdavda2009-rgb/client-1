import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ToyonIntro from './ToyonIntro';
import './style.css';

createRoot(document.getElementById('root')!).render(<StrictMode><ToyonIntro /></StrictMode>);
