package com.finfactor.backend.service;

import com.finfactor.backend.dto.MovieDetailResponse;
import com.finfactor.backend.dto.MovieSearchResponse;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class MovieService {

    private final OmdbClient omdbClient;

    public MovieService(OmdbClient omdbClient) {
        this.omdbClient = omdbClient;
    }

    @Cacheable(value = "searchCache", key = "#query + '_' + #page")
    public MovieSearchResponse searchMovies(String query, int page) {
        return omdbClient.search(query, page);
    }

    @Cacheable(value = "detailCache", key = "#imdbId")
    public MovieDetailResponse getMovieDetails(String imdbId) {
        return omdbClient.getByImdbId(imdbId);
    }
}
