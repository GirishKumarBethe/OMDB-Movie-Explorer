# 🎬 OMDB Movie Explorer

A full-stack movie search application built for FinFactor Technologies' coding challenge.
The app allows users to search movies/series using the OMDB API, view details, sort results, mark favorites, toggle dark/light mode, use keyboard navigation, and track recently viewed movies.

## 🚀 Features

### 🔎 Movie Search
- Search movies/series from OMDB using title
- Pagination support
- Error handling & loading states

### ⭐ Favorites System
- Global favorites list with localStorage persistence
- Filter favorites mode

### 🔄 Sorting Options
- Title (A→Z, Z→A)
- Year (Newest first, Oldest first)

### 🌓 Dark/Light Theme
- User-selectable theme saved in localStorage

### ⌨️ Keyboard Navigation
- → Next page
- ← Previous page
- ESC Close details panel

### 🕒 Recently Viewed
- Stores last 8 viewed movies
- Quick navigation
- Persistent

### 🎥 Movie Details Panel
- Poster, plot, director, cast, runtime
- IMDb rating bar visualization
- “Watch Trailer” button

### 🧽 Clear Search
- Reset UI quickly

---

## 🛠️ Tech Stack

### Backend
- Java 17+
- Spring Boot
- RestTemplate
- Environment-based OMDB API key

### Frontend
- React + TypeScript
- Vite
- Custom CSS
- LocalStorage

---

## 📁 Project Structure

```
OMDB-Movie-Explorer/
│
├── backend/
│   ├── src/main/
│   └── pom.xml
│
└── frontend/
    ├── src/
    └── package.json
```

---

## ⚙️ Running the Project

### Backend
1. Open backend in IntelliJ.
2. Add environment variable:

```
OMDB_API_KEY=YOUR_KEY
```

3. Run with IntelliJ or:

```
mvn spring-boot:run
```

Backend runs at:

```
http://localhost:9090
```

### Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## ✔️ Enhancements Completed

- Pagination  
- Global favorites  
- Sorting  
- Dark/light mode  
- Recently viewed  
- Keyboard shortcuts  
- Trailer button  
- Rating bar  
- Clear button  
- Better empty state  
- Polished UI  

---

## 👨‍💻 Author
Girishkumar Bethe
girishkumarbethe2@gmail.com
https://www.linkedin.com/in/girish-kumar-bethe-14097b1a1/
