package com.finfactor.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MovieDetailResponse {

    @JsonProperty("Title")
    private String title;

    @JsonProperty("Year")
    private String year;

    @JsonProperty("Poster")
    private String poster;

    @JsonProperty("Plot")
    private String plot;

    @JsonProperty("Director")
    private String director;

    @JsonProperty("Actors")
    private String actors;

    @JsonProperty("Genre")
    private String genre;

    @JsonProperty("Runtime")
    private String runtime;

    @JsonProperty("imdbRating")
    private String imdbRating;

    @JsonProperty("Ratings")
    private List<Rating> ratings;

    @JsonProperty("Response")
    private String response;

    @JsonProperty("Error")
    private String error;

    public static class Rating {
        @JsonProperty("Source")
        private String source;

        @JsonProperty("Value")
        private String value;

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }

    // ------- getters & setters ---------

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getPoster() { return poster; }
    public void setPoster(String poster) { this.poster = poster; }

    public String getPlot() { return plot; }
    public void setPlot(String plot) { this.plot = plot; }

    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }

    public String getActors() { return actors; }
    public void setActors(String actors) { this.actors = actors; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getRuntime() { return runtime; }
    public void setRuntime(String runtime) { this.runtime = runtime; }

    public String getImdbRating() { return imdbRating; }
    public void setImdbRating(String imdbRating) { this.imdbRating = imdbRating; }

    public List<Rating> getRatings() { return ratings; }
    public void setRatings(List<Rating> ratings) { this.ratings = ratings; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
