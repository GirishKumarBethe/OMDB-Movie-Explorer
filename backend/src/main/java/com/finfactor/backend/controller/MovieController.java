package com.finfactor.backend.controller;

import com.finfactor.backend.dto.MovieDetailResponse;
import com.finfactor.backend.dto.MovieSearchResponse;
import com.finfactor.backend.service.MovieService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "http://localhost:5173") // React dev server (we'll use later)
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping("/search")
    public MovieSearchResponse search(
            @RequestParam("q") String query,
            @RequestParam(name = "page", defaultValue = "1") int page
    ) {
        return movieService.searchMovies(query.trim(), page);
    }

    @GetMapping("/{imdbId}")
    public MovieDetailResponse getDetails(@PathVariable String imdbId) {
        return movieService.getMovieDetails(imdbId);
    }
}
