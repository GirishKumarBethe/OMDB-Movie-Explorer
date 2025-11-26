package com.finfactor.backend.service;
import org.springframework.web.util.UriComponentsBuilder;
import com.finfactor.backend.dto.MovieDetailResponse;
import com.finfactor.backend.dto.MovieSearchResponse;
import com.finfactor.backend.exception.OmdbClientException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class OmdbClient {
    // TTL: 60 seconds (adjust as you like)
    private final SimpleCache<MovieSearchResponse> searchCache =
            new SimpleCache<>(60_000);

    private final SimpleCache<MovieDetailResponse> detailCache =
            new SimpleCache<>(60_000);


    private final RestTemplate restTemplate = new RestTemplate();
    private final String baseUrl;
    private final String apiKey;

    public OmdbClient(
            @Value("${omdb.base-url}") String baseUrl,
            @Value("${omdb.api-key}") String apiKey
    ) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    public MovieSearchResponse search(String query, int page) {
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase();
        String cacheKey = "search:" + normalizedQuery + ":" + page;

        // 1) Try cache
        MovieSearchResponse cached = searchCache.get(cacheKey);
        if (cached != null) {
            return cached;
        }
        String url = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("apikey", apiKey)
                .queryParam("s", query)
                .queryParam("page", page)
                .toUriString();

        MovieSearchResponse response =
                restTemplate.getForObject(url, MovieSearchResponse.class);

        if (response == null || "False".equalsIgnoreCase(response.getResponse())) {
            throw new OmdbClientException(
                    response != null && response.getError() != null
                            ? response.getError()
                            : "Unknown error while searching OMDB"
            );
        }
        searchCache.put(cacheKey, response);
        return response;
    }

    public MovieDetailResponse getByImdbId(String imdbId) {
        String normalizedId = imdbId == null ? "" : imdbId.trim().toLowerCase();
        String cacheKey = "detail:" + normalizedId;

        // 1) Try cache
        MovieDetailResponse cached = detailCache.get(cacheKey);
        if (cached != null) {
            return cached;
        }
        String url = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("apikey", apiKey)
                .queryParam("i", imdbId)
                .queryParam("plot", "full")
                .toUriString();

        MovieDetailResponse response =
                restTemplate.getForObject(url, MovieDetailResponse.class);

        if (response == null || "False".equalsIgnoreCase(response.getResponse())) {
            throw new OmdbClientException(
                    response != null && response.getError() != null
                            ? response.getError()
                            : "Unknown error while fetching movie details"
            );
        }
        detailCache.put(cacheKey, response);
        return response;
    }
}
