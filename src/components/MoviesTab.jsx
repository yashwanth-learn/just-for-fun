import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import MovieCard from './MovieCard';
import MovieAutocomplete from './MovieAutocomplete';
import { ThumbsUp, Trash2, Film } from 'lucide-react';

const MoviesTab = () => {
  const [wishlist, setWishlist] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  // Form state
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);

  useEffect(() => {
    fetchWishlist();
    fetchUpcomingIndianMovies();
  }, []);

  const fetchWishlist = async () => {
    try {
      setIsLoadingWishlist(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlist(data || []);
    } catch (err) {
      console.error('Error fetching movie wishlist:', err);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const fetchUpcomingIndianMovies = async () => {
    try {
      setIsLoadingUpcoming(true);
      const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
      if (!token) {
        console.warn("No TMDB token found.");
        setIsLoadingUpcoming(false);
        return;
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=primary_release_date.asc&with_origin_country=IN&primary_release_date.gte=${new Date().toISOString().split('T')[0]}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch from TMDB');

      const data = await response.json();
      setUpcomingMovies(data.results || []);
    } catch (err) {
      console.error('Error fetching TMDB movies:', err);
    } finally {
      setIsLoadingUpcoming(false);
    }
  };

  const handleSuggestMovie = async (e) => {
    e.preventDefault();
    if (!selectedMovie) {
      alert("Please select a movie from the search dropdown.");
      return;
    }

    const existing = wishlist.find(m => m.title.toLowerCase() === selectedMovie.title.toLowerCase());
    if (existing) {
      alert("This movie is already in the wishlist. You can upvote it below!");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('movies')
        .insert([{
          title: selectedMovie.title,
          suggested_by: '',
          notes: '',
          votes: 1,
          poster_path: selectedMovie.poster_path,
          director: selectedMovie.director
        }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setWishlist(prev => [data[0], ...prev].sort((a, b) => b.votes - a.votes));
        setSelectedMovie(null);
      }
    } catch (err) {
      console.error('Error suggesting movie:', err);
      alert("Failed to save movie.");
    }
  };

  const handleVote = async (id, currentVotes) => {
    try {
      setWishlist(prev => prev.map(m => m.id === id ? { ...m, votes: m.votes + 1 } : m).sort((a, b) => b.votes - a.votes));

      const { error } = await supabase
        .from('movies')
        .update({ votes: currentVotes + 1 })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error voting for movie:', err);
      fetchWishlist();
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie from the wishlist?")) {
      return;
    }

    try {
      setWishlist(prev => prev.filter(m => m.id !== id));

      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting movie:', err);
      alert("Failed to delete movie.");
      fetchWishlist();
    }
  };

  return (
    <div className="movies-content-wrapper">

      {/* Top Section: Movie Wishlist Form & List */}
      <section className="dashboard-content">
        <div className="wishlist-add-bar glass-panel">
          <form onSubmit={handleSuggestMovie} className="wishlist-add-form">
              <MovieAutocomplete
                onSelect={(movie) => setSelectedMovie(movie)}
                placeholder="Search for a movie..."
              />
            <button type="submit" className="btn-primary wishlist-add-btn">
              + Add
            </button>
          </form>
        </div>

        <div className="movies-section-header">
          <h2>Group Movie Wishlist</h2>
        </div>

        {isLoadingWishlist ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading wishlist...</p>
        ) : wishlist.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No movies suggested yet. Be the first!</p>
        ) : (
          <div className="suggestions-list">
            {wishlist.map(movie => (
              <div key={movie.id} className="suggestion-card glass-panel">
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 10 }}>
                  <button
                    className="btn-delete-small"
                    onClick={() => handleDeleteMovie(movie.id)}
                    aria-label="Delete movie"
                    title="Delete movie"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="suggestion-poster-wrapper">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={`${movie.title} poster`}
                      className="suggestion-poster"
                      loading="lazy"
                    />
                  ) : (
                    <Film size={24} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                  )}
                </div>

                <div className="suggestion-content">
                  <div className="suggestion-header">
                    <div>
                      <h3 className="suggestion-title">{movie.title}</h3>
                      {movie.director && (
                        <div className="suggestion-director">Dir: {movie.director}</div>
                      )}
                      <div className="suggestion-meta">
                        <span>{movie.suggested_by ? `Suggested by ${movie.suggested_by}` : 'Anonymous'}</span>
                      </div>
                    </div>

                    <button
                      className="vote-btn"
                      onClick={() => handleVote(movie.id, movie.votes)}
                      aria-label="Vote for movie"
                    >
                      <ThumbsUp size={16} />
                      <span className="vote-count">{movie.votes}</span>
                    </button>
                  </div>

                  {movie.notes && (
                    <div className="suggestion-notes">
                      {movie.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Section: Upcoming Indian Movies (TMDB) */}
      <section style={{ marginTop: '2rem' }}>
        <div className="movies-section-header">
          <h2>Upcoming Indian Movies</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Powered by TMDB</span>
        </div>

        {isLoadingUpcoming ? (
          <p style={{ color: 'var(--text-secondary)' }}>Fetching latest movies...</p>
        ) : upcomingMovies.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No upcoming movies found or TMDB integration pending.</p>
        ) : (
          <div className="movies-grid">
            {upcomingMovies.map(movie => (
              <MovieCard
                key={movie.id}
                title={movie.title || movie.original_title}
                releaseDate={movie.release_date}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default MoviesTab;
