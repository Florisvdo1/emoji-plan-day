// Data for emojis
const emojiData = {
    smileys: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😇','🙂','🙃','😌','😍','😘','😗','😙','😚','😋','😜'],
    activities: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥅','🏒','🥊','🎳','🏹','🥋','🏆','🏅','🎽','🥌'],
    food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥒']
};

let draggedEmoji = null;
let draggedEmojiClone = null;
let currentDroppable = null;
let autoScrollInterval = null;

// Generate the timeslots in the timeline
function generateTimeslots() {
    const timeline = document.getElementById('timeline');
    for (let hour = 8; hour <= 23; hour++) {
        const hour12 = hour > 12 ? hour - 12 : hour;
        const amPm = hour >= 12 ? 'PM' : 'AM';
        const timeLabel = `${hour12}:00 ${amPm}`;

        const timeslotDiv = document.createElement('div');
        timeslotDiv.classList.add('timeslot');

        const timeslotHeader = document.createElement('div');
        timeslotHeader.classList.add('timeslot-header');
        timeslotHeader.textContent = timeLabel;

        const emojiPlaceholdersDiv = document.createElement('div');
        emojiPlaceholdersDiv.classList.add('emoji-placeholders');

        for (let i = 0; i < 4; i++) {
            const emojiPlaceholder = document.createElement('div');
            emojiPlaceholder.classList.add('emoji-placeholder');
            emojiPlaceholdersDiv.appendChild(emojiPlaceholder);
        }

        const notePlaceholder = document.createElement('div');
        notePlaceholder.classList.add('note-placeholder');

        const noteInput = document.createElement('textarea');
        noteInput.classList.add('note-input');
        noteInput.setAttribute('placeholder', 'Add note...');

        notePlaceholder.appendChild(noteInput);

        timeslotDiv.appendChild(timeslotHeader);
        timeslotDiv.appendChild(emojiPlaceholdersDiv);
        timeslotDiv.appendChild(notePlaceholder);

        timeline.appendChild(timeslotDiv);
    }
}

// Load emojis into the emoji grid
function loadEmojis(category) {
    const emojiGrid = document.getElementById('emoji-grid');
    emojiGrid.innerHTML = '';
    const emojis = emojiData[category];
    emojis.forEach(emojiChar => {
        const emojiItem = document.createElement('div');
        emojiItem.classList.add('emoji-item');
        emojiItem.textContent = emojiChar;

        // Touch event listeners for drag-and-drop
        emojiItem.addEventListener('touchstart', handleDragStart, false);
        emojiItem.addEventListener('touchmove', handleDragMove, false);
        emojiItem.addEventListener('touchend', handleDragEnd, false);

        emojiGrid.appendChild(emojiItem);
    });
}

// Handle the drag start event
function handleDragStart(e) {
    e.preventDefault();
    e.stopPropagation();
    draggedEmoji = e.target;
    draggedEmojiClone = draggedEmoji.cloneNode(true);
    draggedEmojiClone.classList.add('dragging-clone');
    document.body.appendChild(draggedEmojiClone);

    // Position the clone at the touch point
    const touch = e.touches[0];
    updateDraggedEmojiPosition(touch);
}

// Handle the drag move event
function handleDragMove(e) {
    if (!draggedEmojiClone) return;

    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    updateDraggedEmojiPosition(touch);

    // Auto-scroll functionality
    const viewportHeight = window.innerHeight;
    const scrollThreshold = 50; // Distance from the edge to start scrolling

    if (touch.clientY < scrollThreshold) {
        // Scroll up
        startAutoScroll('up');
    } else if (touch.clientY > viewportHeight - scrollThreshold) {
        // Scroll down
        startAutoScroll('down');
    } else {
        // Stop scrolling
        stopAutoScroll();
    }

    // Get the element under the touch point
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementBelow) return;

    const droppableBelow = elementBelow.closest('.emoji-placeholder');

    if (currentDroppable !== droppableBelow) {
        if (currentDroppable) {
            currentDroppable.classList.remove('highlight');
        }
        currentDroppable = droppableBelow;
        if (currentDroppable) {
            currentDroppable.classList.add('highlight');
        }
    }
}

// Handle the drag end event
function handleDragEnd(e) {
    if (!draggedEmojiClone) return;

    e.preventDefault();
    e.stopPropagation();
    draggedEmojiClone.remove();
    draggedEmojiClone = null;

    // Stop any ongoing auto-scroll
    stopAutoScroll();

    if (currentDroppable) {
        currentDroppable.textContent = draggedEmoji.textContent;
        currentDroppable.classList.remove('highlight');
    }

    draggedEmoji = null;
    currentDroppable = null;
}

// Update the position of the dragged emoji clone
function updateDraggedEmojiPosition(touch) {
    // Adjust for scroll position
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Set the position of the clone
    draggedEmojiClone.style.left = `${touch.clientX + scrollLeft}px`;
    draggedEmojiClone.style.top = `${touch.clientY + scrollTop}px`;
}

// Auto-scroll functions
function startAutoScroll(direction) {
    if (autoScrollInterval) return; // Already scrolling

    autoScrollInterval = setInterval(() => {
        const scrollAmount = 20; // Adjust scroll speed here
        if (direction === 'up') {
            window.scrollBy(0, -scrollAmount);
        } else if (direction === 'down') {
            window.scrollBy(0, scrollAmount);
        }
    }, 16); // Approximately 60fps
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

// Initialize the app
function init() {
    generateTimeslots();

    // Load default emoji category
    loadEmojis('smileys');

    // Tab buttons for changing emoji categories
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked tab
            button.classList.add('active');
            // Load emojis for selected category
            const category = button.getAttribute('data-category');
            loadEmojis(category);
        });
    });

    // Update live time in the header
    updateLiveTime();
    setInterval(updateLiveTime, 1000);
}

// Function to update the live time in the header
function updateLiveTime() {
    const liveTimeElement = document.getElementById('live-time');
    const now = new Date();
    liveTimeElement.textContent = now.toLocaleTimeString();
}

init();
