// Global variable to store loaded vocabularies
let vocabulariesData = [];

// 1. Fetch data and set up initial state
window.onload = function() {
    let xhr = new XMLHttpRequest();
    // Using the relative path to your data folder
    xhr.open("GET", "data/vocabularies.json");
    xhr.onload = function() {
        if (xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            vocabulariesData = data.vocabularies;
            populateCategoryDropdown();
        }
    };
    xhr.send();

    // Attach listener to New Game button
    const newGameBtn = document.querySelector('#new-game-btn');
    newGameBtn.onclick = function() {
        const categoryPanel = document.querySelector('#category-panel');
        categoryPanel.style.display = 'block'; 
    };

    // Attach listener to the OK button in the category panel
    const startBtn = document.querySelector('#start-btn');
    startBtn.onclick = startGame;

    // Initial keyboard setup
    createLetterButtons();
};

// 2. Populate Category Dropdown using innerHTML
function populateCategoryDropdown() {
    const categorySelect = document.querySelector('#category-select');
    let optionsHTML = "";
    for (let category of vocabulariesData) {
        optionsHTML += '<option value="' + category.categoryName + '">' + category.categoryName.toUpperCase() + '</option>';
    }
    categorySelect.innerHTML = optionsHTML;
}

// 3. Initialize the Letter Keyboard
function createLetterButtons() {
    const lettersContainer = document.querySelector('#letters-container');
    let htmlString = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for (let i = 0; i < alphabet.length; i++) {
        let letter = alphabet[i];
        htmlString += '<button class="letter-btn" value="' + letter + '">' + letter + '</button>';
    }
    
    lettersContainer.innerHTML = htmlString;
    
    let buttons = document.querySelectorAll('.letter-btn');
    for (let btn of buttons) { 
        btn.onclick = function(event) {
            // event.target is used because 'this' is prohibited [cite: 247]
            let clickedBtn = event.target; 
            let letter = clickedBtn.value;
            handleLetterGuess(letter, clickedBtn);
        };
    }
}

// 4. Start the Game Logic
function startGame() {
    const categorySelect = document.querySelector('#category-select');
    const categoryPanel = document.querySelector('#category-panel');
    const newGameBtn = document.querySelector('#new-game-btn');
    const currentCategoryDisplay = document.querySelector('#current-category-display');
    const hangmanImg = document.querySelector('#hangman-img');

    // Get selected category
    let selectedCategoryName = categorySelect.value;
    
    // Update the Category Display and hide panel
    currentCategoryDisplay.innerHTML = selectedCategoryName.toUpperCase();
    categoryPanel.style.display = 'none';
    newGameBtn.disabled = true;

    // Reset the Hangman Image to the gallows (0.png) [cite: 177, 197]
    hangmanImg.src = "images/0.png";

    // Find the correct category words array
    let wordsArray = [];
    for (let category of vocabulariesData) { 
        if (category.categoryName === selectedCategoryName) { 
            wordsArray = category.words;
            break; 
        }
    }

    // Choose a random word [cite: 190, 236]
    let randomWord = wordsArray[Math.floor(Math.random() * wordsArray.length)];

    // Initialize GameController [cite: 152, 193]
    window.GameController.newGame(randomWord);

    // Reset UI for the fresh game
    createLetterButtons(); 
    updateUI();
}

// 5. Handle a Letter Guess
function handleLetterGuess(letter, buttonElement) {
    buttonElement.disabled = true; // [cite: 200]
    window.GameController.processLetter(letter); // [cite: 154, 201]
    updateUI(); // [cite: 202]
}

// 6. Sync UI with GameController State
function updateUI() {
    const wordDisplay = document.querySelector('#word-display');
    const guessesDisplay = document.querySelector('#guesses-display');
    const messageDisplay = document.querySelector('#message-display');
    const hangmanImg = document.querySelector('#hangman-img');

    let report = window.GameController.report();

    // Update the word blanks and remaining guesses [cite: 195, 198]
    wordDisplay.innerHTML = report.guess.join(' '); 
    guessesDisplay.innerHTML = report.guessesRemaining; 

    // Update the Hangman Graphic based on incorrect guesses [cite: 177, 206]
    // Max is 6; 6 remaining = image 0, 0 remaining = image 6
    let imageNumber = 6 - report.guessesRemaining; 
    hangmanImg.src = "images/" + imageNumber + ".png";

    // Check for win/loss conditions [cite: 208, 211]
    if (report.gameState === "GAME_OVER_WIN") {
        messageDisplay.innerHTML = "You Won!";
        endGame();
    } else if (report.gameState === "GAME_OVER_LOSE") {
        messageDisplay.innerHTML = "Game Over! The word was " + report.word;
        endGame();
    }
}

// 7. Handle Game Over state
function endGame() {
    const newGameBtn = document.querySelector('#new-game-btn');
    newGameBtn.disabled = false; // [cite: 210]
    
    // Disable all letter buttons using for...of [cite: 209]
    let allLetterBtns = document.querySelectorAll('.letter-btn');
    for (let btn of allLetterBtns) {
        btn.disabled = true;
    }
}