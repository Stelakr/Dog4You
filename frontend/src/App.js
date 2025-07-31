import React, { useState } from 'react';
import { getRecommendations } from './api';

function App() {
  const [results, setResults] = useState(null);

  const handleTest = async () => {
    try {
      const dummyAnswers = [
        { trait: 'energyLevel', value: [4], priority: 'medium' },
        { trait: 'coatType', value: ['curly'], priority: 'high' },
        { trait: 'livingEnvironment', value: ['urban'], priority: 'medium' }
      ];

      const data = await getRecommendations(dummyAnswers);
      setResults(data.data);
    } catch (error) {
      alert(error.error || 'Something went wrong');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>🐾 Dog4You</h1>
      <p>Welcome to your personalized dog breed recommender!</p>
      <button onClick={handleTest}>Test Recommendation</button>

      {results && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Results:</h2>
          <ul>
            {results.map((r, index) => (
              <li key={index}>
                {r.breed} — {r.matchPercentage}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
