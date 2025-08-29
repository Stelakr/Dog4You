// /frontend/src/pages/Questionnaire.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import { traitExplanations } from '../utils/traitExplanations';
import { useNavigate } from 'react-router-dom';
import './Questionnaire.css';

function Questionnaire() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [justHydrated, setJustHydrated] = useState(false);

  // LLM trait helper state
  const [llmTraitInfo, setLlmTraitInfo] = useState({});
  const [loadingTrait, setLoadingTrait] = useState({});
  const [llmError, setLlmError] = useState({});

  const navigate = useNavigate();

  // ── Hydrate once from localStorage ──
  useEffect(() => {
    const stored = localStorage.getItem('dog4you_answers');
    const idx = localStorage.getItem('dog4you_currentIndex');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAnswers(parsed);
        setJustHydrated(true);
      } catch {}
    }
    if (idx !== null) {
      // If we have stored answers and index, continue. If not, start from 0.
      setCurrentIndex(Number(idx));
    }
  }, []);

  // ── Fetch questions ──
  useEffect(() => {
    async function fetchQuestions() {
      try {
        // For now, fetch a limited set while building flow
        const res = await api.get('/api/questions?limit=50&sort=order&_=' + Date.now());
        //const res = await api.get('/api/questions?sort=order&_=' + Date.now()); - ovo koristit kasnije 
        setQuestions(res.data.data || []);
      } catch (err) {
        console.error('❌ Error fetching questions:', err);
        setError('Could not load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // ── Local persistence helper ──
  const persist = (newAnswers, newIndex) => {
    try {
      localStorage.setItem('dog4you_answers', JSON.stringify(newAnswers));
    } catch {}
    if (typeof newIndex === 'number') {
      localStorage.setItem('dog4you_currentIndex', String(newIndex));
    }
  };

 
  const updateAnswerState = (trait, patch) => {
    setAnswers(prev => {
      const next = {
        ...prev,
        [trait]: {
          value: prev[trait]?.value,
          dealbreaker: prev[trait]?.dealbreaker || false,
          mode: prev[trait]?.mode || 'accept',
          ...patch
        }
      };
      persist(next);
      return next;
    });
  };

  // ── Toggle a value (multi-select by default) ──
  const toggleValue = (trait, value) => {
    setAnswers(prev => {
      const existing = prev[trait]?.value;
      let newValue;
      if (Array.isArray(existing)) {
        newValue = existing.includes(value)
          ? existing.filter(v => v !== value)
          : [...existing, value];
      } else if (existing !== undefined) {
        // was single → become array
        if (existing === value) newValue = []; // unselect
        else newValue = [existing, value];
      } else {
        newValue = [value];
      }

      const next = {
        ...prev,
        [trait]: {
          value: newValue,
          dealbreaker: prev[trait]?.dealbreaker || false,
          mode: prev[trait]?.mode || 'accept',
        }
      };
      persist(next);
      return next;
    });
  };

  // ── Dealbreaker / Flexible mutual exclusivity ──
  const toggleDealbreaker = (trait, checked) => {
    updateAnswerState(trait, {
      dealbreaker: checked,
      mode: 'accept', // default mode when enabling dealbreaker
      //priority: checked ? (answers[trait]?.priority || 'medium') : (answers[trait]?.priority || 'medium')
    });
  };

  const setDealbreakerMode = (trait, mode) => {
    updateAnswerState(trait, { mode });
  };


  // ── LLM: explain current trait ──
  const fetchTraitExplanation = async (trait) => {
    setLoadingTrait(prev => ({ ...prev, [trait]: true }));
    setLlmError(prev => ({ ...prev, [trait]: null }));
    try {
      const res = await api.post('/api/llm/explainTrait', { trait });
      setLlmTraitInfo(prev => ({ ...prev, [trait]: res.data.data }));
    } catch (err) {
      setLlmError(prev => ({ ...prev, [trait]: 'Failed to load explanation.' }));
    } finally {
      setLoadingTrait(prev => ({ ...prev, [trait]: false }));
    }
  };

  // ── Navigation ──
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

  // ── Submit ──
  const handleSubmit = async () => {
    // Only send answered traits with a non-empty value
    const formattedAnswers = Object.entries(answers)
      .filter(([_, a]) => {
        if (!a) return false;
        if (Array.isArray(a.value)) return a.value.length > 0;
        return a.value !== undefined && a.value !== null && a.value !== '';
      })
      .map(([trait, a]) => ({
        trait,
        value: a.value,
        dealbreaker: !!a.dealbreaker,
        mode: a.mode || 'accept',
      }));

    if (formattedAnswers.length === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }
    console.log('Submitting answers', formattedAnswers);
    const res = await api.post('/api/recommend', { answers: formattedAnswers });

    try {
      const res = await api.post('/api/recommend', { answers: formattedAnswers });
      // Pass rawAnswers for LLM explanations on Results
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
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <h2>🐕 Dog4You Questionnaire</h2>
        <button className="reset-button" onClick={resetAll}>
          Start Over
        </button>
      </div>

      {justHydrated && (
        <div className="saved-progress-banner">
          <div>
            Saved progress loaded.{' '}
            <button className="text-button" onClick={resetAll}>
              Clear all
            </button>
          </div>
          <div className="auto-saved">Auto-saved</div>
        </div>
      )}

      {/* Progress */}
      <div className="progress-container">
        <div className="progress-text">
          Question {currentIndex + 1} of {total}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <p className="question-text">{current.text}</p>

        {/* Options with improved styling */}
        <div className="options-grid">
          {current.options.map((opt, idx) => {
            const isSelected = Array.isArray(userAnswer.value)
              ? userAnswer.value.includes(opt.value)
              : userAnswer.value === opt.value;

            return (
              <div
                key={idx}
                className={`option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleValue(current.trait, opt.value)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  style={{ marginRight: 6 }}
                />
                <span className="option-label">{opt.label}</span>
              </div>
            );
          })}
        </div>

        {/* Dealbreaker Toggles */}
        <div className="dealbreaker-section">
          <label className="dealbreaker-toggle">
            <input
              type="checkbox"
              checked={userAnswer.dealbreaker || false}
              onChange={(e) => toggleDealbreaker(current.trait, e.target.checked)}
            />
            <span className="toggle-label">Make this a dealbreaker</span>
          </label>
          
          {userAnswer.dealbreaker && (
            <div className="dealbreaker-mode">
              <div className="mode-title">Dealbreaker mode:</div>
              <div className="mode-options">
                <label className="mode-option">
                  <input
                    type="radio"
                    name={`${current.trait}-mode`}
                    checked={userAnswer.mode === 'accept'}
                    onChange={() => setDealbreakerMode(current.trait, 'accept')}
                  />
                  <span>Accept only selected</span>
                </label>
                <label className="mode-option">
                  <input
                    type="radio"
                    name={`${current.trait}-mode`}
                    checked={userAnswer.mode === 'exclude'}
                    onChange={() => setDealbreakerMode(current.trait, 'exclude')}
                  />
                  <span>Exclude selected</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Trait Info & LLM */}
        {traitExplanations[current.trait] && (
          <div className="trait-info-section">
            <div className="info-buttons">
              <button
                className="info-button"
                onClick={() => alert(traitExplanations[current.trait].explanation)}
                title="Static explanation"
              >
                ℹ️ What does this mean?
              </button>

              <button 
                className="info-button"
                onClick={() => fetchTraitExplanation(current.trait)} 
                disabled={loadingTrait[current.trait]}
              >
                {loadingTrait[current.trait] ? 'Thinking…' : '🤖 Ask More'}
              </button>
            </div>

            {llmTraitInfo[current.trait] && (
              <div className="llm-response">
                <strong>Assistant:</strong> {llmTraitInfo[current.trait]}
              </div>
            )}
            {llmError[current.trait] && (
              <div className="llm-error">{llmError[current.trait]}</div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="navigation-buttons">
        <button 
          className="nav-button secondary" 
          onClick={goBack} 
          disabled={currentIndex === 0}
        >
          ← Back
        </button>
        
        {currentIndex === total - 1 ? (
          <button className="nav-button primary" onClick={handleSubmit}>
            Submit & See Matches
          </button>
        ) : (
          <button className="nav-button primary" onClick={goNext}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

export default Questionnaire;