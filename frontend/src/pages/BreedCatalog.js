// frontend/src/pages/BreedCatalog.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getBreedImageUrl } from './Results';
import './BreedCatalog.css';

function BreedCatalog() {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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

  const handleBreedClick = (breedName) => {
    navigate(`/breeds/${encodeURIComponent(breedName)}`);
  };

  const getSizeLabel = (sizeCategory) => {
    const sizes = {
      small: 'Small',
      medium: 'Medium', 
      large: 'Large'
    };
    return sizes[sizeCategory] || 'Unknown';
  };

  const getBreedGroupLabel = (breedGroup) => {
    const groups = {
      sporting: 'Sporting',
      hound: 'Hound', 
      working: 'Working',
      terrier: 'Terrier',
      toy: 'Toy',
      'non-sporting': 'Non-Sporting',
      herding: 'Herding',
      mixed: 'Mixed Breed'
    };
    return groups[breedGroup] || '';
  };

  const getEnergyStars = (energyLevel) => {
    if (!energyLevel) return 'Energy: Unknown';
    return '⚡'.repeat(energyLevel) + '☆'.repeat(5 - energyLevel);
  };

  const getBreedTraits = (breed) => {
    const traits = [];
    
    // Intelligence/Work Ethic
    if (breed.trainability >= 4) traits.push('Smart');
    if (breed.energyLevel >= 4) traits.push('Energetic');
    if (breed.energyLevel <= 2) traits.push('Calm');
    
    // Social Traits
    if (breed.goodWithKids >= 4) traits.push('Family-Friendly');
    if (breed.affectionateWithFamily >= 4) traits.push('Affectionate');
    if (breed.protectiveNature >= 4) traits.push('Protective');
    
    // Activity Level
    if (breed.playfulnessLevel >= 4) traits.push('Playful');
    if (breed.adaptabilityLevel >= 4) traits.push('Adaptable');
    
    // Return 2-4 most prominent traits
    return traits.slice(0, 3);
  };

  if (loading) return <div className="catalog-loading">Loading breeds...</div>;
  if (error) return <div className="catalog-error">{error}</div>;

  return (
    <div className="breed-catalog">
      <h1>Dog Breed Catalog</h1>
      <p className="catalog-intro">
        Explore all dog breeds in our database. Click on any breed card to see detailed information.
      </p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search breeds by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="breeds-grid">
        {filteredBreeds.map(breed => {
          const breedTraits = getBreedTraits(breed);
          const breedGroup = getBreedGroupLabel(breed.breedGroup);
          
          return (
            <div 
              key={breed._id} 
              className="breed-card"
              onClick={() => handleBreedClick(breed.name)}
            >
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
                
                {/* Size and Group */}
                <div className="breed-basic-info">
                  <span className="size-label">{getSizeLabel(breed.sizeCategory)}</span>
                  {breedGroup && (
                    <span className="group-label">{breedGroup}</span>
                  )}
                </div>
                
                {/* Energy Level */}
                {breed.energyLevel && (
                  <div className="energy-level">
                    <span className="energy-label">Energy:</span>
                    <span className="energy-stars">{getEnergyStars(breed.energyLevel)}</span>
                  </div>
                )}
                
                {/* Breed Traits */}
                {breedTraits.length > 0 && (
                  <div className="breed-traits">
                    {breedTraits.map((trait, index) => (
                      <span key={index} className="trait-tag">{trait}</span>
                    ))}
                  </div>
                )}
                
                {/* Description Preview */}
                {breed.description && (
                  <div className="breed-description-preview">
                    {breed.description.length > 100 
                      ? `${breed.description.substring(0, 100)}...` 
                      : breed.description
                    }
                  </div>
                )}
                
                <div className="click-hint">Click for details →</div>
              </div>
            </div>
          );
        })}
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