import { useEffect, useState } from "react";
import { searchMovies, getMovieDetails } from "./api";
import type { MovieSearchItem, MovieDetailResponse } from "./api";

const FAVORITE_IDS_KEY = "omdb_favorite_ids_v1";
const FAVORITE_ITEMS_KEY = "omdb_favorite_items_v1";
const RECENT_KEY = "omdb_recent_v1";
const THEME_KEY = "omdb_theme_v1";
const WATCHLIST_IDS_KEY = "omdb_watchlist_ids_v1";
const WATCHLIST_ITEMS_KEY = "omdb_watchlist_items_v1";

type SortOption = "TITLE_ASC" | "TITLE_DESC" | "YEAR_ASC" | "YEAR_DESC";
type Theme = "dark" | "light";
type TypeFilter = "all" | "movie" | "series" | "episode";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieSearchItem[]>([]);
  const [selected, setSelected] = useState<MovieDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<
    Record<string, MovieSearchItem>
  >({});
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const [sortOption, setSortOption] = useState<SortOption>("TITLE_ASC");
  const [recent, setRecent] = useState<MovieSearchItem[]>([]);
  const [theme, setTheme] = useState<Theme>("dark");

  // NEW: filters
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  // NEW: watchlist
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<
    Record<string, MovieSearchItem>
  >({});

  // Derived IMDb rating info for detail view
  const imdbNumeric = selected ? parseFloat(selected.imdbRating) || 0 : 0;
  const imdbPercent = Math.min(100, (imdbNumeric / 10) * 100);

  // Initial load: favorites, favorite items, recent items, theme, watchlist
  useEffect(() => {
    try {
      const storedIds = localStorage.getItem(FAVORITE_IDS_KEY);
      if (storedIds) {
        const ids = JSON.parse(storedIds);
        if (Array.isArray(ids)) {
          setFavorites(ids);
        }
      }

      const storedItems = localStorage.getItem(FAVORITE_ITEMS_KEY);
      if (storedItems) {
        const itemsArr: MovieSearchItem[] = JSON.parse(storedItems);
        const map: Record<string, MovieSearchItem> = {};
        itemsArr.forEach((item) => {
          if (item.imdbId) {
            map[item.imdbId] = item;
          }
        });
        setFavoriteItems(map);
      }

      const storedRecent = localStorage.getItem(RECENT_KEY);
      if (storedRecent) {
        const recentArr: MovieSearchItem[] = JSON.parse(storedRecent);
        setRecent(recentArr);
      }

      const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      }

      const storedWatchIds = localStorage.getItem(WATCHLIST_IDS_KEY);
      if (storedWatchIds) {
        const ids = JSON.parse(storedWatchIds);
        if (Array.isArray(ids)) {
          setWatchlist(ids);
        }
      }

      const storedWatchItems = localStorage.getItem(WATCHLIST_ITEMS_KEY);
      if (storedWatchItems) {
        const itemsArr: MovieSearchItem[] = JSON.parse(storedWatchItems);
        const map: Record<string, MovieSearchItem> = {};
        itemsArr.forEach((item) => {
          if (item.imdbId) {
            map[item.imdbId] = item;
          }
        });
        setWatchlistItems(map);
      }
    } catch (e) {
      console.warn("Failed to read from localStorage", e);
    }
  }, []);

  // Sync theme with document body + localStorage
  useEffect(() => {
    document.body.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const persistFavorites = (
    ids: string[],
    itemsMap: Record<string, MovieSearchItem>
  ) => {
    setFavorites(ids);
    setFavoriteItems(itemsMap);
    try {
      localStorage.setItem(FAVORITE_IDS_KEY, JSON.stringify(ids));
      localStorage.setItem(
        FAVORITE_ITEMS_KEY,
        JSON.stringify(Object.values(itemsMap))
      );
    } catch (e) {
      console.warn("Failed to save favorites", e);
    }
  };

  const isFavorite = (imdbId: string) => favorites.includes(imdbId);

  const toggleFavorite = (movie: MovieSearchItem) => {
    const imdbId = movie.imdbId;
    setFavorites((prevIds) => {
      const itemsCopy: Record<string, MovieSearchItem> = { ...favoriteItems };
      let updatedIds: string[];

      if (prevIds.includes(imdbId)) {
        updatedIds = prevIds.filter((id) => id !== imdbId);
        delete itemsCopy[imdbId];
      } else {
        updatedIds = [...prevIds, imdbId];
        itemsCopy[imdbId] = movie;
      }

      persistFavorites(updatedIds, itemsCopy);
      return updatedIds;
    });
  };

  // NEW: watchlist helpers
  const persistWatchlist = (
    ids: string[],
    itemsMap: Record<string, MovieSearchItem>
  ) => {
    setWatchlist(ids);
    setWatchlistItems(itemsMap);
    try {
      localStorage.setItem(WATCHLIST_IDS_KEY, JSON.stringify(ids));
      localStorage.setItem(
        WATCHLIST_ITEMS_KEY,
        JSON.stringify(Object.values(itemsMap))
      );
    } catch (e) {
      console.warn("Failed to save watchlist", e);
    }
  };

  const isInWatchlist = (imdbId: string) => watchlist.includes(imdbId);

  const toggleWatchlist = (movie: MovieSearchItem) => {
    const imdbId = movie.imdbId;
    setWatchlist((prevIds) => {
      const itemsCopy: Record<string, MovieSearchItem> = { ...watchlistItems };
      let updatedIds: string[];

      if (prevIds.includes(imdbId)) {
        updatedIds = prevIds.filter((id) => id !== imdbId);
        delete itemsCopy[imdbId];
      } else {
        updatedIds = [...prevIds, imdbId];
        itemsCopy[imdbId] = movie;
      }

      persistWatchlist(updatedIds, itemsCopy);
      return updatedIds;
    });
  };

  async function loadPage(page: number, searchTerm: string) {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setSelected(null);

    try {
      const res = await searchMovies(searchTerm, page);

      if (res.response === "True") {
        setResults(res.search || []);
        setCurrentPage(page);

        const total = parseInt(res.totalResults ?? "0", 10);
        const pages = total > 0 ? Math.ceil(total / 10) : 1;
        setTotalPages(pages);
      } else {
        setResults([]);
        setError(res.error || "No results found");
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowOnlyFavorites(false);
    await loadPage(1, trimmed);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSelected(null);
    setError(null);
    setCurrentPage(1);
    setTotalPages(1);
    setShowOnlyFavorites(false);
    setTypeFilter("all");
    setYearFrom("");
    setYearTo("");
  };

  const handleNextPage = async () => {
    if (currentPage >= totalPages || !query.trim()) return;
    await loadPage(currentPage + 1, query.trim());
  };

  const handlePrevPage = async () => {
    if (currentPage <= 1 || !query.trim()) return;
    await loadPage(currentPage - 1, query.trim());
  };

  const openDetails = async (imdbId: string) => {
    setLoading(true);
    setError(null);
    try {
      const details = await getMovieDetails(imdbId);
      setSelected(details);

      // Update recently viewed
      const fromResults =
        results.find((m) => m.imdbId === imdbId) ||
        favoriteItems[imdbId] ||
        watchlistItems[imdbId] || {
          imdbId,
          title: details.title,
          year: details.year,
          poster: details.poster,
          type: "movie",
        };

      setRecent((prev) => {
        const filtered = prev.filter((m) => m.imdbId !== imdbId);
        const updated = [fromResults, ...filtered].slice(0, 8);
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    } catch (err: any) {
      setError(err.message || "Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts: ← / → for page, ESC to close detail
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingTarget =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      // ESC should always close details, even when typing
      if (e.key === "Escape") {
        setSelected(null);
        return;
      }

      // For arrows, don't mess with typing in the search box
      if (isTypingTarget) {
        return;
      }

      const trimmedQuery = query.trim();
      if (!trimmedQuery || showOnlyFavorites) {
        return;
      }

      if (e.key === "ArrowRight" && currentPage < totalPages) {
        e.preventDefault();
        loadPage(currentPage + 1, trimmedQuery);
      } else if (e.key === "ArrowLeft" && currentPage > 1) {
        e.preventDefault();
        loadPage(currentPage - 1, trimmedQuery);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showOnlyFavorites, currentPage, totalPages, query]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Base list: either all results, or all favorites
  const baseResults = showOnlyFavorites
    ? Object.values(favoriteItems)
    : results;

  // Apply filters before sorting
  const filteredResults = baseResults.filter((movie) => {
    // type filter
    if (typeFilter !== "all" && movie.type !== typeFilter) {
      return false;
    }

    // year filter
    const yearNum = parseInt(String(movie.year).slice(0, 4), 10) || 0;
    if (yearFrom) {
      const from = parseInt(yearFrom, 10);
      if (!isNaN(from) && yearNum < from) return false;
    }
    if (yearTo) {
      const to = parseInt(yearTo, 10);
      if (!isNaN(to) && yearNum > to) return false;
    }
    return true;
  });

  // Sorting
  const sortedResults = [...filteredResults].sort((a, b) => {
    const yearA = parseInt(String(a.year).slice(0, 4), 10) || 0;
    const yearB = parseInt(String(b.year).slice(0, 4), 10) || 0;

    switch (sortOption) {
      case "TITLE_ASC":
        return a.title.localeCompare(b.title);
      case "TITLE_DESC":
        return b.title.localeCompare(a.title);
      case "YEAR_ASC":
        return yearA - yearB;
      case "YEAR_DESC":
        return yearB - yearA;
      default:
        return 0;
    }
  });

  const filtersActive =
    typeFilter !== "all" || yearFrom.trim() !== "" || yearTo.trim() !== "";

  const emptyMessage = showOnlyFavorites
    ? "No favorites yet. Add some by clicking the star on any movie."
    : filtersActive
    ? "No results match the selected filters."
    : query
    ? "No results. Try a different title or spelling."
    : "Start by searching for your favourite movie or series.";

  const watchlistArray = Object.values(watchlistItems);

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1>OMDB Movie Explorer</h1>
          <div className="header-right">
            <button
              type="button"
              className={`fav-toggle ${showOnlyFavorites ? "active" : ""}`}
              onClick={() => setShowOnlyFavorites((prev) => !prev)}
            >
              ★ Favorites ({favorites.length})
            </button>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
            >
              {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </div>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for a movie or series..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={loading && !query}
            className="clear-btn"
          >
            Clear
          </button>
        </form>
      </header>

      {error && <div className="error">{error}</div>}

      <main className="content">
        <section className="results">
          <div className="sort-row">
            <span className="sort-label">Sort by:</span>
            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value="TITLE_ASC">Title (A → Z)</option>
              <option value="TITLE_DESC">Title (Z → A)</option>
              <option value="YEAR_DESC">Year (newest first)</option>
              <option value="YEAR_ASC">Year (oldest first)</option>
            </select>
          </div>

          {/* Filters */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              >
                <option value="all">All</option>
                <option value="movie">Movies</option>
                <option value="series">Series</option>
                <option value="episode">Episodes</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Year from</label>
              <input
                type="number"
                placeholder="e.g. 2000"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Year to</label>
              <input
                type="number"
                placeholder="e.g. 2024"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
              />
            </div>
          </div>

          {loading && <p>Loading...</p>}

          {!loading && sortedResults.length === 0 && !error && (
            <div className="empty-state">
              <p>{emptyMessage}</p>
            </div>
          )}

          <div className="grid">
            {sortedResults.map((movie) => (
              <div key={movie.imdbId} className="card">
                <div
                  className="poster"
                  onClick={() => openDetails(movie.imdbId)}
                >
                  {movie.poster && movie.poster !== "N/A" ? (
                    <img src={movie.poster} alt={movie.title} />
                  ) : (
                    <div className="placeholder">No Image</div>
                  )}
                </div>
                <div className="card-body">
                  <div className="card-top">
                    <div>
                      <h3>{movie.title}</h3>
                      <p>{movie.year}</p>
                    </div>
                    <div className="card-actions">
                      <button
                        type="button"
                        className={`watchlist-button ${
                          isInWatchlist(movie.imdbId) ? "active" : ""
                        }`}
                        onClick={() => toggleWatchlist(movie)}
                        title={
                          isInWatchlist(movie.imdbId)
                            ? "Remove from watchlist"
                            : "Add to watchlist"
                        }
                      >
                        ⏱
                      </button>
                      <button
                        type="button"
                        className={`fav-button ${
                          isFavorite(movie.imdbId) ? "active" : ""
                        }`}
                        onClick={() => toggleFavorite(movie)}
                        title={
                          isFavorite(movie.imdbId)
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        ★
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && !showOnlyFavorites && (
            <div className="pagination">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </button>
            </div>
          )}

          {recent.length > 0 && (
            <div className="recent-section">
              <div className="recent-header">
                <h3>Recently viewed</h3>
                <button
                  type="button"
                  className="recent-clear"
                  onClick={() => {
                    setRecent([]);
                    try {
                      localStorage.removeItem(RECENT_KEY);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Clear
                </button>
              </div>
              <div className="recent-list">
                {recent.map((m) => (
                  <div
                    key={m.imdbId}
                    className="recent-item"
                    onClick={() => openDetails(m.imdbId)}
                  >
                    {m.poster && m.poster !== "N/A" ? (
                      <img src={m.poster} alt={m.title} />
                    ) : (
                      <div className="recent-placeholder">No Image</div>
                    )}
                    <div className="recent-meta">
                      <div className="recent-title">{m.title}</div>
                      <div className="recent-year">{m.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {watchlistArray.length > 0 && (
            <div className="watchlist-section">
              <div className="watchlist-header">
                <h3>Watchlist</h3>
                <button
                  type="button"
                  className="recent-clear"
                  onClick={() => {
                    setWatchlist([]);
                    setWatchlistItems({});
                    try {
                      localStorage.removeItem(WATCHLIST_IDS_KEY);
                      localStorage.removeItem(WATCHLIST_ITEMS_KEY);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Clear
                </button>
              </div>
              <div className="watchlist-list">
                {watchlistArray.map((m) => (
                  <div
                    key={m.imdbId}
                    className="recent-item"
                    onClick={() => openDetails(m.imdbId)}
                  >
                    {m.poster && m.poster !== "N/A" ? (
                      <img src={m.poster} alt={m.title} />
                    ) : (
                      <div className="recent-placeholder">No Image</div>
                    )}
                    <div className="recent-meta">
                      <div className="recent-title">{m.title}</div>
                      <div className="recent-year">{m.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {selected && (
          <section className="detail">
            <h2>
              {selected.title} ({selected.year})
            </h2>
            {selected.poster && selected.poster !== "N/A" && (
              <img src={selected.poster} alt={selected.title} />
            )}

            <div className="detail-meta">
              <p>
                <strong>Genre:</strong> {selected.genre}
              </p>
              <p>
                <strong>Runtime:</strong> {selected.runtime}
              </p>
              <p>
                <strong>Director:</strong> {selected.director}
              </p>
              <p>
                <strong>Actors:</strong> {selected.actors}
              </p>
            </div>

            <div className="rating-section">
              <div className="rating-bar">
                <div
                  className="rating-fill"
                  style={{ width: `${imdbPercent}%` }}
                />
              </div>
              <p className="rating-label">
                IMDb rating: {selected.imdbRating || "N/A"}/10
              </p>
            </div>

            <p>{selected.plot}</p>

            <a
              className="trailer-btn"
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                `${selected.title} ${selected.year} trailer`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              🎬 Watch Trailer
            </a>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
