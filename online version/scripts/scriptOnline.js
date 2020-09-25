const socket = io('http://localhost:3000');
socket.on('message', data => {
    console.log(data);
});

socket.on('player-move', otherPlayerMove => {
    game.otherPlayerMove = otherPlayerMove;
    if (game.sendMove) {
        game.receivedMove = true;
        game.executeRound(game.storedEvt)
    };
});

let game = {
    receivedMove: false,
    sendMove: false,
    storedEvt: null,
    otherPlayerMove: null,
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
        if (game.duringRound && !game.receivedMove) return;
        game.setRoundFlag(true);
        
        const moves = game.executeMoves(evt);
        if (moves === null) {
            game.storedEvt = evt;
            return;
        }

        const roundResult = game.getResultFromMoves(moves);

        if (roundResult !== 'tie') {
            const points = game.getPoints(roundResult) + 1;
            ui.changePointsText(roundResult, points);
            game.setPoints(roundResult, points);
        }

        ui.changeResultText(makeResultText(roundResult));
        game.closeRound();
    },
    executeMoves: evt => {
        const playerMove = game.getPlayerMove(evt);

        if (!game.sendMove) {
            game.sendMove = true;
            socket.emit('player-move', playerMove);
        }

        if (game.otherPlayerMove === null) return null;

        const opponentMove = game.otherPlayerMove;
        game.otherPlayerMove = null;

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
    getPoints: playerName => {
        return game.points.get(playerName);
    },
    setPoints: (playerName, points) => {
        game.points.set(playerName, points);
    },
    closeRound: () => {
        ui.playerHand.addEventListener('animationend', () => {
            game.setRoundFlag(false);
            game.sendMove = false;
            game.receivedMove = false;
        });
    }
}

const ui = {
    startBtn: document.getElementById('pvp-btn'),
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