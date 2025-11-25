const BASE_URL = "http://localhost:9090/api"; // backend port 9090

export interface MovieSearchItem {
  imdbId: string;
  title: string;
  year: string;
  poster: string;
  type: string;
}

export interface MovieSearchResponse {
  search: MovieSearchItem[];
  totalResults: string;
  response: string;
  error?: string | null;
}

export interface MovieDetailResponse {
  title: string;
  year: string;
  poster: string;
  plot: string;
  director: string;
  actors: string;
  genre: string;
  runtime: string;
  imdbRating: string;
}

export async function searchMovies(query: string, page = 1) {
  const res = await fetch(
    `${BASE_URL}/movies/search?q=${encodeURIComponent(query)}&page=${page}`
  );

  if (!res.ok) {
    throw new Error(`Search failed with status ${res.status}`);
  }

  const json = await res.json();

  return {
    search: (json.Search || []).map((m: any) => ({
      imdbId: m.imdbID,
      title: m.Title,
      year: m.Year,
      poster: m.Poster,
      type: m.Type,
    })),
    totalResults: json.totalResults,
    response: json.Response,
    error: json.Error ?? null,
  } as MovieSearchResponse;
}

export async function getMovieDetails(imdbId: string) {
  const res = await fetch(`${BASE_URL}/movies/${imdbId}`);

  if (!res.ok) {
    throw new Error(`Details failed with status ${res.status}`);
  }

  const json = await res.json();

  return {
    title: json.Title,
    year: json.Year,
    poster: json.Poster,
    plot: json.Plot,
    director: json.Director,
    actors: json.Actors,
    genre: json.Genre,
    runtime: json.Runtime,
    imdbRating: json.imdbRating,
  } as MovieDetailResponse;
}
