// /frontend/src/pages/Results.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { traitLabel, valueLabel } from '../utils/traitExplanations'; // Remove traitExplanations import
import './Results.css';

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

// --- Breed image helpers ---
export function slugifyBreed(name) { // Add export
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')   // non-alnum → dash
    .replace(/(^-|-$)/g, '');      // trim dashes
}

// We serve static images from: /public/images/<slug>.jpg
export function getBreedImageUrl(breedName) { // Add export
  const slug = slugifyBreed(breedName);
  return `/images/${slug}.jpg`;
}

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use useMemo to prevent unnecessary re-renders
  const results = useMemo(() => location.state?.results || [], [location.state]);
  const rawAnswers = useMemo(() => location.state?.rawAnswers || [], [location.state]);

  // ─── State ───────────────────────────────────────────────────────
  const [whyMatchInfo, setWhyMatchInfo]       = useState(() => loadJSON(SS_KEYS.whyMatch, {}));
  const [careTipsInfo, setCareTipsInfo]       = useState(() => loadJSON(SS_KEYS.careTips, {}));
  const [whyNotInfo, setWhyNotInfo]           = useState(() => loadJSON(SS_KEYS.whyNot, ''));
  const [inputValue, setInputValue]           = useState(() => loadJSON(SS_KEYS.input, ''));
  const [suggestion, setSuggestion]           = useState(() => loadJSON(SS_KEYS.suggestion, ''));
  const [exclusionBannerText, setExclusionBannerText] = useState(() => loadJSON(SS_KEYS.exclusion, ''));
  const [loadingWhyMatch, setLoadingWhyMatch] = useState({});
  const [loadingWhyNot, setLoadingWhyNot]     = useState(false);
  const [loadingCareTips, setLoadingCareTips] = useState({});
  const [breedDetailsCache, setBreedDetailsCache] = useState({});

  // For autocomplete + "why not" flow
  const [allBreedNames, setAllBreedNames]     = useState([]);
  const [submittedBreed, setSubmittedBreed]   = useState(''); // last submitted/selected breed

  // A stable signature of the result set, order-insensitive:
  const resultsSig = JSON.stringify(
    [...new Set((results || []).map(r => (r.breed || '').toLowerCase()))].sort()
  );

  useEffect(() => {
    const prev = sessionStorage.getItem(SS_KEYS.resultsSig);
    if (prev && prev !== resultsSig) {
      // Results changed → clear cached texts so we don't show "poodle" notes for "collie"
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
    Object.values(SS_KEYS).forEach(k => sessionStorage.removeItem(k));
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
    <div className="results-container">
      <h1>Your Perfect Matches</h1>
      <p className="results-subtitle">
        Based on your preferences and lifestyle, these breeds are the best fit for you.
        Remember that individual dogs may vary based on breeding, training, and environment.
      </p>

      {/* ─── Match Cards ──────────────────────────────────────────── */}
      {results.map((r, i) => (
        <div key={i} className="breed-card">
          <div className="breed-card-header">
            <div className="breed-title">
              <h2>
                #{i + 1} 🐶 {r.breed} — {r.matchPercentage}% match
              </h2>
              {r.reasons && r.reasons.length > 0 && (
                <p className="imperfect-match">
                  Not perfect because: {r.reasons.join('; ')}
                </p>
              )}
            </div>
            <button
              className="explain-button"
              onClick={() => fetchWhyMatch(r, i)}
              disabled={loadingWhyMatch[i]}
            >
              {loadingWhyMatch[i] ? '⏳ Loading...' : 'Why this match?'}
            </button>
          </div>
          
          {/* Breed image and details */}
          <div className="breed-content">
            {/* Breed image */}
            <div className="breed-image-container">
              <img 
                src={getBreedImageUrl(r.breed)} 
                alt={r.breed}
                className="breed-image"
                onError={(e) => {
                  e.target.src = '/images/placeholder-dog.jpg';
                }}
              />
              <p className="breed-name">{r.breed}</p>
            </div>
            
            {/* Breed details and buttons */}
            <div className="breed-details">
              <div className="explanation-section">
                {whyMatchInfo[i] && (
                  <div className="why-match-info">
                    <strong>Explanation:</strong> {whyMatchInfo[i]}
                  </div>
                )}
              </div>
              
              <div className="action-buttons">
                <button
                  className="care-tips-button"
                  onClick={() => fetchCareTips(r.breed, i)}
                  disabled={loadingCareTips[i]}
                >
                  {loadingCareTips[i] ? '⏳ Loading...' : 'Show Care Tips'}
                </button>
              </div>
              
              {careTipsInfo[i] && (
                <div className="care-tips-info">
                  <strong>Care Tips:</strong> {careTipsInfo[i]}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* ─── "Why not" input, autocomplete, suggestion, explanation ─── */}
      <div className="why-not-section">
        <h3>Expected a different breed?</h3>
        <p>Type the breed you thought you'd get and ask why it wasn't recommended.</p>

        <div className="breed-search">
          <div className="search-input-container">
            <input
              aria-label="Enter a breed name"
              value={inputValue}
              onChange={(e) => {
                const v = e.target.value;
                setInputValue(v);
                setWhyNotInfo('');
                setExclusionBannerText('');
                setSuggestion('');
              }}
              placeholder="e.g., Border Collie"
              className="breed-search-input"
            />
            {allBreedNames.length > 0 && inputValue && (
              <div className="autocomplete-dropdown">
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
                      className="autocomplete-item"
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
            className="why-not-button"
          >
            {loadingWhyNot ? '⏳ Thinking...' : `Why not ${inputValue || '…'}?`}
          </button>
        </div>

        {/* Exclusion Banner (only shows after submit/selection) */}
        {exclusionBannerText && (
          <div className="exclusion-banner">
            <strong>{exclusionBannerText}</strong>
          </div>
        )}

        {/* Did you mean (after submit, for unknown breed) */}
        {suggestion &&
          suggestion.toLowerCase() !== (submittedBreed || inputValue).toLowerCase() && (
            <div className="suggestion-banner">
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
                className="suggestion-button"
              >
                Yes
              </button>
              <button
                onClick={() => setSuggestion('')}
                className="suggestion-button"
              >
                No
              </button>
            </div>
          )}

        {/* Why Not Explanation */}
        {whyNotInfo && (
          <div className="why-not-explanation">
            <strong>Why Not Explanation:</strong> {whyNotInfo}
          </div>
        )}
      </div>

      {/* ─── Try Again ─────────────────────────────────────────────── */}
      <div className="try-again-section">
        <button className="try-again-button" onClick={handleTryAgain}>
          Edit Answers / Try Again
        </button>
      </div>

      {/* Breed Standards Disclaimer */}
      <div className="disclaimer">
        <h4>Important Note About Breed Standards</h4>
        <p>
          The recommendations are based on general breed standards. Individual dogs may vary 
          significantly based on their specific breeding, upbringing, training, and environment. 
          Always meet a dog in person before making decisions, and consider adopting from rescues 
          or working with ethical breeders who prioritize health and temperament.
        </p>
      </div>
    </div>
  );
}

export default Results; 