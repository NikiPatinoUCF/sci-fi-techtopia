# TechTopia - Sci-Fi Book Tracker

A web-based book tracking application for science fiction and dystopian literature enthusiasts. Track your reading journey, rate books, and receive personalized recommendations based on your preferences.

## Features

### Book Database
- **102 curated books** spanning classic and modern sci-fi/dystopian literature
- Diverse authors from multiple languages and cultures
- Books tagged with:
  - Genres and subgenres
  - Themes
  - Writing styles
  - Publication years
  - Original language

### Reading Tracking
- **Rating System**: Rate books 1-5 stars
- **Reading Status**: Mark books as "Not Yet Read"
- **Local Storage**: All data stored in your browser (no accounts needed)
- **Privacy First**: Your reading data never leaves your device

### Smart Recommendations
- **Top 3 Recommendations**: Based on your highly-rated books' themes, genres, and subgenres
- **"One Shelf Over"**: Discover books with similar writing styles but different genres
- **Minimum 3 ratings** required to activate recommendation engine

### Statistics Dashboard
- Total books read
- Average rating
- Genres explored
- Languages read
- Favorite themes visualization
- Reading timeline by era

### Advanced Filtering
- Search by title, author, or theme
- Filter by genre
- Filter by language
- Filter by reading status (read/unread)

## How to Use

### Local Development
1. Clone the repository
2. Open `index.html` in a web browser, or
3. Run a local server:
   ```bash
   python3 -m http.server 8000
   # Visit http://localhost:8000
   ```

### GitHub Pages Deployment
This site is optimized for GitHub Pages:

1. Push to your GitHub repository
2. Go to Settings > Pages
3. Set Source to: Deploy from branch
4. Select branch: `main` (or your preferred branch)
5. Select folder: `/ (root)`
6. Click Save

Your site will be available at: `https://[username].github.io/[repo-name]/`

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox
- **Vanilla JavaScript**: No frameworks required
- **Local Storage API**: Client-side data persistence

## File Structure

```
.
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── app.js              # JavaScript logic and recommendation engine
├── sci-fi-books.json   # Database of 102 books
└── README.md           # This file
```

## Recommendation Algorithm

### Top 3 Recommendations
The algorithm analyzes your highly-rated books (4-5 stars) and:
1. Identifies your favorite themes (weighted most heavily)
2. Recognizes preferred genres
3. Considers subgenre preferences
4. Scores unrated books based on theme/genre overlap
5. Returns top matches you haven't read yet

### "One Shelf Over" Recommendation
This feature finds books that:
1. Match your preferred writing styles
2. Come from different genres than you typically read
3. Provide a "surprise discovery" based on style similarity

Example: If you love cyberpunk with "dense, noir-ish" styles, you might get a literary mystery with similar descriptive language.

## Browser Compatibility

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Opera: 76+

## Data Privacy

All user data is stored locally in your browser using `localStorage`. No data is sent to any server or third party. To reset your data, use the "Reset All Reading Data" button in the Reading Stats tab.

## Contributing

Feel free to suggest additional books or improvements by opening an issue or pull request!

## Book Selection Criteria

Books included in the database span:
- **Time Period**: 1895-2021 (125+ years)
- **Languages**: English, Chinese, Russian, Polish, Japanese, Portuguese, Spanish, Korean, German, French, Italian, Swedish, Czech, and more
- **Genres**: Dystopian, Cyberpunk, Space Opera, Climate Fiction, Biopunk, Post-apocalyptic, and many others
- **Notable Authors**: Ursula K. Le Guin, Philip K. Dick, William Gibson, Octavia Butler, N.K. Jemisin, Liu Cixin, Stanisław Lem, Margaret Atwood, and more

## License

This project is open source and available for educational and personal use.

## Acknowledgments

Built with appreciation for the incredible diversity of science fiction and dystopian literature across cultures and time periods.

---

**AI Humanities II Project**
