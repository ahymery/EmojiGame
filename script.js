// Configuration du jeu
const GAME_CONFIG = {
    totalTime: 30,           // Durée totale du jeu en secondes
    emojiRevealInterval: 5000, // Intervalle de révélation des emojis (5 secondes)
    maxEmojisPerSet: 3,       // Nombre maximum d'emojis par ensemble
    scoringRules: [3, 2, 1]   // Points selon l'ordre de révélation des emojis
};

class EmojiGuessingGame {
    constructor(emojiSets) {
        this.emojiSets = emojiSets;
        this.score = 0;
        this.countdownTime = GAME_CONFIG.totalTime;
        
        // Éléments du DOM
        this.emojiPlace = document.getElementById("emojiDisplay");
        this.countdownDisplay = document.querySelector('.countdown');
        this.guessInput = document.getElementById("guessInput");
        this.submitButton = document.querySelector('.submit_button');
        this.scoreDisplay = document.querySelector('.score');
        
        // Créer un élément pour les messages
        this.messageDisplay = this.createMessageElement();
        this.gameContainer = document.querySelector('.game-container');
        
        this.setupEventListeners();
    }

    createMessageElement() {
        const messageElement = document.createElement('div');
        messageElement.id = 'game-message';
        messageElement.classList.add('game-message');
        this.submitButton.parentNode.insertBefore(messageElement, this.submitButton.nextSibling);
        return messageElement;
    }

    setupEventListeners() {
        this.submitButton.addEventListener('click', () => this.checkAnswer());
        this.guessInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') this.checkAnswer();
        });
    }

    startGame() {
        this.resetGameState();
        this.selectAndDisplayEmojiSet();
        this.startCountdown();
    }

    resetGameState() {
        this.countdownTime = GAME_CONFIG.totalTime;
        this.emojiPlace.innerHTML = '';
        this.submitButton.disabled = false;
        this.guessInput.value = '';
        this.updateScoreDisplay();
        this.clearMessage();
    }

    selectAndDisplayEmojiSet() {
        const randomIndex = Math.floor(Math.random() * this.emojiSets.length);
        const selectedSet = this.emojiSets[randomIndex];
        
        this.currentAnswer = selectedSet.answer.toLowerCase();
        this.emojis = selectedSet.emojis.slice(0, GAME_CONFIG.maxEmojisPerSet);
        this.currentEmojiIndex = 0;

        this.displayEmojisSequentially();
    }

    displayEmojisSequentially() {
        clearInterval(this.emojiInterval);
 // Afficher le premier emoji immédiatement
        this.emojiPlace.innerHTML = this.emojis[0];
        this.currentEmojiIndex = 1;

        this.emojiInterval = setInterval(() => {
            if (this.currentEmojiIndex < this.emojis.length) {
                this.emojiPlace.innerHTML += this.emojis[this.currentEmojiIndex];
                this.currentEmojiIndex++;
            } else {
                clearInterval(this.emojiInterval);
            }
        }, GAME_CONFIG.emojiRevealInterval);
    }

    startCountdown() {
        clearInterval(this.countdownInterval);
        
        this.countdownInterval = setInterval(() => {
            this.countdownTime--;
            this.updateCountdownDisplay();

            if (this.countdownTime <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateCountdownDisplay() {
        this.countdownDisplay.textContent = `Temps restant : ${this.countdownTime} secondes`;
    }

    checkAnswer() {
        const userAnswer = this.guessInput.value.toLowerCase().trim();
        
        if (userAnswer === this.currentAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.showIncorrectAnswerFeedback();
        }
    }

    handleCorrectAnswer() {
        // Attribution des points selon l'index de révélation
        const pointsEarned = GAME_CONFIG.scoringRules[this.currentEmojiIndex - 1] || 1;
        this.score += pointsEarned;
        
        // Message personnalisé pour chaque point
        const pointMessages = [
            "+1 point facile !",
            "+2 points, bien joué !",
            "+3 points, impressionnant !"
        ];
        
        this.updateScoreDisplay();
        this.showMessage(pointMessages[pointsEarned - 1], 'success', 1500);
        this.startGame(); // Recommencer le jeu
    }

    showIncorrectAnswerFeedback() {
        this.showMessage('Mauvaise réponse !', 'error');
    }

    showMessage(message, type = 'info', duration = 2000) {
        // Supprimer toute classe précédente
        this.messageDisplay.classList.remove('info', 'error', 'success');
        
        // Ajouter le nouveau message et le type
        this.messageDisplay.textContent = message;
        this.messageDisplay.classList.add(type);
        
        // Supprimer le message après la durée spécifiée
        setTimeout(() => this.clearMessage(), duration);
    }

    clearMessage() {
        this.messageDisplay.textContent = '';
        this.messageDisplay.classList.remove('info', 'error', 'success');
    }

    updateScoreDisplay() {
        this.scoreDisplay.textContent = `Score : ${this.score}`;
    }

    endGame() {
        clearInterval(this.countdownInterval);
        clearInterval(this.emojiInterval);
        
        this.submitButton.disabled = true;
        this.guessInput.disabled = true;
        
        // Créer un conteneur pour le message de fin de jeu
        const gameOverMessage = `
            <div class="game-over-details">
                <h3>Jeu Terminé !</h3>
                <p>Score final : ${this.score}</p>
                <button id="restart-game">Rejouer</button>
            </div>
        `;
        
        // Afficher le message de fin de jeu
        this.showMessage('Temps écoulé !', 'error', 5000);
        
        // Ajouter le message de fin de jeu à la carte
        const gameOverContainer = document.createElement('div');
        gameOverContainer.classList.add('game-over-container');
        gameOverContainer.innerHTML = gameOverMessage;
        
        // Remplacer le conteneur de jeu par le message de fin
        this.gameContainer.innerHTML = '';
        this.gameContainer.appendChild(gameOverContainer);
        
        // Ajouter un gestionnaire d'événements pour le bouton de redémarrage
        const restartButton = gameOverContainer.querySelector('#restart-game');
        restartButton.addEventListener('click', () => {
            this.score = 0; // Réinitialiser le score
            this.startGame(); // Recommencer le jeu
        });
    }}

// Chargement du jeu
document.addEventListener('DOMContentLoaded', () => {
    fetch('data/emoji-sets.json')
        .then(response => response.json())
        .then(emojiSets => {
            const game = new EmojiGuessingGame(emojiSets);
            game.startGame();
        })
        .catch(error => {
            console.error('Erreur de chargement des données :', error);
            alert('Impossible de charger les données du jeu.');
        });
    });