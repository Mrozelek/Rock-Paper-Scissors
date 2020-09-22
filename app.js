(function () {
    const introBtn = document.querySelector('.intro .btn');
    const rockBtn = document.querySelector('.btn.rock');
    const paperBtn = document.querySelector('.btn.paper');
    const scissorsBtn = document.querySelector('.btn.scissors');

    let duringRound = false;

    function startGame() {
        const introSection = document.querySelector('.intro');
        const matchSection = document.querySelector('.match');

        introSection.classList.add('fadeOut');
        matchSection.classList.remove('fadeOut');
    }

    function startRound(evt) {
        if (duringRound) return;
        duringRound = true;

        const playerHand = document.querySelector('.player-hand');
        const computerHand = document.querySelector('.computer-hand');

        const playerMove = evt.target.classList[1];
        const computerMove = randomComputerMove();

        animateHand(playerHand, playerMove);
        animateHand(computerHand, computerMove);

        checkResult(playerMove, computerMove);
    }

    function animateHand(hand, move) {
        setTimeout(() => {
            hand.src = `./images/${move}.png`;
        }, 300);
        const handName = hand.classList[0].slice(0, -5);
        hand.style.animation = `shake-hand-${handName} 1s ease`;
        hand.addEventListener('animationend', removeAnimation);
    }

    function removeAnimation() {
        this.style.animation = '';
        duringRound = false;
    }

    function randomComputerMove() {
        const moves = ['rock', 'paper', 'scissors'];
        return moves[getRandomInt(3)];
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function checkResult(playerMove, computerMove) {
        const possibleResults = {
            'rock rock': 'tie',
            'rock paper': 'computer',
            'rock scissors': 'player',
            'paper rock': 'player',
            'paper paper': 'tie',
            'paper scissors': 'computer',
            'scissors rock': 'computer',
            'scissors paper': 'player',
            'scissors scissors': 'tie',
        }
        const moves = `${playerMove} ${computerMove}`;

        incrementPoints(possibleResults[moves]);
    }

    function incrementPoints(winner) {
        winnerTag = document.querySelector('.winner');
        let winnerText = '';

        if (winner !== 'tie') {
            pointsTag = document.querySelector(`.${winner}-score p`);
            pointsTag.textContent = ++pointsTag.textContent;

            winnerText = `The ${upperCaseFirst(winner)} has won!`;
        } else {
            winnerText = 'It\'s a tie.';
        }

        setTimeout(() => {
            winnerTag.textContent = winnerText;
        }, 300);
    }

    function upperCaseFirst(word) {
        const firstLetter = word.charAt(0).toUpperCase();
        const rest = word.slice(1);
        return firstLetter + rest;
    }

    introBtn.addEventListener('click', startGame);
    rockBtn.addEventListener('click', startRound);
    paperBtn.addEventListener('click', startRound);
    scissorsBtn.addEventListener('click', startRound);
})()
