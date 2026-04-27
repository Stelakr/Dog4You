// frontend/src/pages/BreedDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { getBreedImageUrl } from './Results';
import './BreedDetail.css';

function BreedDetail() {
  const { breedName } = useParams();
  const navigate = useNavigate();
  const [breed, setBreed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [careTips, setCareTips] = useState('');
  const [loadingCareTips, setLoadingCareTips] = useState(false);

  useEffect(() => {
    async function fetchBreed() {
      try {
        const res = await api.get(`/api/breeds/${encodeURIComponent(breedName)}`);
        if (res.data.success) {
          setBreed(res.data.data);
        } else {
          setError('Breed not found');
        }
      } catch (err) {
        setError('Failed to load breed details');
        console.error('Error fetching breed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBreed();
  }, [breedName]);

  const fetchCareTips = async () => {
    setLoadingCareTips(true);
    try {
      const res = await api.post('/api/llm/careTips', { breed: breedName });
      setCareTips(res.data.data);
    } catch (err) {
      setCareTips('Failed to load care tips. Please try again later.');
    } finally {
      setLoadingCareTips(false);
    }
  };

  const getBreedGroupLabel = (breedGroup) => {
    const groups = {
        sporting: 'Sporting Group',
        hound: 'Hound Group', 
        working: 'Working Group',
        terrier: 'Terrier Group',
        toy: 'Toy Group',
        'non-sporting': 'Non-Sporting Group',
        herding: 'Herding Group',
        mixed: 'Mixed Breed'
    };
    return groups[breedGroup] || 'Unknown';
  };


  const renderTraitBar = (value, label) => {
    if (!value) return null;
    
    return (
      <div className="trait-bar">
        <div className="trait-header">
          <span className="trait-label">{label}</span>
          <span className="trait-value">{value}/5</span>
        </div>
        <div className="trait-visual">
          <div 
            className="trait-fill" 
            style={{ width: `${(value / 5) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="breed-detail-loading">Loading breed details...</div>;
  if (error) return <div className="breed-detail-error">{error}</div>;
  if (!breed) return <div className="breed-detail-error">Breed not found</div>;

  return (
    <div className="breed-detail">
      <button className="back-button" onClick={() => navigate('/catalog')}>
        ← Back to Breed Catalog
      </button>

      <div className="breed-header">
        <div className="breed-image-large">
          <img
            src={getBreedImageUrl(breed.name)}
            alt={breed.name}
            onError={(e) => {
              e.target.src = '/images/placeholder-dog.jpg';
            }}
          />
        </div>
        <div className="breed-basic-info">
          <h1>{breed.name}</h1>
          
          {/* Breed Group */}
          {breed.breedGroup && breed.breedGroup !== 'other' && (
            <div className="breed-group-large">
              {getBreedGroupLabel(breed.breedGroup)}
            </div>
          )}
          
          <div className="breed-quick-stats">
            <div className="quick-stat">
              <span className="stat-label">Size Category:</span>
              <span className="stat-value">
                {breed.sizeCategory ? breed.sizeCategory.charAt(0).toUpperCase() + breed.sizeCategory.slice(1) : 'Unknown'}
              </span>
            </div>
            <div className="quick-stat">
              <span className="stat-label">Height:</span>
              <span className="stat-value">{breed.height?.min || '?'}-{breed.height?.max || '?'} cm</span>
            </div>
            <div className="quick-stat">
              <span className="stat-label">Weight:</span>
              <span className="stat-value">{breed.weight?.min || '?'}-{breed.weight?.max || '?'} kg</span>
            </div>
            {breed.coatType && (
              <div className="quick-stat">
                <span className="stat-label">Coat Type:</span>
                <span className="stat-value">
                  {Array.isArray(breed.coatType) ? breed.coatType.join(', ') : breed.coatType}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breed Description */}
      {breed.description && (
        <div className="breed-description-section">
          <h2>About the {breed.name}</h2>
          <div className="breed-description">
            {breed.description}
          </div>
        </div>
      )}

      <div className="breed-content">
        <div className="traits-section">
          <h2>Breed Characteristics</h2>
          <div className="traits-grid">
            {renderTraitBar(breed.energyLevel, 'Energy Level')}
            {renderTraitBar(breed.trainability, 'Trainability')}
            {renderTraitBar(breed.goodWithKids, 'Good with Kids')}
            {renderTraitBar(breed.goodWithOtherDogs, 'Good with Other Dogs')}
            {renderTraitBar(breed.barkingLevel, 'Barking Level')}
            {renderTraitBar(breed.shedding, 'Shedding Level')}
            {renderTraitBar(breed.droolingLevel, 'Drooling Level')}
            {renderTraitBar(breed.protectiveNature, 'Protective Nature')}
            {renderTraitBar(breed.playfulnessLevel, 'Playfulness')}
            {renderTraitBar(breed.adaptabilityLevel, 'Adaptability')}
            {renderTraitBar(breed.affectionateWithFamily, 'Affectionate with Family')}
            {renderTraitBar(breed.opennessToStrangers, 'Openness to Strangers')}
          </div>
        </div>

        <div className="care-section">
          <h2>Care & Information</h2>
          
          <div className="care-tips-section">
            <h3>Care Tips</h3>
            <button 
              onClick={fetchCareTips} 
              disabled={loadingCareTips}
              className="care-tips-button"
            >
              {loadingCareTips ? 'Loading Care Tips...' : 'Get AI Care Tips'}
            </button>
            
            {careTips && (
              <div className="care-tips-content">
                <p>{careTips}</p>
              </div>
            )}
          </div>

          <div className="physical-traits">
            <h3>Physical Characteristics</h3>
            <div className="physical-grid">
              {breed.coatType && (
                <div className="physical-trait">
                  <span className="trait-name">Coat Type:</span>
                  <span className="trait-value">
                    {Array.isArray(breed.coatType) ? breed.coatType.join(', ') : breed.coatType}
                  </span>
                </div>
              )}
              {breed.coatLength && (
                <div className="physical-trait">
                  <span className="trait-name">Coat Length:</span>
                  <span className="trait-value">
                    {Array.isArray(breed.coatLength) ? breed.coatLength.join(', ') : breed.coatLength}
                  </span>
                </div>
              )}
              {breed.livingEnvironment && (
                <div className="physical-trait">
                  <span className="trait-name">Suitable Environment:</span>
                  <span className="trait-value">
                    {Array.isArray(breed.livingEnvironment) ? breed.livingEnvironment.join(', ') : breed.livingEnvironment}
                  </span>
                </div>
              )}
              {breed.groomingFrequency && (
                <div className="physical-trait">
                  <span className="trait-name">Grooming Frequency:</span>
                  <span className="trait-value">
                    Every {breed.groomingFrequency.value} {breed.groomingFrequency.unit}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <h4>Important Note</h4>
        <p>
          This information is based on general breed standards. Individual dogs may vary significantly 
          based on their specific breeding, upbringing, training, and environment. Always meet a dog 
          in person before making decisions, and consider adopting from rescues or working with 
          ethical breeders.
        </p>
      </div>
    </div>
  );
}

export default BreedDetail;