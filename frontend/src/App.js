// /frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Questionnaire from './pages/Questionnaire';
import Results from './pages/Results'; // This should work now
import BreedCatalog from './pages/BreedCatalog';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>🐾 Dog4You</h1>
          <nav className="app-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/catalog" className="nav-link">Browse Breeds</Link>
            <Link to="/questionnaire" className="nav-link">Questionnaire</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<BreedCatalog />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>Dog4You - Finding the perfect breed for your lifestyle 🐶</p>
          <p className="disclaimer">
            Breed information is based on general standards. Individual dogs may vary.
            Always meet a dog in person and consider adoption from rescues.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;