import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    You can drag the map with the mouse or use the scroll wheel to zoom.
    <hr />
    <App />
  </StrictMode>,
);
