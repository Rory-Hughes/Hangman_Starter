// Global variable to store our loaded vocabularies
let vocabulariesData = [];

// 1. Fetch data using XMLHttpRequest (fetch is prohibited)
window.onload = function() {
let xhr = new XMLHttpRequest();
xhr.open("GET", "data/vocabularies.json");
xhr.onload = function() {
    if (xhr.status === 200) {
        let data = JSON.parse(xhr.responseText);
        vocabulariesData = data.vocabularies;
        populateCategoryDropdown();
    }
};
xhr.send();

console.log("Script loaded!");

const newGameBtn = document.querySelector('#new-game-btn');
const categoryPanel = document.querySelector('#category-panel');

if (newGameBtn) {
    console.log("New Game button found!");
    newGameBtn.onclick = function() {
        console.log("New Game button clicked!");
        categoryPanel.style.display = 'block'; 
    };
} else {
    console.error("New Game button NOT found. Check your HTML IDs!");
}

// 2. Grab DOM Elements using querySelector (getElementById is prohibited) 
const categorySelect = document.querySelector('#category-select');
const startBtn = document.querySelector('#start-btn');
const wordDisplay = document.querySelector('#word-display');
const lettersContainer = document.querySelector('#letters-container');
const guessesDisplay = document.querySelector('#guesses-display');
const messageDisplay = document.querySelector('#message-display');

// 3. Initialize the Letter Keyboard using innerHTML (createElement/appendChild are prohibited) 
function createLetterButtons() {
    let htmlString = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    // Build the HTML string for all buttons
    for (let i = 0; i < alphabet.length; i++) {
        let letter = alphabet[i];
        htmlString += '<button class="letter-btn" value="' + letter + '">' + letter + '</button>';
    }
    
    // Inject into the container
    lettersContainer.innerHTML = htmlString;
    
    // Attach event listeners to the newly created buttons
    let buttons = document.querySelectorAll('.letter-btn');
    for (let btn of buttons) { 
        btn.onclick = function(event) {
            // Using event.target because 'this' is prohibited 
            let clickedBtn = event.target; 
            let letter = clickedBtn.value;
            handleLetterGuess(letter, clickedBtn);
        };
    }
}

// 4. Populate Category Dropdown using innerHTML
function populateCategoryDropdown() {
    let optionsHTML = "";
    for (let category of vocabulariesData) {
        optionsHTML += '<option value="' + category.categoryName + '">' + category.categoryName.toUpperCase() + '</option>';
    }
    categorySelect.innerHTML = optionsHTML;
}

// 5. Event Listeners for Game Flow
newGameBtn.onclick = function() {
    categoryPanel.style.display = 'block'; 
};

startBtn.onclick = function() {
    // Hide panel and disable new game button
    categoryPanel.style.display = 'none';
    newGameBtn.disabled = true;
    messageDisplay.innerHTML = ''; 

    // Get selected category words
    let selectedCategoryName = categorySelect.value;
    let wordsArray = [];

    // Find the correct category using for...of (array.find/filter are prohibited) 
    for (let category of vocabulariesData) { 
        if (category.categoryName === selectedCategoryName) { 
            wordsArray = category.words;
            break; 
        }
    }

    // Choose a random word
    let randomIndex = Math.floor(Math.random() * wordsArray.length);
    let randomWord = wordsArray[randomIndex];

    // Initialize GameController
    window.GameController.newGame(randomWord);

    // Reset UI for a fresh game
    createLetterButtons(); 
    updateUI();
};

// 6. Handle a Letter Guess
function handleLetterGuess(letter, buttonElement) {
    // Disable the clicked button visually and functionally
    buttonElement.disabled = true;

    // Send the letter to the controller
    window.GameController.processLetter(letter);

    // Sync the screen with the new game state
    updateUI();
}

// 7. Sync UI with GameController State
function updateUI() {
    let report = window.GameController.report();

    // Update the word blanks 
    wordDisplay.innerHTML = report.guess.join(' '); 

    // Update remaining guesses 
    guessesDisplay.innerHTML = report.guessesRemaining; 

    // Check for win/loss conditions
    if (report.gameState === "GAME_OVER_WIN") {
        messageDisplay.innerHTML = "You Won!";
        endGame();
    } else if (report.gameState === "GAME_OVER_LOSE") {
        messageDisplay.innerHTML = "Game Over! The word was " + report.word;
        endGame();
    }
}

// 8. Handle Game Over state
function endGame() {
    newGameBtn.disabled = false; 
    
    // Disable all letter buttons using querySelectorAll and for...of (forEach is prohibited) [cite: 117, 125]
    let allLetterBtns = document.querySelectorAll('.letter-btn');
    for (let btn of allLetterBtns) {
        btn.disabled = true;
    }
}

// Initial setup call
createLetterButtons();

}