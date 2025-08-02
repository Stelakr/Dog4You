// /frontend/src/pages/Results.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { traitExplanations } from '../utils/traitExplanations';


function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results || [];
  const rawAnswers = location.state?.rawAnswers || [];

  // State
  const [whyMatchInfo, setWhyMatchInfo] = useState({});
  const [whyNotBreed, setWhyNotBreed] = useState('');
  const [whyNotInfo, setWhyNotInfo] = useState('');
  const [loadingWhyMatch, setLoadingWhyMatch] = useState({});
  const [loadingWhyNot, setLoadingWhyNot] = useState(false);
  const [error, setError] = useState(null);
  const [careTipsInfo, setCareTipsInfo] = useState({});
  const [loadingCareTips, setLoadingCareTips] = useState({});
  const [breedDetailsCache, setBreedDetailsCache] = useState({});
  const [exclusionBannerText, setExclusionBannerText] = useState('');

  // Redirect back if missing context
  useEffect(() => {
    if (!rawAnswers.length || !results.length) {
      const t = setTimeout(() => navigate('/questionnaire'), 800);
      return () => clearTimeout(t);
    }
  }, [rawAnswers, results, navigate]);

  // Styles
  const cardStyle = {
    border: '1px solid #ccc',
    padding: '1rem',
    borderRadius: 8,
    marginBottom: '1rem',
    position: 'relative'
  };

  // Debounce helper
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const debouncedSetWhyNotBreed = useCallback(
    debounce((val) => {
      setWhyNotBreed(val);
    }, 400),
    []
  );


  // Breed fetch helper with caching (memoized)
  const fetchBreedDetails = useCallback(
    async (breedName) => {
      if (breedDetailsCache[breedName]) return breedDetailsCache[breedName];
      try {
        const res = await api.get(`/api/breeds/${encodeURIComponent(breedName)}`);
        if (res.data?.success) {
          setBreedDetailsCache(prev => ({ ...prev, [breedName]: res.data.data }));
          return res.data.data;
        }
      } catch (e) {
        console.warn('Failed to fetch breed details:', e);
      }
      return null;
    },
    [breedDetailsCache]
  );

  // Compute exclusion banner when whyNotBreed changes (debounced trigger optional)
  useEffect(() => {
    const computeExclusion = async () => {
      if (!whyNotBreed || !rawAnswers.length) {
        setExclusionBannerText('');
        return;
      }

      const breedData = await fetchBreedDetails(whyNotBreed);
      if (!breedData) {
        setExclusionBannerText('Breed not found in our database.');
        return;
      }

      const applicableExclusions = rawAnswers
        .filter(a => a.dealbreaker && a.mode === 'exclude')
        .filter(a => {
          let breedValue;
          if (a.trait === 'sizeCategory') {
            const maxHeight = breedData.height?.max;
            if (maxHeight === undefined) return false;
            if (maxHeight < 30) breedValue = 'small';
            else if (maxHeight > 30 && maxHeight <= 55) breedValue = 'medium';
            else breedValue = 'large';
          } else {
            breedValue = breedData[a.trait];
          }

          if (breedValue === undefined) return false;

          const userVals = Array.isArray(a.value) ? a.value : [a.value];
          if (Array.isArray(breedValue)) {
            return userVals.some(v => breedValue.includes(v));
          } else {
            return userVals.includes(breedValue);
          }
        });

      if (applicableExclusions.length > 0) {
        const parts = applicableExclusions.map(a => {
          const val = Array.isArray(a.value) ? a.value[0] : a.value;
          const traitLabel = traitExplanations[a.trait]?.label || a.trait;
          const valueLabel = traitExplanations[a.trait]?.values?.[val] || val;
          return `You excluded ${traitLabel}: ${valueLabel}`;
        });
        setExclusionBannerText(`${parts.join(' and ')} via exclude dealbreaker.`);
      } else {
        setExclusionBannerText('');
      }
    };

    computeExclusion();
  }, [whyNotBreed, rawAnswers, fetchBreedDetails]);

  // Fetch "Why this match?"
  const fetchWhyMatch = async (result, index) => {
    setError(null);
    setLoadingWhyMatch(prev => ({ ...prev, [index]: true }));
    try {
      if (!rawAnswers.length) {
        setError('Missing context answers for whyMatch.');
        return;
      }
      const payload = {
        breed: result.breed,
        matchPercentage: result.matchPercentage,
        answers: rawAnswers
      };
      const res = await api.post('/api/llm/whyMatch', payload);
      setWhyMatchInfo(prev => ({ ...prev, [index]: res.data.data }));
    } catch (err) {
      console.error('whyMatch error', err);
      setError('Failed to get explanation for match.');
    } finally {
      setLoadingWhyMatch(prev => ({ ...prev, [index]: false }));
    }
  };

  // Fetch "Why not this breed?"
  const fetchWhyNot = async () => {
    setError(null);
    if (!whyNotBreed) return;
    setLoadingWhyNot(true);
    setWhyNotInfo('');
    try {
      if (!rawAnswers.length) {
        setError('Missing context answers for whyNot.');
        return;
      }
      const payload = {
        breed: whyNotBreed,
        answers: rawAnswers
      };
      const res = await api.post('/api/llm/whyNot', payload);
      setWhyNotInfo(res.data.data);
    } catch (err) {
      console.error('whyNot error', err);
      setError('Failed to get why-not explanation.');
    } finally {
      setLoadingWhyNot(false);
    }
  };

  // Fetch care tips
  const fetchCareTips = async (breed, index) => {
    setError(null);
    setLoadingCareTips(prev => ({ ...prev, [index]: true }));
    try {
      const res = await api.post('/api/llm/careTips', { breed });
      setCareTipsInfo(prev => ({ ...prev, [index]: res.data.data }));
    } catch (e) {
      console.error('careTips error', e);
      setError('Failed to get care tips.');
    } finally {
      setLoadingCareTips(prev => ({ ...prev, [index]: false }));
    }
  };

  // Reset flow
  const handleTryAgain = () => {
    localStorage.removeItem('dog4you_answers');
    localStorage.removeItem('dog4you_currentIndex');
    navigate('/questionnaire');
  };

  // No results case
  if (!results.length) {
    return (
      <div style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>
        <p>No matches found.</p>
        <button onClick={handleTryAgain}>Try Again</button>
        {error && <div style={{ color: 'crimson', marginTop: 12 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>Your Matches</h1>
      <p style={{ fontSize: 12, marginTop: 4, marginBottom: 16 }}>
        Matches are based on verified breed standards and your preferences. Individual dogs may vary.
      </p>

      {results.map((r, i) => (
        <div key={i} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <h2 style={{ margin: '0 0 4px' }}>
                #{i + 1} 🐶 {r.breed} — {r.matchPercentage}% match
              </h2>
              {r.reasons && r.reasons.length > 0 && (
                <p style={{ color: '#b55', margin: 0 }}>
                  Not perfect because: {r.reasons.join('; ')}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => fetchWhyMatch(r, i)}
                disabled={loadingWhyMatch[i]}
                aria-busy={loadingWhyMatch[i]}
                aria-label={`Why this match for ${r.breed}`}
              >
                {loadingWhyMatch[i] ? '⏳ Loading...' : 'Why this match?'}
              </button>
              <button
                onClick={() => fetchCareTips(r.breed, i)}
                disabled={loadingCareTips[i]}
                aria-busy={loadingCareTips[i]}
                aria-label={`Show care tips for ${r.breed}`}
              >
                {loadingCareTips[i] ? '⏳ Loading...' : 'Show Care Tips'}
              </button>
            </div>
          </div>

          {whyMatchInfo[i] && (
            <div style={{ background: '#f0f8ff', padding: '10px', borderRadius: 6, marginTop: 12 }}>
              <strong>Explanation:</strong> {whyMatchInfo[i]}
            </div>
          )}

          {careTipsInfo[i] && (
            <div style={{ background: '#e8f7e8', padding: 10, borderRadius: 6, marginTop: 12 }}>
              <strong>Care Tips:</strong> {careTipsInfo[i]}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 24, borderTop: '1px solid #ddd', paddingTop: 24 }}>
        <h3>Expected a different breed?</h3>
        <p style={{ marginTop: 4 }}>
          Type the breed you thought you’d get and ask why not. If a breed was explicitly excluded by your dealbreaker, you’ll see that highlighted.
        </p>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            aria-label="Enter a breed name to check why it was not recommended"
            value={whyNotBreed}
            onChange={(e) => {
                const val = e.target.value;
                setWhyNotInfo('');
                setExclusionBannerText('');
                debouncedSetWhyNotBreed(val);
            }}
            placeholder="e.g., Border Collie"
            style={{ flex: 1, minWidth: 200, padding: 6 }}
          />
          <button
            onClick={fetchWhyNot}
            disabled={loadingWhyNot || !whyNotBreed}
            aria-busy={loadingWhyNot}
            aria-label={whyNotBreed ? `Why not ${whyNotBreed}` : 'Enter a breed to ask why not'}
          >
            {loadingWhyNot ? '⏳ Thinking...' : `Why not ${whyNotBreed}?`}
          </button>
        </div>

        {exclusionBannerText && (
          <div
            style={{
              background: exclusionBannerText.toLowerCase().includes('not found') ? '#fff3cd' : '#ffe8e8',
              padding: 10,
              borderRadius: 6,
              marginTop: 12,
              border: exclusionBannerText.toLowerCase().includes('not found')
                ? '1px solid #ffe58f'
                : '1px solid #dd9999',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <strong>{exclusionBannerText}</strong>
            </div>
            {exclusionBannerText.toLowerCase().includes('not found') && (
              <button onClick={fetchWhyNot} style={{ marginLeft: 8, padding: '4px 8px' }}>
                Retry
              </button>
            )}
          </div>
        )}

        {whyNotInfo && (
          <div style={{ background: '#fff4e5', padding: 10, borderRadius: 6, marginTop: 12 }}>
            <strong>Why Not Explanation:</strong> {whyNotInfo}
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={handleTryAgain}>Edit Answers / Try Again</button>
        {error && <div style={{ color: 'crimson', marginTop: 4 }}>{error}</div>}
      </div>
    </div>
  );
}

export default Results;
