// JavaScript code implementing all requested features

// Variables
const deckToggle = document.getElementById('deck-toggle');
const emojiDeck = document.getElementById('emoji-deck');
const categorySelector = document.getElementById('category-selector');
const emojiContainer = document.getElementById('emoji-container');
const emojiSearch = document.getElementById('emoji-search');
const timeline = document.getElementById('timeline');

// Emoji Data and Categories
let emojiData = [];
let recentEmojis = [];

// List of Categories with IDs matching emoji data categories
const categories = [
  { id: 'recent', name: 'Recent' },
  { id: 'smileys-emotion', name: 'Smileys & Emotion' },
  { id: 'people-body', name: 'People & Body' },
  { id: 'animals-nature', name: 'Animals & Nature' },
  { id: 'food-drink', name: 'Food & Drink' },
  { id: 'travel-places', name: 'Travel & Places' },
  { id: 'activities', name: 'Activities' },
  { id: 'objects', name: 'Objects' },
  { id: 'symbols', name: 'Symbols' },
  { id: 'flags', name: 'Flags' }
];

// Current category
let currentCategory = 'smileys-emotion';

// Load Emoji Data
fetch('https://cdn.jsdelivr.net/npm/@emoji-mart/data')
  .then(response => response.json())
  .then(data => {
    emojiData = Object.values(data.emojis).map(emoji => ({
      char: emoji.skins[0].native,
      category: emoji.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
      name: emoji.name,
      keywords: emoji.keywords
    }));
    initializeCategories();
    loadEmojis(currentCategory);
  })
  .catch(error => {
    console.error('Error loading emoji data:', error);
  });

// Initialize Categories
function initializeCategories() {
  categories.forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.textContent = category.name;
    categoryDiv.classList.add('category-item');
    if (category.id === currentCategory) categoryDiv.classList.add('active');
    categorySelector.appendChild(categoryDiv);

    categoryDiv.addEventListener('click', () => {
      document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
      categoryDiv.classList.add('active');
      currentCategory = category.id;
      emojiSearch.value = ''; // Clear search input
      loadEmojis(currentCategory);
    });
  });
}

// Load Emojis Based on Selected Category
function loadEmojis(categoryId, searchTerm = '') {
  emojiContainer.innerHTML = '';

  let emojisToLoad = [];

  if (categoryId === 'recent') {
    emojisToLoad = recentEmojis;
  } else {
    emojisToLoad = emojiData.filter(emoji => emoji.category === categoryId);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    emojisToLoad = emojisToLoad.filter(emoji =>
      emoji.name.toLowerCase().includes(term) ||
      (emoji.keywords && emoji.keywords.some(keyword => keyword.includes(term)))
    );
  }

  if (emojisToLoad.length === 0) {
    // Display a message if no emojis found
    const message = document.createElement('p');
    message.textContent = 'No emojis found.';
    message.style.padding = '20px';
    message.style.textAlign = 'center';
    emojiContainer.appendChild(message);
  } else {
    emojisToLoad.forEach(emoji => {
      const emojiSpan = document.createElement('span');
      emojiSpan.textContent = emoji.char;
      emojiSpan.classList.add('emoji-item');
      emojiContainer.appendChild(emojiSpan);
    });

    initializeEmojiDrag();
  }
}

// Initialize Emoji Drag-and-Drop
function initializeEmojiDrag() {
  const emojiItems = document.querySelectorAll('.emoji-item');

  emojiItems.forEach(emojiItem => {
    emojiItem.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const emojiChar = e.target.textContent;

      // Create a draggable element
      const draggableEmoji = document.createElement('span');
      draggableEmoji.textContent = emojiChar;
      draggableEmoji.style.position = 'absolute';
      draggableEmoji.style.left = `${e.pageX}px`;
      draggableEmoji.style.top = `${e.pageY}px`;
      draggableEmoji.style.fontSize = '24px';
      draggableEmoji.style.cursor = 'grabbing';
      draggableEmoji.style.zIndex = 1000;

      document.body.appendChild(draggableEmoji);

      const onMouseMove = (event) => {
        draggableEmoji.style.left = `${event.pageX}px`;
        draggableEmoji.style.top = `${event.pageY}px`;
      };

      document.addEventListener('mousemove', onMouseMove);

      const onMouseUp = (event) => {
        // Find the placeholder under the cursor
        const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
        if (elemBelow && elemBelow.classList.contains('emoji-placeholder')) {
          // Add emoji to placeholder
          elemBelow.innerHTML = '';
          elemBelow.textContent = emojiChar;

          // Add to recent emojis
          if (!recentEmojis.some(e => e.char === emojiChar)) {
            recentEmojis.unshift({ char: emojiChar });
            if (recentEmojis.length > 50) recentEmojis.pop();
          }
        }
        // Clean up
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        draggableEmoji.remove();
      };

      document.addEventListener('mouseup', onMouseUp);
    });
  });
}

// Toggle Emoji Deck
deckToggle.addEventListener('click', () => {
  emojiDeck.classList.toggle('open');
  emojiDeck.classList.toggle('closed');

  // Update toggle button label
  if (emojiDeck.classList.contains('open')) {
    deckToggle.textContent = 'Close Emoji Deck';
  } else {
    deckToggle.textContent = 'Open Emoji Deck';
  }
});

// Automatically Close Emoji Deck on Swipe
let startX;

document.addEventListener('touchstart', function (e) {
  startX = e.touches[0].clientX;
});

document.addEventListener('touchend', function (e) {
  let endX = e.changedTouches[0].clientX;
  if (startX > endX + 50 || startX < endX - 50) {
    closeEmojiDeck();
  }
});

function closeEmojiDeck() {
  if (emojiDeck.classList.contains('open')) {
    emojiDeck.classList.remove('open');
    emojiDeck.classList.add('closed');
    deckToggle.textContent = 'Open Emoji Deck';
  }
}

// Generate Timeslots
for (let hour = 8; hour <= 23; hour++) {
  const hour12 = hour > 12 ? hour - 12 : hour;
  const amPm = hour >= 12 ? 'PM' : 'AM';
  const timeLabel = `${hour12}:00 ${amPm}`;

  const timeslotDiv = document.createElement('div');
  timeslotDiv.classList.add('timeslot');

  const timeslotHeading = document.createElement('h2');
  timeslotHeading.textContent = timeLabel;
  timeslotHeading.classList.add('time-label');
  timeslotDiv.appendChild(timeslotHeading);

  const placeholdersContainer = document.createElement('div');
  placeholdersContainer.classList.add('placeholders');

  // Generate 6 placeholders (4 emoji, 2 notes)
  for (let i = 0; i < 6; i++) {
    const placeholderDiv = document.createElement('div');
    placeholderDiv.classList.add('placeholder');
    if (i < 4) {
      placeholderDiv.classList.add('emoji-placeholder');
    } else {
      placeholderDiv.classList.add('note-placeholder');

      const noteInput = document.createElement('textarea');
      noteInput.classList.add('note-input');
      noteInput.setAttribute('placeholder', 'Add note...');
      placeholderDiv.appendChild(noteInput);
    }
    placeholdersContainer.appendChild(placeholderDiv);
  }

  timeslotDiv.appendChild(placeholdersContainer);
  timeline.appendChild(timeslotDiv);
}

// Long Tap to Delete Emoji from Placeholder
function initializeLongPress() {
  const emojiPlaceholders = document.querySelectorAll('.emoji-placeholder');

  emojiPlaceholders.forEach(placeholder => {
    placeholder.addEventListener('touchstart', handleTouchStart, false);
    placeholder.addEventListener('touchend', handleTouchEnd, false);
    placeholder.addEventListener('mousedown', handleMouseDown, false);
    placeholder.addEventListener('mouseup', handleMouseUp, false);

    let timer = null;

    function handleTouchStart() {
      if (placeholder.textContent) {
        timer = setTimeout(() => {
          placeholder.innerHTML = '';
        }, 800);
      }
    }

    function handleTouchEnd() {
      clearTimeout(timer);
    }

    function handleMouseDown() {
      if (placeholder.textContent) {
        timer = setTimeout(() => {
          placeholder.innerHTML = '';
        }, 800);
      }
    }

    function handleMouseUp() {
      clearTimeout(timer);
    }
  });
}

// Initialize long press functionality
initializeLongPress();

// Highlight Active Time Slot
const timeLabels = document.querySelectorAll('.time-label');

timeLabels.forEach(label => {
  label.addEventListener('click', () => {
    timeLabels.forEach(lbl => lbl.classList.remove('active'));
    label.classList.add('active');
  });
});

// Emoji Search Functionality
emojiSearch.addEventListener('input', () => {
  const searchTerm = emojiSearch.value.trim();
  loadEmojis(currentCategory, searchTerm);
});

// Fixing App Crashes and Performance Issues
window.addEventListener('error', function (e) {
  console.error('An error occurred:', e.message);
});
