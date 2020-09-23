class Game {
    static loadPoints() {
        Storage.loadPoints();
    }

    static startGame() {
        Game.duringRound = false;
        UI.introToMatchTransition();
    }

    static executeRound(evt) {
        if (Game.duringRound === true) return;
        Game.startRound();
        const result = Game.executeMovesAndGetResult(evt);
        Game.endRound(result);
    }

    static startRound() {
        Game.duringRound = true;
        UI.animateShakeHands();
    }

    static executeMovesAndGetResult(evt) {
        const playerMove = Game.getPlayerMove(evt);
        UI.changeHandImage('player', playerMove);
        const computerMove = Game.randomComputerMove();
        UI.changeHandImage('computer', computerMove);
        return Game.getRoundResult(playerMove, computerMove);
    }

    static getPlayerMove(evt) {
        return evt.target.id;
    }

    static randomComputerMove() {
        const moves = ['rock', 'paper', 'scissors'];
        return moves[Utilities.getRandomInt(3)];
    }

    static getRoundResult(playerMove, computerMove) {
        const possibleResults = new Map([
            ['rock rock', 'tie'],
            ['rock paper', 'computer'],
            ['rock scissors', 'player'],
            ['paper rock', 'player'],
            ['paper paper', 'tie'],
            ['paper scissors', 'computer'],
            ['scissors rock', 'computer'],
            ['scissors paper', 'player'],
            ['scissors scissors', 'tie']
        ]);
        const moves = `${playerMove} ${computerMove}`;
        return possibleResults.get(moves);
    }

    static endRound(result) {
        if (result !== 'tie') {
            const points = Storage.getPoints(result) + 1;
            UI.changePointsText(result, points);
            Storage.setPoints(result, points);
        }
        UI.changeResultText(Utilities.makeResultText(result));
        Game.checkHandsAnimationEnd();
    }

    static checkHandsAnimationEnd() {
        UI.getHandTag('player').addEventListener('animationend', () => {
            Game.duringRound = false;
        });
    }
}

class Storage {
    static loadPoints() {
        UI.changePointsText('player', Storage.getPoints('player'));
        UI.changePointsText('computer', Storage.getPoints('computer'));
    }

    static getPoints(playerName) {
        if (localStorage.getItem('punctation') === null) {
            return 0;
        }
        const storedPunctations = JSON.parse(localStorage.getItem('punctation'));
        for (const storedPunctation of storedPunctations) {
            if (storedPunctation.playerName === playerName) {
                return storedPunctation.points;
            }
        }
    }

    static setPoints(playerName, points) {
        const player = {playerName: 'player', points: Storage.getPoints('player')};
        const computer = {playerName: 'computer', points: Storage.getPoints('computer')};
        const punctation = [player, computer];
        punctation.map((player) => {
            if (player.playerName === playerName) {
                player.points = points;
            }
        });
        localStorage.setItem('punctation', JSON.stringify(punctation));
    }
}

class UI {
    static introToMatchTransition() {
        const introSection = document.querySelector('.intro');
        const matchSection = document.querySelector('.match');

        introSection.classList.add('fadeOut');
        matchSection.classList.remove('fadeOut');
    }

    static changePointsText(playerName, points) {
        UI.getPointsTag(playerName).textContent = points;
    }

    static animateShakeHands() {
        for (const hand of UI.getHandsTag()) {
            const handName = Utilities.getPlayer(hand);
            hand.style.animation = `shake-hand-${handName} 1s ease`;
            hand.addEventListener('animationend', UI.removeAnimation);
        }
    }

    static removeAnimation() {
        this.style.animation = '';
    }

    static changeHandImage(playerName, move) {
        setTimeout(() => {
            UI.getHandTag(playerName).src = `./images/${move}.png`;
        }, 300);
    }

    static changeResultText(result) {
        setTimeout(() => {
            UI.getResultTag().textContent = result;
        }, 300);
    }

    static getPointsTag(playerName) {
        return document.querySelector(`.${playerName}-score p`);
    }

    static getResultTag() {
        return document.querySelector('.result');
    }

    static getHandsTag() {
        return [UI.getHandTag('player'), UI.getHandTag('computer')];
    }

    static getHandTag(playerName) {
        return document.querySelector(`.${playerName}-hand`);
    }

    static getIntroButton() {
        return document.querySelector('.intro .btn');
    }

    static getRockButton() {
        return document.querySelector('.btn.rock');
    }

    static getPaperButton() {
        return document.querySelector('.btn.paper');
    }

    static getScissorsButton() {
        return document.querySelector('.btn.scissors');
    }
}

class Utilities {
    static getPlayer(hand) {
        return hand.classList[0].slice(0, -5);
    }

    static upperCaseFirst(word) {
        const firstLetter = word.charAt(0).toUpperCase();
        const rest = word.slice(1);
        return firstLetter + rest;
    }

    static getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    static makeResultText(result) {
        if (result !== 'tie') {
            return `The ${Utilities.upperCaseFirst(result)} has won!`;
        }
        return 'It\'s a tie.';
    }
}

UI.getIntroButton().addEventListener('click', Game.startGame);
UI.getRockButton().addEventListener('click', Game.executeRound);
UI.getPaperButton().addEventListener('click', Game.executeRound);
UI.getScissorsButton().addEventListener('click', Game.executeRound);
document.addEventListener('DOMContentLoaded', Game.loadPoints);
