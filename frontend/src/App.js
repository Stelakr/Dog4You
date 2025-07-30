// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Questionnaire from './Questionnaire';

function App() {
  return (
    <Router>
      <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>🐾 Dog4You</h1>
        <p>Welcome to your personalized dog breed recommender!</p>
        
        <Link to="/questionnaire">
          <button
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              marginTop: '1rem',
              cursor: 'pointer',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            Start Questionnaire
          </button>
        </Link>

        <Routes>
          <Route path="/questionnaire" element={<Questionnaire />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
