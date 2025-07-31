import React from 'react';
import { useLocation, Link } from 'react-router-dom';

function Results() {
  const location = useLocation();
  const results = location.state?.results || [];

  return (
    <div>
      <h2>Your Matches</h2>
      {results.length === 0 ? (
        <p>No matches found. Try adjusting your answers!</p>
      ) : (
        <ul>
          {results.map((r, i) => (
            <li key={i}>
              {r.breed} — {r.matchPercentage}% match
              {r.reasons?.length > 0 && (
                <ul>
                  {r.reasons.map((reason, j) => (
                    <li key={j}>⚠️ {reason}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      <Link to="/questionnaire">
        <button>Try Again</button>
      </Link>
    </div>
  );
}

export default Results;
