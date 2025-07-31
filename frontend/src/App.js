// /frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Questionnaire from './pages/Questionnaire';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>🐾 Dog4You</h1>
        <nav>
          <Link to="/" style={{ margin: '0 1rem' }}>Home</Link>
          <Link to="/questionnaire" style={{ margin: '0 1rem' }}>Questionnaire</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
