// /frontend/src/pages/BreedCatalog.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import { getBreedImageUrl } from './Results'; // Import only what's needed
import './BreedCatalog.css'; // We'll create this file

function BreedCatalog() {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchBreeds() {
      try {
        const res = await api.get('/api/breeds?limit=200');
        setBreeds(res.data.data || []);
      } catch (err) {
        setError('Failed to load breeds. Please try again later.');
        console.error('Error fetching breeds:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBreeds();
  }, []);

  const filteredBreeds = breeds.filter(breed =>
    breed.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="catalog-loading">Loading breeds...</div>;
  if (error) return <div className="catalog-error">{error}</div>;

  return (
    <div className="breed-catalog">
      <h1>Dog Breed Catalog</h1>
      <p className="catalog-intro">
        Explore all dog breeds in our database. Each breed has unique characteristics
        that make them special. Remember that individual dogs may vary.
      </p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search breeds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="breeds-grid">
        {filteredBreeds.map(breed => (
          <div key={breed._id} className="breed-card">
            <img
              src={getBreedImageUrl(breed.name)}
              alt={breed.name}
              className="breed-image"
              onError={(e) => {
                e.target.src = '/images/placeholder-dog.jpg';
              }}
            />
            <div className="breed-info">
              <h3>{breed.name}</h3>
              <div className="breed-stats">
                <div className="stat">
                  <span className="stat-label">Size:</span>
                  <span className="stat-value">
                    {breed.sizeCategory || 
                     (breed.height ? `${breed.height.min}-${breed.height.max} cm` : 'N/A')}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Energy:</span>
                  <span className="stat-value">{breed.energyLevel || 'N/A'}/5</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Trainability:</span>
                  <span className="stat-value">{breed.trainability || 'N/A'}/5</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBreeds.length === 0 && (
        <div className="no-results">
          No breeds found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}

export default BreedCatalog;