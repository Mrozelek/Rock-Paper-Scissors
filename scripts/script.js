let game = {
    points: new Map([
        ['player', 0],
        ['opponent', 0]
    ]),
    duringRound: false,
    setRoundFlag: flag => game.duringRound = flag,
    startGame: () => {
        game.setRoundFlag(false);
        ui.transiteToGame();
    },
    executeRound: evt => {
        if (game.duringRound) return;
        game.setRoundFlag(true);

        const moves = game.executeMoves(evt);
        const roundResult = game.getResultFromMoves(moves);

        if (roundResult !== 'tie') {
            const points = storage.getPoints(roundResult) + 1;
            ui.changePointsText(roundResult, points);
            storage.setPoints(roundResult, points);
        }

        ui.changeResultText(makeResultText(roundResult));
        game.closeRound();
    },
    executeMoves: evt => {
        const playerMove = game.getPlayerMove(evt);
        const opponentMove = game.randomOpponentMove();

        ui.shakeHands();
        ui.changeHandImage('player', playerMove);
        ui.changeHandImage('opponent', opponentMove);

        return [playerMove, opponentMove];
    },
    getPlayerMove: evt => {
        return evt.target.id;
    },
    randomOpponentMove: () => {
        const possibleMoves = ['rock', 'paper', 'scissors'];
        return possibleMoves[getRandomInt(3)];
    },
    getResultFromMoves: moves => {
        const possibleResults = new Map([
            ['rock rock', 'tie'],
            ['rock paper', 'opponent'],
            ['rock scissors', 'player'],
            ['paper rock', 'player'],
            ['paper paper', 'tie'],
            ['paper scissors', 'opponent'],
            ['scissors rock', 'opponent'],
            ['scissors paper', 'player'],
            ['scissors scissors', 'tie']
        ]);
        return possibleResults.get(moves.join(' '));
    },
    closeRound: () => {
        ui.playerHand.addEventListener('animationend', () => {
            game.duringRound = false;
        });
    }
}

const ui = {
    startBtn: document.querySelector('#pve-btn'),
    rockBtn: document.getElementById('rock'),
    paperBtn: document.getElementById('paper'),
    scissorsBtn: document.getElementById('scissors'),
    intro: document.getElementById('intro'),
    match: document.getElementById('match'),
    playerHand: document.getElementById('player-hand'),
    pointsPlayer: document.querySelector('#player-score p'),
    pointsOpponent: document.querySelector('#opponent-score p'),
    result: document.getElementById('result'),
    handPlayer: document.querySelector('#player-hand'),
    handOpponent: document.querySelector('#opponent-hand'),
    transiteToGame: () => {
        intro.addEventListener('transitionend', () => {
            ui.intro.style.display = 'none';
            ui.match.style.display = 'flex';
            setTimeout(() => {
                ui.match.classList.remove('fade-out');
                ui.match.classList.add('fade-in');
            }, 1);
        });
        ui.intro.classList.add('fade-out');
    },
    changePointsText: (playerName, points) => {
        pointsTag = (playerName === 'player') ?
            ui.pointsPlayer : ui.pointsOpponent;
        pointsTag.textContent = points;
    },
    changeResultText: text => {
        setTimeout(() => {
            result.textContent = text;
        }, 300);
    },
    changeHandImage: (playerName, move) => {
        setTimeout(() => {
            hand = (playerName === 'player') ?
                ui.handPlayer : ui.handOpponent;
            hand.src = `./images/${move}.png`;
        }, 300);
    },
    shakeHands: () => {
        ui.handPlayer.style.animation = `shake-hand-player 1s ease`;
        ui.handPlayer.addEventListener('animationend', ui.removeAnimation);

        ui.handOpponent.style.animation = `shake-hand-opponent 1s ease`;
        ui.handOpponent.addEventListener('animationend', ui.removeAnimation);
    },
    removeAnimation: (evt) => {
        evt.target.style.animation = '';
    }
}

const storage = {
    loadPoints: () => {
        ui.changePointsText('player', storage.getPoints('player'));
        ui.changePointsText('opponent', storage.getPoints('opponent'));
    },
    getPoints: (playerName) => {
        if (localStorage.getItem('points') === null) {
            return 0;
        }
        const storedPoints = JSON.parse(localStorage.getItem('points'));
        for (const storedPoints of storedPoints) {
            if (storedPoints.playerName === playerName) {
                return storedPoints.points;
            }
        }
    },
    setPoints: (playerName, points) => {
        const player = { playerName: 'player', points: storage.getPoints('player') };
        const opponent = { playerName: 'opponent', points: storage.getPoints('opponent') };
        const punctation = [player, opponent];
        punctation.map((player) => {
            if (player.playerName === playerName) {
                player.points = points;
            }
        });
        localStorage.setItem('points', JSON.stringify(punctation));
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function makeResultText(result) {
    if (result === 'tie') {
        return 'It\'s a tie.';
    }
    return `The ${upperCaseFirst(result)} has won!`;
}

function upperCaseFirst(word) {
    const firstLetter = word.charAt(0).toUpperCase();
    const rest = word.slice(1);
    return firstLetter + rest;
}


ui.startBtn.addEventListener('click', game.startGame);
ui.rockBtn.addEventListener('click', game.executeRound);
ui.paperBtn.addEventListener('click', game.executeRound);
ui.scissorsBtn.addEventListener('click', game.executeRound);
document.addEventListener('DOMContentLoaded', storage.loadPoints);
