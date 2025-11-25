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
        return response;
    }

    public MovieDetailResponse getByImdbId(String imdbId) {
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
        return response;
    }
}
