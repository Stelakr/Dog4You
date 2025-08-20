// /frontend/src/pages/Results.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { traitExplanations, traitLabel, valueLabel } from '../utils/traitExplanations';

// --- sessionStorage helpers (persist explanations across refreshes) ---
const SS_KEYS = {
  whyMatch:   'dog4you_whyMatchInfo',
  careTips:   'dog4you_careTipsInfo',
  whyNot:     'dog4you_whyNotInfo',
  input:      'dog4you_whyNotInput',
  suggestion: 'dog4you_suggestion',
  exclusion:  'dog4you_exclusionBanner',
  resultsSig: 'dog4you_resultsSig',
};

const loadJSON = (k, fallback) => {
  try { const s = sessionStorage.getItem(k); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
};
const saveJSON = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} };


function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results || [];
  const rawAnswers = location.state?.rawAnswers || [];

  // ─── State ───────────────────────────────────────────────────────
  //const [whyMatchInfo, setWhyMatchInfo]       = useState({});
  //const [whyNotInfo, setWhyNotInfo]           = useState('');
  const [loadingWhyMatch, setLoadingWhyMatch] = useState({});
  const [loadingWhyNot, setLoadingWhyNot]     = useState(false);
  //const [careTipsInfo, setCareTipsInfo]       = useState({});
  const [loadingCareTips, setLoadingCareTips] = useState({});
  const [breedDetailsCache, setBreedDetailsCache]     = useState({});
  //const [exclusionBannerText, setExclusionBannerText] = useState('');

  const [whyMatchInfo, setWhyMatchInfo]       = useState(() => loadJSON(SS_KEYS.whyMatch, {}));
  const [careTipsInfo, setCareTipsInfo]       = useState(() => loadJSON(SS_KEYS.careTips, {}));
  const [whyNotInfo, setWhyNotInfo]           = useState(() => loadJSON(SS_KEYS.whyNot, ''));
  const [inputValue, setInputValue]           = useState(() => loadJSON(SS_KEYS.input, ''));
  const [suggestion, setSuggestion]           = useState(() => loadJSON(SS_KEYS.suggestion, ''));
  const [exclusionBannerText, setExclusionBannerText]       = useState(() => loadJSON(SS_KEYS.exclusion, ''));

  // For autocomplete + “why not” flow
  const [allBreedNames, setAllBreedNames]     = useState([]);
  //const [inputValue, setInputValue]           = useState(''); // raw textbox value
  const [submittedBreed, setSubmittedBreed]   = useState(''); // last submitted/selected breed
  //const [suggestion, setSuggestion]           = useState(''); // did-you-mean value

  // A stable signature of the result set, order-insensitive:
  const resultsSig = JSON.stringify(
    [...new Set((results || []).map(r => (r.breed || '').toLowerCase()))].sort()
  );

  useEffect(() => {
    const prev = sessionStorage.getItem(SS_KEYS.resultsSig);
    if (prev && prev !== resultsSig) {
      // Results changed → clear cached texts so we don’t show “poodle” notes for “collie”
      setWhyMatchInfo({});
      setCareTipsInfo({});
      setWhyNotInfo('');
      setSuggestion('');
      setExclusionBannerText('');
    }
    sessionStorage.setItem(SS_KEYS.resultsSig, resultsSig);
  }, [resultsSig]);


  useEffect(() => saveJSON(SS_KEYS.whyMatch,   whyMatchInfo),        [whyMatchInfo]);
  useEffect(() => saveJSON(SS_KEYS.careTips,   careTipsInfo),        [careTipsInfo]);
  useEffect(() => saveJSON(SS_KEYS.whyNot,     whyNotInfo),          [whyNotInfo]);
  useEffect(() => saveJSON(SS_KEYS.input,      inputValue),          [inputValue]);
  useEffect(() => saveJSON(SS_KEYS.suggestion, suggestion),          [suggestion]);
  useEffect(() => saveJSON(SS_KEYS.exclusion,  exclusionBannerText), [exclusionBannerText]);


  // ─── Redirect if missing context ────────────────────────────────
  useEffect(() => {
    if (!rawAnswers.length || !results.length) {
      const t = setTimeout(() => navigate('/questionnaire'), 800);
      return () => clearTimeout(t);
    }
  }, [rawAnswers, results, navigate]);

  // ─── Load all breed names (for autocomplete) ─────────────────────
  useEffect(() => {
    async function loadBreedNames() {
      try {
        const res = await api.get('/api/breeds?limit=1000');
        setAllBreedNames(res.data.data.map((b) => b.name));
      } catch (e) {
        console.warn('Failed to load breed names', e);
      }
    }
    loadBreedNames();
  }, []);

  // ─── Cached fetch of single breed details ───────────────────────
  const fetchBreedDetails = useCallback(
    async (breedName) => {
      if (!breedName) return null;
      if (breedDetailsCache[breedName]) return breedDetailsCache[breedName];
      try {
        const res = await api.get(`/api/breeds/${encodeURIComponent(breedName)}`);
        if (res.data?.success) {
          setBreedDetailsCache((p) => ({ ...p, [breedName]: res.data.data }));
          return res.data.data;
        }
      } catch {}
      return null;
    },
    [breedDetailsCache]
  );

  // ─── Helper: compute exclusion banner for a valid breed ─────────
  const computeExclusionBanner = (breedData) => {
    if (!breedData || !rawAnswers.length) return '';

    const applicable = rawAnswers
      .filter(a => a.dealbreaker && a.mode === 'exclude')
      .filter(a => {
        let breedValue;
        if (a.trait === 'sizeCategory') {
          const h = breedData.height?.max;
          if (h == null) return false;
          breedValue = h < 30 ? 'small' : h <= 55 ? 'medium' : 'large';
        } else {
          breedValue = breedData[a.trait];
        }
        if (breedValue == null) return false;

        const userVals = Array.isArray(a.value) ? a.value : [a.value];
        return Array.isArray(breedValue)
          ? userVals.some(v => breedValue.includes(v))
          : userVals.includes(breedValue);
      });

    if (!applicable.length) return '';

    const parts = applicable.map(a => {
      const prettyTrait = traitLabel(a.trait);
      const prettyVal   = valueLabel(a.trait, a.value); // handles arrays & maps values → human labels
      return `You excluded ${prettyTrait}: ${prettyVal}`;
    });

    return `${parts.join(' and ')} via exclude dealbreaker.`;
  };


  // ─── LLM calls for match, care tips, why-not ────────────────────
  const fetchWhyMatch = async (r, i) => {
    setLoadingWhyMatch((p) => ({ ...p, [i]: true }));
    try {
      const res = await api.post('/api/llm/whyMatch', {
        breed: r.breed,
        matchPercentage: r.matchPercentage,
        answers: rawAnswers
      });
      setWhyMatchInfo((p) => ({ ...p, [i]: res.data.data }));
    } catch {
      /* handle error */
    } finally {
      setLoadingWhyMatch((p) => ({ ...p, [i]: false }));
    }
  };

  const fetchCareTips = async (breed, i) => {
    setLoadingCareTips((p) => ({ ...p, [i]: true }));
    try {
      const res = await api.post('/api/llm/careTips', { breed });
      setCareTipsInfo((p) => ({ ...p, [i]: res.data.data }));
    } catch {
      /* handle error */
    } finally {
      setLoadingCareTips((p) => ({ ...p, [i]: false }));
    }
  };

  // The ONLY path that can produce: not-found banner, did-you-mean, and whyNot explanation.
  const fetchWhyNot = async () => {
    setLoadingWhyNot(true);
    setWhyNotInfo('');
    setExclusionBannerText('');
    setSuggestion('');

    try {
      const chosen = inputValue.trim();
      if (!chosen) {
        setLoadingWhyNot(false);
        return;
      }

      setSubmittedBreed(chosen);

      // 1) Validate breed exists in DB first
      const breedData = await fetchBreedDetails(chosen);
      if (!breedData) {
        // Unknown → show banner and suggest canonical name via LLM
        setExclusionBannerText('Breed not found in our database.');
        try {
          const resp = await api.post('/api/llm/suggestBreed', { input: chosen });
          const cand = (resp.data?.data || '').trim();
          if (cand && cand.toLowerCase() !== 'unknown' && cand.toLowerCase() !== chosen.toLowerCase()) {
            setSuggestion(cand);
          }
        } catch {
          // no suggestion
        }
        return; // STOP: do not call /whyNot for unknown breeds
      }

      // 2) Breed exists → compute exclusion banner (if any)
      const banner = computeExclusionBanner(breedData);
      if (banner) setExclusionBannerText(banner);

      // 3) Call LLM whyNot with context
      const res = await api.post('/api/llm/whyNot', {
        breed: chosen,
        answers: rawAnswers
      });
      setWhyNotInfo(res.data.data);
    } catch {
      setWhyNotInfo('Failed to load explanation.');
    } finally {
      setLoadingWhyNot(false);
    }
  };

  // ─── Retry / Start over ─────────────────────────────────────────
const handleTryAgain = () => {
  localStorage.removeItem('dog4you_answers');
  localStorage.removeItem('dog4you_currentIndex');
  Object.values(SS_KEYS).forEach(k => sessionStorage.removeItem(k)); // ← add this line
  navigate('/questionnaire');
};


  // ─── Render ─────────────────────────────────────────────────────
  if (!results.length) {
    return (
      <div style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>
        <p>No matches found.</p>
        <button onClick={handleTryAgain}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>Your Matches</h1>
      <p style={{ fontSize: 12, marginBottom: 16 }}>
        Matches are based on verified breed standards and your preferences.
      </p>

      {/* ─── Match Cards ──────────────────────────────────────────── */}
      {results.map((r, i) => (
        <div
          key={i}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: 8,
            marginBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0 }}>
                #{i + 1} 🐶 {r.breed} — {r.matchPercentage}% match
              </h2>
              {r.reasons && r.reasons.length > 0 && (
                <p style={{ color: '#b55', margin: '4px 0 0' }}>
                  Not perfect because: {r.reasons.join('; ')}
                </p>
              )}
            </div>
            <button
              onClick={() => fetchWhyMatch(r, i)}
              disabled={loadingWhyMatch[i]}
            >
              {loadingWhyMatch[i] ? '⏳ Loading...' : 'Why this match?'}
            </button>
          </div>

          {whyMatchInfo[i] && (
            <div style={{ background: '#f0f8ff', padding: 10, borderRadius: 6, marginTop: 8 }}>
              <strong>Explanation:</strong> {whyMatchInfo[i]}
            </div>
          )}

          <button
            onClick={() => fetchCareTips(r.breed, i)}
            disabled={loadingCareTips[i]}
            style={{ marginTop: 8 }}
          >
            {loadingCareTips[i] ? '⏳ Loading...' : 'Show Care Tips'}
          </button>
          {careTipsInfo[i] && (
            <div style={{ background: '#e8f7e8', padding: 10, borderRadius: 6, marginTop: 8 }}>
              <strong>Care Tips:</strong> {careTipsInfo[i]}
            </div>
          )}
        </div>
      ))}

      {/* ─── “Why not” input, autocomplete, suggestion, explanation ─── */}
      <div style={{ marginTop: 24, borderTop: '1px solid #ddd', paddingTop: 24 }}>
        <h3>Expected a different breed?</h3>
        <p>Type the breed you thought you’d get and ask why not.</p>

        <div style={{ position: 'relative', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Input + Autocomplete */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <input
              aria-label="Enter a breed name"
              value={inputValue}
              onChange={(e) => {
                const v = e.target.value;
                setInputValue(v);
                // Clear previous outputs while editing
                setWhyNotInfo('');
                setExclusionBannerText('');
                setSuggestion('');
              }}
              placeholder="e.g., Border Collie"
              style={{ width: '100%', padding: 6, boxSizing: 'border-box' }}
            />
            {allBreedNames.length > 0 && inputValue && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #ccc',
                  zIndex: 10,
                  maxHeight: 160,
                  overflowY: 'auto'
                }}
              >
                {allBreedNames
                  .filter((n) => {
                    const lowN = n.toLowerCase();
                    const q = inputValue.toLowerCase();
                    return lowN.includes(q) && lowN !== q; // hide exact match
                  })
                  .slice(0, 5)
                  .map((b) => (
                    <div
                      key={b}
                      onClick={() => {
                        // choose suggestion → run why-not immediately
                        setInputValue(b);
                        setSubmittedBreed(b);
                        setWhyNotInfo('');
                        setExclusionBannerText('');
                        setSuggestion('');
                        // Use current selection
                        (async () => {
                          setLoadingWhyNot(true);
                          try {
                            const data = await fetchBreedDetails(b);
                            if (!data) {
                              setExclusionBannerText('Breed not found in our database.');
                              // Try suggestion anyway (usually unnecessary for suggestions)
                              try {
                                const resp = await api.post('/api/llm/suggestBreed', { input: b });
                                const cand = (resp.data?.data || '').trim();
                                if (cand && cand.toLowerCase() !== 'unknown' && cand.toLowerCase() !== b.toLowerCase()) {
                                  setSuggestion(cand);
                                }
                              } catch {}
                              return;
                            }
                            const banner = computeExclusionBanner(data);
                            if (banner) setExclusionBannerText(banner);

                            const res = await api.post('/api/llm/whyNot', {
                              breed: b,
                              answers: rawAnswers
                            });
                            setWhyNotInfo(res.data.data);
                          } catch {
                            setWhyNotInfo('Failed to load explanation.');
                          } finally {
                            setLoadingWhyNot(false);
                          }
                        })();
                      }}
                      style={{
                        padding: '6px 10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee'
                      }}
                    >
                      {b}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Button uses freshest input value */}
          <button
            onClick={fetchWhyNot}
            disabled={loadingWhyNot || !inputValue.trim()}
            aria-busy={loadingWhyNot}
            aria-label={inputValue ? `Why not ${inputValue}` : 'Enter a breed to ask why not'}
            style={{ padding: '8px 14px' }}
          >
            {loadingWhyNot ? '⏳ Thinking...' : `Why not ${inputValue || '…'}?`}
          </button>
        </div>

        {/* Exclusion Banner (only shows after submit/selection) */}
        {exclusionBannerText && (
          <div
            style={{
              background: exclusionBannerText.includes('not found') ? '#fff3cd' : '#ffe8e8',
              padding: 10,
              borderRadius: 6,
              marginTop: 12,
              border: exclusionBannerText.includes('not found')
                ? '1px solid #ffe58f'
                : '1px solid #dd9999'
            }}
          >
            <strong>{exclusionBannerText}</strong>
          </div>
        )}

        {/* Did you mean (after submit, for unknown breed) */}
        {suggestion &&
          suggestion.toLowerCase() !== (submittedBreed || inputValue).toLowerCase() && (
            <div
              style={{
                marginTop: 8,
                background: '#fff8e1',
                padding: 8,
                borderRadius: 6,
                border: '1px solid #ffd966'
              }}
            >
              Did you mean <strong>{suggestion}</strong>?
              <button
                onClick={() => {
                  setInputValue(suggestion);
                  setSubmittedBreed(suggestion);
                  setWhyNotInfo('');
                  setExclusionBannerText('');
                  setSuggestion('');
                  fetchWhyNot(); // valid → will call LLM
                }}
                style={{ marginLeft: 8 }}
              >
                Yes
              </button>
              <button
                onClick={() => setSuggestion('')}
                style={{ marginLeft: 6 }}
              >
                No
              </button>
            </div>
          )}

        {/* Why Not Explanation */}
        {whyNotInfo && (
          <div
            style={{
              background: '#fff4e5',
              padding: 10,
              borderRadius: 6,
              marginTop: 12
            }}
          >
            <strong>Why Not Explanation:</strong> {whyNotInfo}
          </div>
        )}
      </div>

      {/* ─── Try Again ─────────────────────────────────────────────── */}
      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={handleTryAgain}>Edit Answers / Try Again</button>
      </div>
    </div>
  );
}

export default Results;
