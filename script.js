const form = document.getElementById('book-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
const clearBtn = document.getElementById('clear-btn');
const randomBtn = document.getElementById('random-btn');
const errorMessage = document.getElementById('error-message');
const savedContainer = document.getElementById('saved-books');


//------------ Event Listeners --------------

// Form submit -> Event: submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  clearResults();
  await fetchBooks(query);
});

// Clear button -> Event: click
clearBtn.addEventListener('click', () => {
  clearResults();
  searchInput.value = '';
});

// Surprise Me button -> Event: click
randomBtn.addEventListener('click', async () => {
  clearResults();
  const keywords = ['science', 'magic', 'history', 'art', 'coding', 'nature','pychology','self-help','poetry','fiction','novel','non-fiction','mystery','horror-fiction','fantasy','short story'];
  const randomQuery = keywords[Math.floor(Math.random() * keywords.length)];
  await fetchBooks(randomQuery);
});

//------------- API Fetch Function
async function fetchBooks(query) {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`);
    const data = await response.json();

    if (!data.items || data.totalItems === 0) {
      showError('No books found. Try a different search.');
      return;
    }

    data.items.forEach(book => createBookCard(book.volumeInfo));
  } catch (error) {
    showError('Something went wrong while fetching data.');
    console.error(error);
  }
}

//------------ DOM Manipulation Functions 
function clearResults() {
  resultsContainer.innerHTML = '';
  errorMessage.classList.add('hidden');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

// Create a book card dynamically
function createBookCard(info) {
  const card = document.createElement('div');
  card.className = 'book-card';

  card.innerHTML = `
    <img src="${info.imageLinks?.thumbnail || 'https://via.placeholder.com/150'}" alt="Book cover">
    <h3>${info.title || 'No Title'}</h3>
    <p><strong>Author:</strong> ${info.authors?.join(', ') || 'Unknown'}</p>
    <p><strong>Pages:</strong> ${info.pageCount || 'N/A'}</p>
    <p><strong>Description:</strong> ${info.description ? info.description.slice(0, 300) + '...' : 'No description available.'}</p>
    <button class="save-btn">Add to Shelf</button>
  `;

  // Save button
  card.querySelector('.save-btn').addEventListener('click', () => {
    saveBook(info);
  });

  // Double click to remove the card -> Event: dblclick
  card.addEventListener('dblclick', () => {
    card.remove();
  });

  resultsContainer.appendChild(card);
}

// Save book to localStorage
function saveBook(bookInfo) {
  const saved = JSON.parse(localStorage.getItem('savedBooks')) || [];

  if (saved.some(b => b.title === bookInfo.title && b.authors?.[0] === bookInfo.authors?.[0])) {
    alert('This book is already saved!');
    return;
  }

  saved.push(bookInfo);
  localStorage.setItem('savedBooks', JSON.stringify(saved));
  displaySavedBooks();
}

// Display saved books from localStorage
function displaySavedBooks() {
  savedContainer.innerHTML = '';
  const saved = JSON.parse(localStorage.getItem('savedBooks')) || [];

  saved.forEach(info => {
    const card = document.createElement('div');
    card.className = 'book-card';

    card.innerHTML = `
      <img src="${info.imageLinks?.thumbnail || 'https://via.placeholder.com/150'}" alt="Book cover">
      <h3>${info.title || 'No Title'}</h3>
      <p><strong>Author:</strong> ${info.authors?.join(', ') || 'Unknown'}</p>
      <p><strong>Pages:</strong> ${info.pageCount || 'N/A'}</p>
      <p><strong>Description:</strong> ${info.description ? info.description.slice(0, 100) + '...' : 'No description available.'}</p>
      <button class="remove-saved-btn">Remove from Shelf</button>
    `;

    // Remove from saved list
    card.querySelector('.remove-saved-btn').addEventListener('click', () => {
      removeSavedBook(info);
    });

    savedContainer.appendChild(card);
  });
}

// Remove book from saved list
function removeSavedBook(bookInfo) {
  let saved = JSON.parse(localStorage.getItem('savedBooks')) || [];
  saved = saved.filter(b => !(b.title === bookInfo.title && b.authors?.[0] === bookInfo.authors?.[0]));
  localStorage.setItem('savedBooks', JSON.stringify(saved));
  displaySavedBooks();
}

//---------- to initialize Saved Books on Page Load 
displaySavedBooks();
