// /frontend/src/pages/Results.js
import React, { useState } from 'react';
//import { useLocation, Link } from 'react-router-dom';
import api from '../api';
import { useNavigate, useLocation, Link } from 'react-router-dom';


function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results || [];
  const [expanded, setExpanded] = useState({});
  const [llmResponse, setLlmResponse] = useState({});
  const [loadingLlm, setLoadingLlm] = useState({});

  const toggleExpand = (breed) => {
    setExpanded(prev => ({ ...prev, [breed]: !prev[breed] }));
  };

  const askLLM = async (promptKey, breed) => {
    // promptKey: 'whyNot' or 'careTips'
    setLoadingLlm(prev => ({ ...prev, [breed + promptKey]: true }));
    try {
      let prompt;
      if (promptKey === 'whyNot') {
        prompt = `Explain why the user did not get ${breed} as a top match given their preferences.`;
      } else if (promptKey === 'careTips') {
        prompt = `Give caring advice and key responsibilities for owning a ${breed}. Include exercise, grooming, and common health considerations.`;
      } else {
        return;
      }

      const res = await api.post('/api/llm/explain', { trait: prompt }); // adapt endpoint or create dedicated one
      setLlmResponse(prev => ({
        ...prev,
        [breed + promptKey]: res.data.data
      }));
    } catch (err) {
      console.error('LLM error:', err);
      setLlmResponse(prev => ({
        ...prev,
        [breed + promptKey]: 'Sorry, something went wrong with the assistant. Please try again.'
      }));
    } finally {
      setLoadingLlm(prev => ({ ...prev, [breed + promptKey]: false }));
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem' }}>
      <h2>Your Matches</h2>

      <p style={{ fontSize: '0.9rem', color: '#555' }}>
        Matches are based on verified breed standards and your preferences. Individual dogs may vary.{' '}
        <button
          style={{ marginLeft: 8, fontSize: '0.8rem', cursor: 'pointer' }}
          onClick={() =>
            alert(
              'How we recommend: We combine your trait preferences, dealbreakers, and flexibles with vetted breed standard data. High priority traits carry more weight; flexible traits slightly influence the match. The assistant can explain traits and care tips.'
            )
          }
        >
          ℹ️ How this works
        </button>
      </p>

      {results.length === 0 ? (
        <p>No matches found. Try adjusting your answers!</p>
      ) : (
        <div>
          {results.map((r, i) => (
            <div
              key={i}
              style={{
                border: '1px solid #ddd',
                borderRadius: 12,
                padding: '1rem',
                marginBottom: '1rem',
                position: 'relative',
                background: '#f9f9f9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0 }}>
                    #{i + 1} 🐶 {r.breed} — {r.matchPercentage}% match
                  </h3>
                  {r.reasons?.length > 0 && (
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                      Not perfect because: {r.reasons.slice(0, 2).join(', ')}
                      {r.reasons.length > 2 && ` +${r.reasons.length - 2} more`}
                    </p>
                  )}
                </div>
                <div>
                  <button onClick={() => toggleExpand(r.breed)}>
                    {expanded[r.breed] ? 'Hide details' : 'Show details'}
                  </button>
                </div>
              </div>

              {expanded[r.breed] && (
                <div style={{ marginTop: '0.75rem' }}>
                  {r.reasons?.length > 0 ? (
                    <ul>
                      {r.reasons.map((reason, j) => (
                        <li key={j}>⚠️ {reason}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>🌟 Perfect match with your preferences!</p>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <div>
                      <button
                        onClick={() => askLLM('whyNot', r.breed)}
                        disabled={loadingLlm[r.breed + 'whyNot']}
                      >
                        {loadingLlm[r.breed + 'whyNot'] ? 'Thinking...' : `Why this match?`}
                      </button>
                      {llmResponse[r.breed + 'whyNot'] && (
                        <div style={{ marginTop: 6, fontSize: '0.85rem', background: '#fff', padding: 8, borderRadius: 6 }}>
                          {llmResponse[r.breed + 'whyNot']}
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        onClick={() => askLLM('careTips', r.breed)}
                        disabled={loadingLlm[r.breed + 'careTips']}
                      >
                        {loadingLlm[r.breed + 'careTips'] ? 'Thinking...' : 'Care Tips'}
                      </button>
                      {llmResponse[r.breed + 'careTips'] && (
                        <div style={{ marginTop: 6, fontSize: '0.85rem', background: '#fff', padding: 8, borderRadius: 6 }}>
                          {llmResponse[r.breed + 'careTips']}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <Link to="/questionnaire">
                  <button style={{ marginTop: 4 }}>Edit Answers</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '1rem' }}>
        <Link to="/questionnaire">
          <button onClick={() => {
            localStorage.removeItem('dog4you_answers');
            localStorage.removeItem('dog4you_currentIndex');
            navigate('/questionnaire');
          }}>
            Try Again
          </button>

        </Link>
      </div>
    </div>
  );
}

export default Results;
