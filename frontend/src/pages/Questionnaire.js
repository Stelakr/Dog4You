// /frontend/src/pages/Questionnaire.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import { traitExplanations } from '../utils/traitExplanations';
import { useNavigate } from 'react-router-dom';

function Questionnaire() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await api.get('/api/questions?limit=3'); // only a few for testing
        setQuestions(res.data.data);
      } catch (err) {
        console.error('❌ Error fetching questions:', err);
        setError('Could not load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleAnswer = (trait, value) => {
    setAnswers(prev => ({ ...prev, [trait]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert("Please answer at least one question!");
      return;
    }

    const formattedAnswers = Object.keys(answers).map(trait => ({
      trait,
      value: answers[trait],
      priority: 'medium'
    }));

    try {
      const res = await api.post('/api/recommend', { answers: formattedAnswers });
      navigate('/results', { state: { results: res.data.data } });
    } catch (err) {
      console.error('❌ Recommendation error:', err);
      setError('Server error. Please try again.');
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>🐕 Questionnaire</h2>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: '1.5rem' }}>
          <p><b>{q.text}</b></p>
          {q.options.map((opt, j) => (
            <label key={j} style={{ display: 'block' }}>
              <input
                type="radio"
                name={q.trait}
                value={opt.value}
                onChange={() => handleAnswer(q.trait, opt.value)}
              />
              {opt.label}
            </label>
          ))}

          {/* ℹ️ Trait Explanation Section */}
          {traitExplanations[q.trait] && (
            <div style={{ marginTop: '0.5rem' }}>
              <button
                onClick={() => alert(traitExplanations[q.trait].explanation)}
              >
                ℹ️ What does this mean?
              </button>
              <button
                onClick={() => alert("🤖 LLM explanation placeholder (coming soon)")}
                style={{ marginLeft: '0.5rem' }}
              >
                🤖 Ask More
              </button>
            </div>
          )}
        </div>
      ))}
      <button onClick={handleSubmit}>Get My Matches</button>
    </div>
  );
}

export default Questionnaire;
