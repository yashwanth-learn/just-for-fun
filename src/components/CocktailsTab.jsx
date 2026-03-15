import React, { useState, useEffect } from 'react';
import { Wine, RotateCcw, Loader2 } from 'lucide-react';

const CocktailsTab = () => {
  const [cocktails, setCocktails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState(new Set());

  // Curated list of the most popular/iconic cocktails by their TheCocktailDB IDs
  const POPULAR_IDS = [
    '11007', // Margarita
    '11001', // Old Fashioned
    '11000', // Mojito
    '17222', // A1
    '11003', // Negroni
    '17196', // Cosmopolitan
    '11005', // Dry Martini
    '11006', // Caipirinha
    '11008', // Manhattan
    '11009', // Moscow Mule
    '11002', // Long Island Iced Tea
    '11004', // Pina Colada
    '178332', // Espresso Martini
    '17225', // Aviation
    '11010', // Mai Tai
    '11011', // Daiquiri
    '17210', // Sidecar
    '11016', // Whiskey Sour
  ];

  useEffect(() => {
    fetchCocktails();
  }, []);

  const fetchCocktails = async () => {
    try {
      setIsLoading(true);
      const promises = POPULAR_IDS.map(id =>
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
          .then(res => res.json())
          .then(data => (data.drinks && data.drinks[0]) || null)
          .catch(() => null)
      );

      const results = await Promise.all(promises);
      setCocktails(results.filter(Boolean));
    } catch (err) {
      console.error('Error fetching cocktails:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIngredients = (drink) => {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ing = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push({
          name: ing.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    return ingredients;
  };

  const toggleFlip = (id) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="cocktails-content-wrapper">
      <div className="movies-section-header">
        <h2>Trending Cocktails</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Powered by TheCocktailDB
        </span>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 size={32} className="spin-animation" style={{ color: 'var(--accent-color)' }} />
        </div>
      ) : cocktails.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          Could not load cocktails. Please try again later.
        </p>
      ) : (
        <div className="cocktail-grid">
          {cocktails.map(drink => {
            const isFlipped = flippedCards.has(drink.idDrink);
            const ingredients = getIngredients(drink);

            return (
              <div
                key={drink.idDrink}
                className={`flip-card ${isFlipped ? 'flipped' : ''}`}
                onClick={() => toggleFlip(drink.idDrink)}
              >
                <div className="flip-card-inner">
                  {/* FRONT */}
                  <div className="flip-card-front glass-panel">
                    <div className="cocktail-image-wrapper">
                      <img
                        src={drink.strDrinkThumb}
                        alt={drink.strDrink}
                        className="cocktail-image"
                        loading="lazy"
                      />
                      <div className="cocktail-image-overlay">
                        <span className="flip-hint">
                          <RotateCcw size={14} /> Tap for recipe
                        </span>
                      </div>
                    </div>
                    <div className="cocktail-front-info">
                      <h3 className="cocktail-name">{drink.strDrink}</h3>
                      <div className="cocktail-category">{drink.strCategory}</div>
                      <div className="ingredient-chips">
                        {ingredients.slice(0, 5).map((ing, idx) => (
                          <span key={idx} className="ingredient-chip">
                            {ing.name}
                          </span>
                        ))}
                        {ingredients.length > 5 && (
                          <span className="ingredient-chip ingredient-more">
                            +{ingredients.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="flip-card-back glass-panel">
                    <div className="cocktail-back-header">
                      <h3 className="cocktail-name">{drink.strDrink}</h3>
                      <span className="flip-hint-back">
                        <RotateCcw size={14} /> Tap to flip
                      </span>
                    </div>
                    <div className="cocktail-ingredients-full">
                      <h4>Ingredients</h4>
                      <ul>
                        {ingredients.map((ing, idx) => (
                          <li key={idx}>
                            <span className="ing-measure">{ing.measure}</span> {ing.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="cocktail-instructions">
                      <h4>Instructions</h4>
                      <p>{drink.strInstructions}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CocktailsTab;
