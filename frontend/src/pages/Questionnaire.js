// /frontend/src/pages/Questionnaire.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import { traitExplanations } from '../utils/traitExplanations';
import { useNavigate } from 'react-router-dom';

function Questionnaire() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [justHydrated, setJustHydrated] = useState(false);
  const navigate = useNavigate();

  // LLM trait explanation state
  const [llmTraitInfo, setLlmTraitInfo] = useState({});
  const [loadingTrait, setLoadingTrait] = useState({});
  const [llmError, setLlmError] = useState({});

  // hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dog4you_answers');
    const idx = localStorage.getItem('dog4you_currentIndex');
    if (stored) {
      try {
        setAnswers(JSON.parse(stored));
        setJustHydrated(true);
      } catch {}
    }
    if (idx !== null) {
      setCurrentIndex(Number(idx));
    }
  }, []);

  // fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await api.get('/api/questions?limit=10');
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

  // persist answers & index
  const persist = (newAnswers, newIndex) => {
    try {
      localStorage.setItem('dog4you_answers', JSON.stringify(newAnswers));
    } catch {}
    if (newIndex !== undefined) {
      localStorage.setItem('dog4you_currentIndex', String(newIndex));
    }
  };

  // update helper
  const updateAnswerState = (trait, newPartial) => {
    setAnswers(prev => {
      const updated = {
        ...prev,
        [trait]: {
          ...prev[trait],
          ...newPartial
        }
      };
      persist(updated);
      return updated;
    });
  };

  // toggle multi-value (checkbox-style)
  const toggleValue = (trait, value) => {
    setAnswers(prev => {
      const existing = prev[trait]?.value;
      let newValue;
      if (Array.isArray(existing)) {
        if (existing.includes(value)) {
          newValue = existing.filter(v => v !== value);
        } else {
          newValue = [...existing, value];
        }
      } else if (existing !== undefined) {
        if (existing === value) newValue = [];
        else newValue = [existing, value];
      } else {
        newValue = [value];
      }

      const updated = {
        ...prev,
        [trait]: {
          ...prev[trait],
          value: newValue,
          priority: prev[trait]?.priority || 'medium',
          dealbreaker: prev[trait]?.dealbreaker || false,
          mode: prev[trait]?.mode || 'accept'
        }
      };
      persist(updated);
      return updated;
    });
  };

  const toggleDealbreaker = (trait, checked) => {
    updateAnswerState(trait, {
      dealbreaker: checked,
      mode: 'accept',
      priority: checked ? 'medium' : (answers[trait]?.priority || 'medium')
    });
  };

  const toggleFlexible = (trait, checked) => {
    updateAnswerState(trait, {
      priority: checked ? 'low' : 'medium',
      dealbreaker: checked ? false : (answers[trait]?.dealbreaker || false)
    });
  };

  const setDealbreakerMode = (trait, mode) => {
    updateAnswerState(trait, {
      mode
    });
  };

  const skipCurrent = () => {
    goNext();
  };

  const goNext = () => {
    const next = Math.min(questions.length - 1, currentIndex + 1);
    setCurrentIndex(next);
    persist(answers, next);
  };

  const goBack = () => {
    const prev = Math.max(0, currentIndex - 1);
    setCurrentIndex(prev);
    persist(answers, prev);
  };

  const resetAll = () => {
    localStorage.removeItem('dog4you_answers');
    localStorage.removeItem('dog4you_currentIndex');
    setAnswers({});
    setCurrentIndex(0);
    setJustHydrated(false);
  };

  // Fetch trait explanation from backend
  const fetchTraitExplanation = async (trait) => {
    setLoadingTrait(prev => ({ ...prev, [trait]: true }));
    setLlmError(prev => ({ ...prev, [trait]: null }));
    try {
      const res = await api.post('/api/llm/explainTrait', { trait });
      setLlmTraitInfo(prev => ({ ...prev, [trait]: res.data.data }));
    } catch (err) {
      console.error('LLM trait explain error:', err);
      setLlmError(prev => ({ ...prev, [trait]: 'Failed to load explanation.' }));
    } finally {
      setLoadingTrait(prev => ({ ...prev, [trait]: false }));
    }
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.entries(answers)
      .filter(([_, ans]) => ans && ans.value !== undefined && !(Array.isArray(ans.value) && ans.value.length === 0))
      .map(([trait, answerObj]) => ({
        trait,
        value: answerObj.value,
        dealbreaker: answerObj.dealbreaker || false,
        mode: answerObj.mode || 'accept',
        priority: answerObj.priority || 'medium'
      }));

    if (formattedAnswers.length === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    try {
      const res = await api.post('/api/recommend', { answers: formattedAnswers });
      navigate('/results', { state: { results: res.data.data, rawAnswers: formattedAnswers } });
    } catch (err) {
      console.error('❌ Recommendation error:', err);
      setError('Server error. Please try again.');
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!questions.length) return <p>No questions available.</p>;

  const current = questions[currentIndex];
  const userAnswer = answers[current.trait] || {};
  const total = questions.length;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>🐕 Questionnaire</h2>
        <button onClick={resetAll} style={{ fontSize: 12, padding: '6px 10px' }}>
          Start Over
        </button>
      </div>

      {justHydrated && (
        <div
          style={{
            background: '#eef6ff',
            padding: '10px',
            borderRadius: 8,
            marginBottom: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            You have saved answers. Continuing will keep them.{' '}
            <button onClick={resetAll} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
              Clear all
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#555' }}>Auto-saved</div>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 14, marginBottom: 4 }}>
          Question {currentIndex + 1} of {total}
        </div>
        <div
          style={{
            height: 8,
            background: '#ddd',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 8
          }}
        >
          <div
            style={{
              width: `${((currentIndex + 1) / total) * 100}%`,
              background: '#4f46e5',
              height: '100%'
            }}
          />
        </div>
        <div style={{ fontSize: 12, marginBottom: 4, color: '#555' }}>
          You don’t have to answer every question, but the more you share, the better the match.
        </div>
      </div>

      <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 10, marginBottom: 16, background: '#fafafa' }}>
        <p style={{ margin: '0 0 8px' }}>
          <b>{current.text}</b>
        </p>

        <div style={{ marginBottom: 8 }}>
          {current.options.map((opt, idx) => {
            const isSelected = Array.isArray(userAnswer.value)
              ? userAnswer.value.includes(opt.value)
              : userAnswer.value === opt.value;

            return (
              <label key={idx} style={{ display: 'block', marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleValue(current.trait, opt.value)}
                  style={{ marginRight: 6 }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={userAnswer.dealbreaker || false}
                onChange={(e) => toggleDealbreaker(current.trait, e.target.checked)}
                disabled={userAnswer.priority === 'low'}
                style={{ marginRight: 6 }}
              />
              Dealbreaker
            </label>
            {userAnswer.dealbreaker && (
              <div style={{ marginLeft: 16, marginTop: 4 }}>
                <div style={{ fontSize: 12, marginBottom: 4 }}>Mode:</div>
                <label style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name={`${current.trait}-mode`}
                    checked={userAnswer.mode === 'accept'}
                    onChange={() => setDealbreakerMode(current.trait, 'accept')}
                  />{' '}
                  Accept only selected
                </label>
                <label>
                  <input
                    type="radio"
                    name={`${current.trait}-mode`}
                    checked={userAnswer.mode === 'exclude'}
                    onChange={() => setDealbreakerMode(current.trait, 'exclude')}
                  />{' '}
                  Exclude selected
                </label>
                {userAnswer.mode === 'exclude' && (
                  <div style={{ fontSize: 11, marginTop: 4, color: '#444' }}>
                    Breeds with this value will be excluded; others won’t be penalized.
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={userAnswer.priority === 'low'}
                onChange={(e) => toggleFlexible(current.trait, e.target.checked)}
                disabled={userAnswer.dealbreaker}
                style={{ marginRight: 6 }}
              />
              Flexible (lower priority)
            </label>
            <div style={{ fontSize: 11, color: '#555' }}>
              Flexible traits slightly influence matching instead of dominating.
            </div>
          </div>
        </div>

        {traitExplanations[current.trait] && (
          <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => fetchTraitExplanation(current.trait)}
              disabled={loadingTrait[current.trait]}
              style={{ padding: '6px 12px' }}
            >
              {loadingTrait[current.trait] ? 'Thinking...' : '🤖 Ask More'}
            </button>
            {llmTraitInfo[current.trait] && (
              <div style={{ marginTop: 8, background: '#fff', padding: 10, borderRadius: 6, flex: 1 }}>
                <strong>Assistant:</strong> {llmTraitInfo[current.trait]}
              </div>
            )}
            {llmError[current.trait] && (
              <div style={{ marginTop: 8, color: 'crimson' }}>{llmError[current.trait]}</div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <button onClick={goBack} disabled={currentIndex === 0} style={{ padding: '8px 14px' }}>
            ← Back
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={skipCurrent} style={{ padding: '8px 14px' }}>
            Next →
          </button>
          {currentIndex === total - 1 ? (
            <button onClick={handleSubmit} style={{ padding: '8px 14px' }}>
              Submit & See Matches
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Questionnaire;
