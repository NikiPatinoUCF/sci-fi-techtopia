// ==================== Global State ====================
let allBooks = [];
let userData = {
    ratings: {}, // { bookId: rating (1-5) }
    unread: []   // [bookId, ...]
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
    await loadBooks();
    loadUserData();
    initializeFilters();
    initializeTabs();
    renderBooks();
    updateStats();
});

// ==================== Load Books from JSON ====================
async function loadBooks() {
    try {
        const response = await fetch('sci-fi-books.json');
        const data = await response.json();
        allBooks = data.books;
        console.log(`Loaded ${allBooks.length} books`);
    } catch (error) {
        console.error('Error loading books:', error);
        document.getElementById('books-grid').innerHTML =
            '<p style="color: var(--danger); text-align: center;">Error loading books. Please refresh the page.</p>';
    }
}

// ==================== Local Storage ====================
function loadUserData() {
    const savedData = localStorage.getItem('techtopia-user-data');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
}

function saveUserData() {
    localStorage.setItem('techtopia-user-data', JSON.stringify(userData));
    updateStats();
}

function resetUserData() {
    if (confirm('Are you sure you want to reset all your reading data? This cannot be undone.')) {
        localStorage.removeItem('techtopia-user-data');
        userData = { ratings: {}, unread: [] };
        renderBooks();
        updateStats();
        showRecommendations();
        alert('All reading data has been reset.');
    }
}

// ==================== Tab Navigation ====================
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load specific tab content
    if (tabName === 'recommendations') {
        showRecommendations();
    } else if (tabName === 'stats') {
        updateStats();
    }
}

// ==================== Filters ====================
function initializeFilters() {
    // Populate genre filter
    const genres = [...new Set(allBooks.map(book => book.genre))].sort();
    const genreFilter = document.getElementById('genre-filter');
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });

    // Populate language filter
    const languages = [...new Set(allBooks.map(book => book.language))].sort();
    const languageFilter = document.getElementById('language-filter');
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageFilter.appendChild(option);
    });

    // Add event listeners
    document.getElementById('search-input').addEventListener('input', renderBooks);
    document.getElementById('genre-filter').addEventListener('change', renderBooks);
    document.getElementById('language-filter').addEventListener('change', renderBooks);
    document.getElementById('status-filter').addEventListener('change', renderBooks);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    document.getElementById('reset-data').addEventListener('click', resetUserData);
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('genre-filter').value = '';
    document.getElementById('language-filter').value = '';
    document.getElementById('status-filter').value = '';
    renderBooks();
}

function getFilteredBooks() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const genreFilter = document.getElementById('genre-filter').value;
    const languageFilter = document.getElementById('language-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    return allBooks.filter(book => {
        // Search filter
        const matchesSearch = searchTerm === '' ||
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.themes.some(theme => theme.toLowerCase().includes(searchTerm));

        // Genre filter
        const matchesGenre = !genreFilter || book.genre === genreFilter;

        // Language filter
        const matchesLanguage = !languageFilter || book.language === languageFilter;

        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'read') {
            matchesStatus = userData.ratings[book.id] !== undefined;
        } else if (statusFilter === 'unread') {
            matchesStatus = userData.ratings[book.id] === undefined;
        }

        return matchesSearch && matchesGenre && matchesLanguage && matchesStatus;
    });
}

// ==================== Render Books ====================
function renderBooks() {
    const filteredBooks = getFilteredBooks();
    const booksGrid = document.getElementById('books-grid');

    // Update counts
    document.getElementById('books-shown').textContent = filteredBooks.length;
    document.getElementById('books-total').textContent = allBooks.length;

    if (filteredBooks.length === 0) {
        booksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No books found matching your filters.</p>';
        return;
    }

    booksGrid.innerHTML = filteredBooks.map(book => createBookCard(book)).join('');

    // Add event listeners for ratings
    attachRatingListeners();
}

function createBookCard(book) {
    const isRead = userData.ratings[book.id] !== undefined;
    const rating = userData.ratings[book.id] || 0;
    const isUnread = userData.unread.includes(book.id);

    return `
        <div class="book-card ${isRead ? 'read' : ''}" data-book-id="${book.id}">
            <div class="book-header">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
            </div>

            <div class="book-meta">
                <span class="meta-tag book-genre">${book.genre}</span>
                <span class="meta-tag">${book.year}</span>
                <span class="meta-tag">${book.language}</span>
            </div>

            <div class="book-themes">
                ${book.themes.slice(0, 4).map(theme =>
                    `<span class="theme-tag">${theme}</span>`
                ).join('')}
            </div>

            <p class="book-style">${book.writing_style}</p>

            <div class="rating-section">
                <p class="rating-label">Your Rating:</p>
                <div class="stars" data-book-id="${book.id}">
                    ${[1, 2, 3, 4, 5].map(star =>
                        `<span class="star ${star <= rating ? 'active' : ''}" data-rating="${star}">★</span>`
                    ).join('')}
                </div>
                <button class="unread-btn ${isUnread ? 'active' : ''}" data-book-id="${book.id}">
                    ${isUnread ? '✓ Not Yet Read' : 'Mark as Not Yet Read'}
                </button>
            </div>
        </div>
    `;
}

// ==================== Rating System ====================
function attachRatingListeners() {
    // Star ratings
    document.querySelectorAll('.stars').forEach(starsContainer => {
        const bookId = parseInt(starsContainer.dataset.bookId);
        const stars = starsContainer.querySelectorAll('.star');

        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                e.stopPropagation();
                const rating = parseInt(star.dataset.rating);
                setRating(bookId, rating);
            });
        });
    });

    // Unread buttons
    document.querySelectorAll('.unread-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const bookId = parseInt(btn.dataset.bookId);
            toggleUnread(bookId);
        });
    });
}

function setRating(bookId, rating) {
    // If clicking the same rating, remove it
    if (userData.ratings[bookId] === rating) {
        delete userData.ratings[bookId];
    } else {
        userData.ratings[bookId] = rating;
    }

    // Remove from unread if rating is set
    if (userData.ratings[bookId]) {
        userData.unread = userData.unread.filter(id => id !== bookId);
    }

    saveUserData();
    renderBooks();
}

function toggleUnread(bookId) {
    const index = userData.unread.indexOf(bookId);

    if (index === -1) {
        userData.unread.push(bookId);
        // Remove rating if marking as unread
        delete userData.ratings[bookId];
    } else {
        userData.unread.splice(index, 1);
    }

    saveUserData();
    renderBooks();
}

// ==================== Recommendation Engine ====================
function showRecommendations() {
    const ratedBooks = Object.keys(userData.ratings).map(id => parseInt(id));

    if (ratedBooks.length < 3) {
        document.getElementById('recommendations-content').innerHTML = `
            <div class="no-recommendations">
                <p>📖 Start rating some books to get personalized recommendations!</p>
                <p>Rate at least 3 books to unlock your recommendation engine.</p>
                <p>Currently rated: ${ratedBooks.length}/3</p>
            </div>
        `;
        document.getElementById('top-recommendations').style.display = 'none';
        return;
    }

    document.getElementById('recommendations-content').innerHTML = '';
    document.getElementById('top-recommendations').style.display = 'block';

    const recommendations = generateRecommendations();
    const shelfOverRec = generateShelfOverRecommendation();

    // Render top 3 recommendations
    const topRecsGrid = document.getElementById('top-recs-grid');
    topRecsGrid.innerHTML = recommendations.slice(0, 3).map(rec => createRecommendationCard(rec)).join('');

    // Render shelf over recommendation
    const shelfOverGrid = document.getElementById('shelf-over-rec');
    if (shelfOverRec) {
        shelfOverGrid.innerHTML = createRecommendationCard(shelfOverRec, true);
    } else {
        shelfOverGrid.innerHTML = '<p style="color: var(--text-muted);">No writing style match found.</p>';
    }
}

function generateRecommendations() {
    const ratedBooks = Object.entries(userData.ratings)
        .filter(([id, rating]) => rating >= 4) // Only consider highly rated books
        .map(([id]) => parseInt(id));

    if (ratedBooks.length === 0) {
        // If no highly rated books, use all rated books
        return [];
    }

    // Get themes and genres from highly rated books
    const likedThemes = {};
    const likedGenres = {};
    const likedSubgenres = {};

    ratedBooks.forEach(bookId => {
        const book = allBooks.find(b => b.id === bookId);
        if (!book) return;

        book.themes.forEach(theme => {
            likedThemes[theme] = (likedThemes[theme] || 0) + userData.ratings[bookId];
        });

        likedGenres[book.genre] = (likedGenres[book.genre] || 0) + userData.ratings[bookId];

        book.subgenres.forEach(subgenre => {
            likedSubgenres[subgenre] = (likedSubgenres[subgenre] || 0) + userData.ratings[bookId];
        });
    });

    // Score unrated books
    const unratedBooks = allBooks.filter(book => !userData.ratings[book.id]);

    const scoredBooks = unratedBooks.map(book => {
        let score = 0;

        // Theme matching (most important)
        book.themes.forEach(theme => {
            if (likedThemes[theme]) {
                score += likedThemes[theme] * 3;
            }
        });

        // Genre matching
        if (likedGenres[book.genre]) {
            score += likedGenres[book.genre] * 2;
        }

        // Subgenre matching
        book.subgenres.forEach(subgenre => {
            if (likedSubgenres[subgenre]) {
                score += likedSubgenres[subgenre] * 1.5;
            }
        });

        return { book, score };
    });

    // Sort by score and return top recommendations
    return scoredBooks
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
}

function generateShelfOverRecommendation() {
    const ratedBooks = Object.entries(userData.ratings)
        .filter(([id, rating]) => rating >= 4)
        .map(([id]) => parseInt(id));

    if (ratedBooks.length === 0) return null;

    // Get writing styles from highly rated books
    const likedStyles = ratedBooks.map(bookId => {
        const book = allBooks.find(b => b.id === bookId);
        return book ? book.writing_style : '';
    }).filter(style => style);

    if (likedStyles.length === 0) return null;

    // Find books with similar writing styles but different themes
    const unratedBooks = allBooks.filter(book => !userData.ratings[book.id]);

    const scoredBooks = unratedBooks.map(book => {
        let score = 0;

        // Calculate style similarity
        likedStyles.forEach(likedStyle => {
            const likedWords = likedStyle.toLowerCase().split(/[,\s]+/);
            const bookWords = book.writing_style.toLowerCase().split(/[,\s]+/);

            const commonWords = likedWords.filter(word => bookWords.includes(word));
            score += commonWords.length * 2;
        });

        // Slight penalty for same genre (we want different but similar style)
        const likedGenres = ratedBooks.map(id => {
            const b = allBooks.find(book => book.id === id);
            return b ? b.genre : '';
        });

        if (!likedGenres.includes(book.genre)) {
            score += 1; // Bonus for different genre
        }

        return { book, score };
    });

    const topMatch = scoredBooks
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)[0];

    return topMatch || null;
}

function createRecommendationCard(rec, isShelfOver = false) {
    const book = rec.book;
    const matchScore = Math.min(Math.round((rec.score / 20) * 100), 100); // Normalize to percentage

    return `
        <div class="rec-card">
            <div class="match-score">${matchScore}% Match${isShelfOver ? ' (Style)' : ''}</div>
            <div class="book-header">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
            </div>

            <div class="book-meta">
                <span class="meta-tag book-genre">${book.genre}</span>
                <span class="meta-tag">${book.year}</span>
                <span class="meta-tag">${book.language}</span>
            </div>

            <div class="book-themes">
                ${book.themes.slice(0, 4).map(theme =>
                    `<span class="theme-tag">${theme}</span>`
                ).join('')}
            </div>

            <p class="book-style">${book.writing_style}</p>

            ${isShelfOver ? '<p style="color: var(--secondary-color); font-size: 0.9rem; margin-top: 0.5rem;">A writing style match from a different genre!</p>' : ''}
        </div>
    `;
}

// ==================== Statistics ====================
function updateStats() {
    const ratedBooks = Object.keys(userData.ratings);
    const booksReadCount = ratedBooks.length;

    // Average rating
    const avgRating = booksReadCount > 0
        ? (Object.values(userData.ratings).reduce((a, b) => a + b, 0) / booksReadCount).toFixed(1)
        : 0;

    // Genres explored
    const genresExplored = new Set(
        ratedBooks.map(id => {
            const book = allBooks.find(b => b.id === parseInt(id));
            return book ? book.genre : null;
        }).filter(g => g)
    ).size;

    // Languages read
    const languagesRead = new Set(
        ratedBooks.map(id => {
            const book = allBooks.find(b => b.id === parseInt(id));
            return book ? book.language : null;
        }).filter(l => l)
    ).size;

    // Update DOM
    document.getElementById('books-read-count').textContent = booksReadCount;
    document.getElementById('avg-rating').textContent = avgRating;
    document.getElementById('genres-explored').textContent = genresExplored;
    document.getElementById('languages-read').textContent = languagesRead;

    // Update favorite themes
    updateFavoriteThemes();

    // Update reading timeline
    updateReadingTimeline();
}

function updateFavoriteThemes() {
    const themesChart = document.getElementById('themes-chart');
    const ratedBooks = Object.entries(userData.ratings);

    if (ratedBooks.length === 0) {
        themesChart.innerHTML = '<p style="color: var(--text-muted);">No data yet. Start rating books!</p>';
        return;
    }

    // Count themes from rated books, weighted by rating
    const themeCounts = {};
    ratedBooks.forEach(([id, rating]) => {
        const book = allBooks.find(b => b.id === parseInt(id));
        if (!book) return;

        book.themes.forEach(theme => {
            themeCounts[theme] = (themeCounts[theme] || 0) + rating;
        });
    });

    // Get top 5 themes
    const topThemes = Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const maxCount = topThemes[0]?.[1] || 1;

    themesChart.innerHTML = topThemes.map(([theme, count]) => {
        const percentage = (count / maxCount) * 100;
        return `
            <div class="theme-bar">
                <div class="theme-name">${theme}</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%">
                        ${count.toFixed(0)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateReadingTimeline() {
    const eraChart = document.getElementById('era-chart');
    const ratedBooks = Object.entries(userData.ratings);

    if (ratedBooks.length === 0) {
        eraChart.innerHTML = '<p style="color: var(--text-muted);">No data yet. Start rating books!</p>';
        return;
    }

    // Group books by era
    const eras = {
        'Classic (Pre-1960)': 0,
        'Golden Age (1960-1979)': 0,
        'New Wave (1980-1999)': 0,
        'Modern (2000-2019)': 0,
        'Contemporary (2020+)': 0
    };

    ratedBooks.forEach(([id, rating]) => {
        const book = allBooks.find(b => b.id === parseInt(id));
        if (!book) return;

        if (book.year < 1960) {
            eras['Classic (Pre-1960)'] += rating;
        } else if (book.year < 1980) {
            eras['Golden Age (1960-1979)'] += rating;
        } else if (book.year < 2000) {
            eras['New Wave (1980-1999)'] += rating;
        } else if (book.year < 2020) {
            eras['Modern (2000-2019)'] += rating;
        } else {
            eras['Contemporary (2020+)'] += rating;
        }
    });

    const maxCount = Math.max(...Object.values(eras), 1);

    eraChart.innerHTML = Object.entries(eras).map(([era, count]) => {
        const percentage = (count / maxCount) * 100;
        return `
            <div class="era-bar">
                <div class="era-name">${era}</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%">
                        ${count > 0 ? count.toFixed(0) : '0'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
