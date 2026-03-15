import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

const MovieAutocomplete = ({ onSelect, placeholder = "Search for a movie..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchMovies = async () => {
      setIsSearching(true);
      try {
        const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
        if (!token) return;

        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: 'application/json',
            }
          }
        );

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        setResults(data.results.slice(0, 5)); // Keep top 5 results
        setIsOpen(true);
      } catch (err) {
        console.error('Error searching movies:', err);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchMovies();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = async (movie) => {
    setQuery(movie.title); // Update input to show selected name
    setIsOpen(false);
    setIsSearching(true);

    try {
      const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
      if (token) {
        // Fetch credits to get the director
        const creditsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/credits`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: 'application/json',
            }
          }
        );

        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          const director = creditsData.crew?.find(member => member.job === 'Director');
          if (director) {
            movie.director = director.name;
          } else {
            movie.director = 'Unknown';
          }
        }
      }
    } catch (err) {
      console.error('Error fetching movie credits:', err);
    } finally {
      setIsSearching(false);
      onSelect(movie);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    // If they clear the input, clear the selection in parent
    if (!e.target.value.trim()) {
      onSelect(null);
    }
  };

  return (
    <div className="autocomplete-wrapper" ref={dropdownRef}>
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setResults.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          required
          className="glass-input search-input"
        />
        <div className="search-icon-wrapper">
          {isSearching ? (
            <Loader2 size={18} className="spin-animation" style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <Search size={18} style={{ color: 'var(--text-secondary)' }} />
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <ul className="autocomplete-dropdown glass-panel">
          {results.map((movie) => (
            <li
              key={movie.id}
              className="autocomplete-item"
              onClick={() => handleSelect(movie)}
            >
              <div className="autocomplete-item-content">
                <span className="autocomplete-title">{movie.title}</span>
                {movie.release_date && (
                  <span className="autocomplete-year">({movie.release_date.split('-')[0]})</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MovieAutocomplete;
