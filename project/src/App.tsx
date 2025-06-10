import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ControllerPage } from './pages/ControllerPage';
import { OverlayPage } from './pages/OverlayPage';
import { PreviewPage } from './pages/PreviewPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/controller/:sessionId" element={<ControllerPage />} />
        <Route path="/overlay/:sessionId" element={<OverlayPage />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;