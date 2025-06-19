document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const setupSection = document.getElementById('setup-section');
    const scoreboardSection = document.getElementById('scoreboard-section');
    const historySection = document.getElementById('history-section');
    const bigCountSection = document.getElementById('big-count-section');

    const awayTeamNameInput = document.getElementById('awayTeamNameInput');
    const homeTeamNameInput = document.getElementById('homeTeamNameInput');
    const playerCountInput = document.getElementById('playerCountInput');
    const awayPlayersDiv = document.getElementById('awayPlayers');
    const homePlayersDiv = document.getElementById('homePlayers');
    const startGameButton = document.getElementById('startGameButton');

    const awayTeamLabel = document.getElementById('awayTeamLabel');
    const homeTeamLabel = document.getElementById('homeTeamLabel');
    const awayTotalScoreElem = document.getElementById('awayTotalScore');
    const awayTotalHElem = document.getElementById('awayTotalH');
    const awayTotalEElem = document.getElementById('awayTotalE');
    const awayTeamAvgElem = document.getElementById('awayTeamAvg');
    const awayTeamObpElem = document.getElementById('awayTeamObp');
    const homeTotalScoreElem = document.getElementById('homeTotalScore');
    const homeTotalHElem = document.getElementById('homeTotalH');
    const homeTotalEElem = document.getElementById('homeTotalE');
    const homeTeamAvgElem = document.getElementById('homeTeamAvg');
    const homeTeamObpElem = document.getElementById('homeTeamObp');

    const scoreboardHeader = document.querySelector('.scoreboard-header');
    const awayTeamRow = document.querySelector('.scoreboard-row.away-team');
    const homeTeamRow = document.querySelector('.scoreboard-row.home-team');

    const currentInningInfo = document.getElementById('currentInningInfo');
    const ballsInfo = document.getElementById('ballsInfo');
    const strikesInfo = document.getElementById('strikesInfo');
    const outsInfo = document.getElementById('outsInfo');

    const firstBase = document.getElementById('firstBase');
    const secondBase = document.getElementById('secondBase');
    const thirdBase = document.getElementById('thirdBase');

    const currentBatterSelect = document.getElementById('currentBatterSelect');

    const batterOutButton = document.getElementById('batterOut');
    const batterSingleButton = document.getElementById('batterSingle');
    const batterDoubleButton = document.getElementById('batterDouble');
    const batterTripleButton = document.getElementById('batterTriple');
    const batterHomeRunButton = document.getElementById('batterHomeRun');
    const batterWalkButton = document.getElementById('batterWalk');
    const batterHBPButton = document.getElementById('batterHBP');
    const batterSacrificeButton = document.getElementById('batterSacrifice');
    const batterErrorButton = document.getElementById('batterError');

    const addRunButton = document.getElementById('addRun');
    const subtractRunButton = document.getElementById('subtractRun');
    const addErrorButton = document.getElementById('addError');
    const subtractErrorButton = document.getElementById('subtractError');
    const clearBasesButton = document.getElementById('clearBases');

    const addBallButton = document.getElementById('addBall');
    const addStrikeButton = document.getElementById('addStrike');
    const resetCountButton = document.getElementById('resetCount');

    const nextInningButton = document.getElementById('nextInning');
    const switchSidesButton = document.getElementById('switchSides');
    const endGameButton = document.getElementById('endGame');
    const resetGameButton = document.getElementById('resetGame');
    let showBigCountButton = null; // Will be created dynamically

    const awayPlayerStatsTable = document.getElementById('awayPlayerStatsTable');
    const homePlayerStatsTable = document.getElementById('homePlayerStatsTable');
    const awayPlayerStatsTeamName = document.getElementById('awayPlayerStatsTeamName');
    const homePlayerStatsTeamName = document.getElementById('homePlayerStatsTeamName');

    const gameHistoryList = document.getElementById('gameHistoryList');
    const clearHistoryButton = document.getElementById('clearHistoryButton');

    const bigBallsCount = document.getElementById('bigBallsCount');
    const bigStrikesCount = document.getElementById('bigStrikesCount');
    const bigOutsCount = document.getElementById('bigOutsCount');
    const backToScoreboardButton = document.getElementById('backToScoreboardButton');


    // Game State Variables
    let currentInning = 1;
    let isTopInning = true; // true for top, false for bottom
    let awayTeamScore = 0;
    let homeTeamScore = 0;
    let balls = 0;
    let strikes = 0;
    let outs = 0;
    let bases = {
        first: false,
        second: false,
        third: false
    };
    let awayTeamPlayers = [];
    let homeTeamPlayers = [];
    let currentBatterIndex = 0;
    let currentBattingTeam = ''; // 'away' or 'home'
    const maxInnings = 9; // Default max innings

    let gameHistory = []; // Stores completed game summaries
    let currentGameActions = []; // Stores actions within the current game

    // Team and Player Data Structure
    let gameData = {
        away: {
            name: 'ビジターズ',
            score: 0,
            hits: 0,
            errors: 0,
            innings: {}, // {1: 0, 2: 1, ...}
            players: []
        },
        home: {
            name: 'ホームズ',
            score: 0,
            hits: 0,
            errors: 0,
            innings: {},
            players: []
        }
    };

    // --- Utility Functions ---

    // Function to calculate batting average (AVG)
    function calculateAVG(hits, atBats) {
        if (atBats === 0) return '.000';
        return (hits / atBats).toFixed(3).replace(/^0\./, '.');
    }

    // Function to calculate on-base percentage (OBP)
    function calculateOBP(hits, walks, hbp, atBats, sacrificeFlies) {
        const numerator = hits + walks + hbp;
        const denominator = atBats + walks + hbp + sacrificeFlies;
        if (denominator === 0) return '.000';
        return (numerator / denominator).toFixed(3).replace(/^0\./, '.');
    }

    // Function to save game history to local storage
    function saveGameHistory() {
        localStorage.setItem('baseballGameHistory', JSON.stringify(gameHistory));
    }

    // Function to load game history from local storage
    function loadGameHistory() {
        const storedHistory = localStorage.getItem('baseballGameHistory');
        if (storedHistory) {
            gameHistory = JSON.parse(storedHistory);
            renderGameHistory();
        }
    }

    // Function to add an action to current game history
    function addGameAction(action) {
        const activeTeam = isTopInning ? gameData.away.name : gameData.home.name;
        const currentBatter = currentBatterSelect.value;
        const inningText = `${currentInning}回${isTopInning ? '表' : '裏'}`;
        currentGameActions.push(`[${inningText}] ${activeTeam} (${currentBatter}): ${action} (B:${balls} S:${strikes} O:${outs}) 1B:${bases.first?'有':'無'} 2B:${bases.second?'有':'無'} 3B:${bases.third?'有':'無'}`);
    }

    // Function to update the scoreboard display
    function updateScoreboard() {
        // Update team names
        awayTeamLabel.textContent = gameData.away.name;
        homeTeamLabel.textContent = gameData.home.name;

        // Update total scores, hits, errors
        awayTotalScoreElem.textContent = gameData.away.score;
        awayTotalHElem.textContent = gameData.away.hits;
        awayTotalEElem.textContent = gameData.away.errors;
        homeTotalScoreElem.textContent = gameData.home.score;
        homeTotalHElem.textContent = gameData.home.hits;
        homeTotalEElem.textContent = gameData.home.errors;

        // Update batting average and on-base percentage for teams
        const awayTeamAtBats = gameData.away.players.reduce((sum, p) => sum + p.atBats, 0);
        const awayTeamHits = gameData.away.players.reduce((sum, p) => sum + p.hits, 0);
        const awayTeamWalks = gameData.away.players.reduce((sum, p) => sum + p.walks, 0);
        const awayTeamHBP = gameData.away.players.reduce((sum, p) => sum + p.hbp, 0);
        const awayTeamSacrifices = gameData.away.players.reduce((sum, p) => sum + p.sacrifices, 0);
        awayTeamAvgElem.textContent = calculateAVG(awayTeamHits, awayTeamAtBats);
        awayTeamObpElem.textContent = calculateOBP(awayTeamHits, awayTeamWalks, awayTeamHBP, awayTeamAtBats, awayTeamSacrifices);

        const homeTeamAtBats = gameData.home.players.reduce((sum, p) => sum + p.atBats, 0);
        const homeTeamHits = gameData.home.players.reduce((sum, p) => sum + p.hits, 0);
        const homeTeamWalks = gameData.home.players.reduce((sum, p) => sum + p.walks, 0);
        const homeTeamHBP = gameData.home.players.reduce((sum, p) => sum + p.hbp, 0);
        const homeTeamSacrifices = gameData.home.players.reduce((sum, p) => sum + p.sacrifices, 0);
        homeTeamAvgElem.textContent = calculateAVG(homeTeamHits, homeTeamAtBats);
        homeTeamObpElem.textContent = calculateOBP(homeTeamHits, homeTeamWalks, homeTeamHBP, homeTeamAtBats, homeTeamSacrifices);

        // Update current inning and top/bottom
        currentInningInfo.textContent = `${currentInning}回${isTopInning ? '表' : '裏'}`;

        // Update Balls, Strikes, Outs
        ballsInfo.textContent = `B: ${balls}`;
        strikesInfo.textContent = `S: ${strikes}`;
        outsInfo.textContent = `O: ${outs}`;

        // Update bases display
        firstBase.classList.toggle('active', bases.first);
        secondBase.classList.toggle('active', bases.second);
        thirdBase.classList.toggle('active', bases.third);
    }

    // Function to populate player name inputs based on count
    function populatePlayerInputs() {
        const count = parseInt(playerCountInput.value);
        awayPlayersDiv.innerHTML = '<h4>ビジター選手名</h4>';
        homePlayersDiv.innerHTML = '<h4>ホーム選手名</h4>';

        for (let i = 1; i <= count; i++) {
            awayPlayersDiv.innerHTML += `
                <div class="player-input-group">
                    <label for="awayPlayer${i}">選手${i}:</label>
                    <input type="text" id="awayPlayer${i}" value="ビジター${i}">
                </div>
            `;
            homePlayersDiv.innerHTML += `
                <div class="player-input-group">
                    <label for="homePlayer${i}">選手${i}:</label>
                    <input type="text" id="homePlayer${i}" value="ホーム${i}">
                </div>
            `;
        }
    }

    // Function to setup the scoreboard innings dynamically
    function setupScoreboardInnings() {
        // Clear existing innings
        document.querySelectorAll('.inning-col').forEach(el => el.remove());
        document.querySelectorAll('.inning-score').forEach(el => el.remove());

        // Add inning headers
        for (let i = 1; i <= maxInnings; i++) {
            const inningHeader = document.createElement('div');
            inningHeader.classList.add('inning-col');
            inningHeader.textContent = i;
            scoreboardHeader.insertBefore(inningHeader, scoreboardHeader.querySelector('.rhe-col'));
        }

        // Add inning score cells for each team
        for (let i = 1; i <= maxInnings; i++) {
            const awayInningScore = document.createElement('div');
            awayInningScore.classList.add('inning-score');
            awayInningScore.id = `awayInning${i}`;
            awayInningScore.textContent = '0';
            awayTeamRow.insertBefore(awayInningScore, awayTeamRow.querySelector('.rhe-score'));

            const homeInningScore = document.createElement('div');
            homeInningScore.classList.add('inning-score');
            homeInningScore.id = `homeInning${i}`;
            homeInningScore.textContent = '0';
            homeTeamRow.insertBefore(homeInningScore, homeTeamRow.querySelector('.rhe-score'));
        }
    }

    // Function to update inning scores on the scoreboard
    function updateInningScore(team, inning, score) {
        const inningId = `${team}Inning${inning}`;
        const inningElem = document.getElementById(inningId);
        if (inningElem) {
            inningElem.textContent = score;
        }
    }

    // Function to populate the current batter select dropdown
    function populateBatterSelect() {
        currentBatterSelect.innerHTML = ''; // Clear previous options
        let currentTeamPlayers = isTopInning ? gameData.away.players : gameData.home.players;
        currentBattingTeam = isTopInning ? 'away' : 'home';

        currentTeamPlayers.forEach((player, index) => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = player.name;
            currentBatterSelect.appendChild(option);
        });

        // Set current batter to the correct player in the lineup
        currentBatterSelect.selectedIndex = currentBatterIndex;
    }

    // Function to update player stats table
    function updatePlayerStatsTables() {
        awayPlayerStatsTeamName.textContent = `${gameData.away.name} 選手成績`;
        homePlayerStatsTeamName.textContent = `${gameData.home.name} 選手成績`;

        function renderTeamStats(teamData, tableBody) {
            tableBody.innerHTML = '';
            teamData.players.forEach((player, index) => {
                const atBats = player.atBats;
                const hits = player.hits;
                const walks = player.walks;
                const hbp = player.hbp;
                const sacrifices = player.sacrifices;

                const avg = calculateAVG(hits, atBats);
                const obp = calculateOBP(hits, walks, hbp, atBats, sacrifices);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${atBats}</td>
                    <td>${hits}</td>
                    <td>${walks}</td>
                    <td>${hbp}</td>
                    <td>${sacrifices}</td>
                    <td>${avg}</td>
                    <td>${obp}</td>
                `;
                tableBody.appendChild(row);
            });
        }

        renderTeamStats(gameData.away, awayPlayerStatsTable);
        renderTeamStats(gameData.home, homePlayerStatsTable);
    }

    // Function to reset counts (balls, strikes)
    function resetCount() {
        balls = 0;
        strikes = 0;
        updateScoreboard();
        addGameAction("カウントリセット");
    }

    // Function to advance bases (runner moves one base)
    function advanceRunner(fromBase) {
        if (fromBase === 3 && bases.third) {
            // Runner on third scores
            bases.third = false;
            addRun();
        } else if (fromBase === 2 && bases.second) {
            // Runner on second moves to third
            bases.third = true;
            bases.second = false;
        } else if (fromBase === 1 && bases.first) {
            // Runner on first moves to second
            bases.second = true;
            bases.first = false;
        }
        updateScoreboard();
    }

    // Function to clear all bases
    function clearBases() {
        bases.first = false;
        bases.second = false;
        bases.third = false;
        updateScoreboard();
        addGameAction("塁上クリア");
    }

    // Function to add an out
    function addOut() {
        outs++;
        addGameAction("アウト追加");
        if (outs >= 3) {
            handleThreeOuts();
        }
        updateScoreboard();
    }

    // Function to handle 3 outs (end of half-inning)
    function handleThreeOuts() {
        addGameAction("3アウト、攻守交代！");
        outs = 0;
        balls = 0;
        strikes = 0;
        clearBases();
        switchSides();
    }

    // Function to move runners based on hit type
    function moveRunners(hitType) {
        let runsScored = 0;
        // Move existing runners
        if (bases.third) {
            runsScored++;
            bases.third = false;
        }
        if (bases.second) {
            bases.third = true;
            bases.second = false;
        }
        if (bases.first) {
            bases.second = true;
            bases.first = false;
        }

        // Place batter on base
        if (hitType === 'single') {
            bases.first = true;
        } else if (hitType === 'double') {
            bases.first = false; // Batter goes directly to second
            bases.second = true;
        } else if (hitType === 'triple') {
            bases.first = false;
            bases.second = false; // Batter goes directly to third
            bases.third = true;
        } else if (hitType === 'homerun') {
            runsScored++; // Batter scores
            clearBases(); // Clear all bases as homerun clears them
            // All existing runners also score
            if (bases.first) runsScored++;
            if (bases.second) runsScored++;
            if (bases.third) runsScored++;
        } else if (hitType === 'walk' || hitType === 'hbp') {
            // If bases are loaded, runner on third scores
            if (bases.first && bases.second && bases.third) {
                runsScored++;
                bases.third = false; // Runner from 3rd scores
            }
            // If first base is occupied, runner moves up
            if (bases.first) {
                if (bases.second) {
                    if (bases.third) {
                        // All bases loaded, runner on 3rd scores
                        // Handled above.
                    } else {
                        // 1st and 2nd occupied, runner from 2nd moves to 3rd
                        bases.third = true;
                        bases.second = false;
                    }
                } else {
                    // 1st occupied, 2nd empty, runner from 1st moves to 2nd
                    bases.second = true;
                    bases.first = false;
                }
            }
            // Batter takes first base
            bases.first = true;
        } else if (hitType === 'error') {
            bases.first = true; // Batter reaches on error
            // Other runners advance based on game situation (simplified: just put batter on 1st)
        }

        // Add the runs scored from this play
        for (let i = 0; i < runsScored; i++) {
            addRun();
        }

        updateScoreboard();
    }


    // Function to add a run to the current batting team
    function addRun() {
        if (isTopInning) {
            gameData.away.score++;
            updateInningScore('away', currentInning, gameData.away.innings[currentInning] + 1);
            gameData.away.innings[currentInning]++;
        } else {
            gameData.home.score++;
            updateInningScore('home', currentInning, gameData.home.innings[currentInning] + 1);
            gameData.home.innings[currentInning]++;
        }
        updateScoreboard();
        addGameAction("得点追加");
    }

    // Function to subtract a run from the current batting team
    function subtractRun() {
        if (isTopInning) {
            if (gameData.away.score > 0) {
                gameData.away.score--;
                updateInningScore('away', currentInning, gameData.away.innings[currentInning] - 1);
                gameData.away.innings[currentInning]--;
            }
        } else {
            if (gameData.home.score > 0) {
                gameData.home.score--;
                updateInningScore('home', currentInning, gameData.home.innings[currentInning] - 1);
                gameData.home.innings[currentInning]--;
            }
        }
        updateScoreboard();
        addGameAction("得点削除");
    }

    // Function to add an error to the fielding team
    function addError() {
        if (isTopInning) {
            gameData.home.errors++; // Home team is fielding
        } else {
            gameData.away.errors++; // Away team is fielding
        }
        updateScoreboard();
        addGameAction("エラー追加");
    }

    // Function to subtract an error from the fielding team
    function subtractError() {
        if (isTopInning) {
            if (gameData.home.errors > 0) {
                gameData.home.errors--;
            }
        } else {
            if (gameData.away.errors > 0) {
                gameData.away.errors--;
            }
        }
        updateScoreboard();
        addGameAction("エラー削除");
    }

    // Function to switch sides (top to bottom, or bottom to next inning)
    function switchSides() {
        addGameAction("攻守交代");
        outs = 0;
        balls = 0;
        strikes = 0;
        clearBases();

        if (isTopInning) {
            // Switch to bottom of current inning
            isTopInning = false;
        } else {
            // Switch to top of next inning
            isTopInning = true;
            currentInning++;
            if (currentInning > maxInnings && gameData.away.score !== gameData.home.score) {
                endGame();
                return;
            }
            // Initialize new inning score to 0 if it's a new inning
            gameData.away.innings[currentInning] = 0;
            gameData.home.innings[currentInning] = 0;
        }

        // Reset batter index for the new batting team
        currentBatterIndex = 0;
        populateBatterSelect();
        updateScoreboard();

        // Check for game over condition after potential inning advance
        if (currentInning > maxInnings && !isTopInning && gameData.away.score !== gameData.home.score) {
            endGame();
        } else if (currentInning > maxInnings && isTopInning && gameData.home.score > gameData.away.score) {
            // Home team wins if leading in bottom of last inning
            endGame();
        }
    }

    // Function to manually advance to next inning (only if no outs/bases)
    function nextInning() {
        if (outs !== 0 || balls !== 0 || strikes !== 0 || bases.first || bases.second || bases.third) {
            alert('アウト、カウント、または塁上にランナーがいるため、イニングを進めることはできません。全てリセットしてから進めてください。');
            return;
        }
        addGameAction("次イニングへ");
        if (isTopInning) {
            isTopInning = false;
        } else {
            isTopInning = true;
            currentInning++;
            // Initialize new inning score to 0
            gameData.away.innings[currentInning] = 0;
            gameData.home.innings[currentInning] = 0;
        }

        // Reset batter index for the new batting team
        currentBatterIndex = 0;
        populateBatterSelect();
        updateScoreboard();

        // Check for game over condition
        if (currentInning > maxInnings && !isTopInning && gameData.away.score !== gameData.home.score) {
            endGame();
        } else if (currentInning > maxInnings && isTopInning && gameData.home.score > gameData.away.score) {
            // Home team wins if leading in bottom of last inning
            endGame();
        }
    }

    // Function to end the game
    function endGame() {
        let winner = "引き分け";
        if (gameData.away.score > gameData.home.score) {
            winner = gameData.away.name;
        } else if (gameData.home.score > gameData.away.score) {
            winner = gameData.home.name;
        }

        const gameSummary = {
            awayTeam: gameData.away.name,
            homeTeam: gameData.home.name,
            awayScore: gameData.away.score,
            homeScore: gameData.home.score,
            winner: winner,
            innings: currentInning,
            actions: [...currentGameActions] // Copy current game actions
        };
        gameHistory.push(gameSummary);
        saveGameHistory();
        renderGameHistory();

        alert(`試合終了！\n${gameData.away.name}: ${gameData.away.score}点\n${gameData.home.name}: ${gameData.home.score}点\n勝者: ${winner}`);
        resetGame(); // Optionally reset game after ending
    }

    // Function to reset the entire game
    function resetGame() {
        addGameAction("試合リセット"); // Log reset as the last action of the game attempt
        currentInning = 1;
        isTopInning = true;
        awayTeamScore = 0;
        homeTeamScore = 0;
        balls = 0;
        strikes = 0;
        outs = 0;
        bases = { first: false, second: false, third: false };
        currentBatterIndex = 0;
        currentGameActions = []; // Clear current game actions

        gameData = {
            away: {
                name: awayTeamNameInput.value || 'ビジターズ',
                score: 0,
                hits: 0,
                errors: 0,
                innings: { 1: 0 },
                players: awayTeamPlayers.map(p => ({ ...p, atBats: 0, hits: 0, walks: 0, hbp: 0, sacrifices: 0 }))
            },
            home: {
                name: homeTeamNameInput.value || 'ホームズ',
                score: 0,
                hits: 0,
                errors: 0,
                innings: { 1: 0 },
                players: homeTeamPlayers.map(p => ({ ...p, atBats: 0, hits: 0, walks: 0, hbp: 0, sacrifices: 0 }))
            }
        };

        // Reset scoreboard display
        setupScoreboardInnings(); // Re-render inning headers and cells
        updateScoreboard();
        populateBatterSelect();
        updatePlayerStatsTables();

        // Show setup section and hide scoreboard
        setupSection.classList.remove('hidden');
        scoreboardSection.classList.add('hidden');
        bigCountSection.classList.add('hidden');
        historySection.classList.remove('hidden'); // Keep history visible
    }

    // Function to render game history
    function renderGameHistory() {
        gameHistoryList.innerHTML = '';
        if (gameHistory.length === 0) {
            gameHistoryList.innerHTML = '<li class="no-history">まだ試合履歴がありません。</li>';
            return;
        }
        gameHistory.forEach((game, index) => {
            const listItem = document.createElement('li');
            const winnerText = game.winner === "引き分け" ? "引き分け" : `${game.winner}の勝利`;
            listItem.innerHTML = `
                <strong>試合 #${index + 1}: ${game.awayTeam} ${game.awayScore} - ${game.homeTeam} ${game.homeScore}</strong> (${game.innings}イニング, ${winnerText})
                <details>
                    <summary>詳細を見る</summary>
                    <ul class="game-actions-list">
                        ${game.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </details>
            `;
            gameHistoryList.appendChild(listItem);
        });
    }

    // --- Event Listeners ---

    // Populate player inputs when player count changes
    playerCountInput.addEventListener('change', populatePlayerInputs);
    playerCountInput.addEventListener('keyup', populatePlayerInputs); // Also on keyup for immediate feedback

    // Start Game Button
    startGameButton.addEventListener('click', () => {
        const awayName = awayTeamNameInput.value.trim();
        const homeName = homeTeamNameInput.value.trim();
        const playerCount = parseInt(playerCountInput.value);

        if (!awayName || !homeName || isNaN(playerCount) || playerCount < 1) {
            alert('チーム名と選手人数を正しく入力してください。');
            return;
        }

        // Collect player names
        awayTeamPlayers = [];
        for (let i = 1; i <= playerCount; i++) {
            const playerName = document.getElementById(`awayPlayer${i}`).value.trim() || `ビジター${i}`;
            awayTeamPlayers.push({ name: playerName, atBats: 0, hits: 0, walks: 0, hbp: 0, sacrifices: 0 });
        }

        homeTeamPlayers = [];
        for (let i = 1; i <= playerCount; i++) {
            const playerName = document.getElementById(`homePlayer${i}`).value.trim() || `ホーム${i}`;
            homeTeamPlayers.push({ name: playerName, atBats: 0, hits: 0, walks: 0, hbp: 0, sacrifices: 0 });
        }

        // Initialize gameData with collected info
        gameData.away.name = awayName;
        gameData.away.players = awayTeamPlayers;
        gameData.home.name = homeName;
        gameData.home.players = homeTeamPlayers;

        // Reset and prepare game state
        currentInning = 1;
        isTopInning = true;
        gameData.away.score = 0;
        gameData.away.hits = 0;
        gameData.away.errors = 0;
        gameData.away.innings = { 1: 0 };
        gameData.home.score = 0;
        gameData.home.hits = 0;
        gameData.home.errors = 0;
        gameData.home.innings = { 1: 0 };
        balls = 0;
        strikes = 0;
        outs = 0;
        clearBases();
        currentBatterIndex = 0;
        currentGameActions = []; // Start new game actions log

        setupScoreboardInnings(); // Setup for 9 innings initially
        updateScoreboard();
        populateBatterSelect();
        updatePlayerStatsTables();

        setupSection.classList.add('hidden');
        scoreboardSection.classList.remove('hidden');
        historySection.classList.add('hidden'); // Hide history during game
    });

    // Batter Action Buttons
    batterOutButton.addEventListener('click', () => {
        const player = isTopInning ? gameData.away.players[currentBatterIndex] : gameData.home.players[currentBatterIndex];
        player.atBats++; // Count as at-bat
        addOut();
        resetCount(); // Reset count for next batter
        currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
        populateBatterSelect();
        updatePlayerStatsTables();
        addGameAction(`アウト！`);
    });

    batterSingleButton.addEventListener('click', () => {
        const player = isTopInning ? gameData.away.players[currentBatterIndex] : gameData.home.players[currentBatterIndex];
        player.atBats++;
        player.hits++;
        if (isTopInning) gameData.away.hits++; else gameData.home.hits++;
        moveRunners('single');
        resetCount();
        currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
        populateBatterSelect();
        updatePlayerStatsTables();
        addGameAction(`単打！`);
    });

    batterDoubleButton.addEventListener('click', () => {
        const player = isTopInning ? gameData.away.players[currentBatterIndex] : gameData.home.players[currentBatterIndex];
        player.atBats++;
        player.hits++;
        if (isTopInning) gameData.away.hits++; else gameData.home.hits++;
        moveRunners('double');
        resetCount();
        currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
        populateBatterSelect();
        updatePlayerStatsTables();
        addGameAction(`二塁打！`);
    });

    batterTripleButton.addEventListener('click', () => {
        const player = isTopInning ? gameData.away.players[currentBatterIndex] : gameData.home.players[currentBatterIndex];
        player.atBats++;
        player.hits++;
        if (isTopInning) gameData.away.hits++; else gameData.home.hits++;
        moveRunners('triple');
        resetCount();
        currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
        populateBatterSelect();
        updatePlayerStatsTables();
        addGameAction(`三塁打！`);
    });

    batterHomeRunButton.addEventListener('click', () => {
        const player = isTopInning ? gameData.away.players[currentBatterIndex] : gameData.home.players[currentBatterIndex];
        player.atBats++;
        player.hits++;
        if (isTopInning) gameData.away.hits++; else gameData.home.hits++;
        moveRunners('homerun'); // This will also handle scoring the batter and existing runners
        resetCount();
        currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
        populateBatterSelect();
        updatePlayerStatsTables();
        addGameAction(`ホームラン！`);
    });

    batterWalkButton.addEventListener('click', () => {
        const player = isTopInning ? gameData.away.players[currentBatterIndex] : gameData.home.players[currentBatterIndex];
        player.walks++; // Not an at-bat
        moveRunners('walk');
        resetCount();
        currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
        populateBatterSelect();
        updatePlayerStatsTables();
        addGameAction(`四球で出塁`);
    });

    batterHBPButton.addEventListener('click', () => {
        const player = isTopInning ? gameData.away.players[currentBatterIndex] : gameData.home.players[currentBatterIndex];
        player.hbp++; // Not an at-bat
        moveRunners('hbp');
        resetCount();
        currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
        populateBatterSelect();
        updatePlayerStatsTables();
        addGameAction(`死球で出塁`);
    });

    batterSacrificeButton.addEventListener('click', () => {
        const player = isTopInning ? gameData.away.players[currentBatterIndex] : gameData.home.players[currentBatterIndex];
        player.sacrifices++; // Not an at-bat, but still advances runner
        // For simplicity, a sacrifice will advance all runners by one base, scoring if on 3rd
        if (bases.third) { addRun(); bases.third = false; }
        if (bases.second) { bases.third = true; bases.second = false; }
        if (bases.first) { bases.second = true; bases.first = false; }
        addOut(); // Sacrifice usually results in an out
        resetCount();
        currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
        populateBatterSelect();
        updatePlayerStatsTables();
        addGameAction(`犠打/犠飛`);
    });

    batterErrorButton.addEventListener('click', () => {
        const player = isTopInning ? gameData.away.players[currentBatterIndex] : gameData.home.players[currentBatterIndex];
        // Error is not an at-bat, but batter reaches base
        addError();
        moveRunners('error'); // Batter reaches first on error
        resetCount();
        currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
        populateBatterSelect();
        updatePlayerStatsTables();
        addGameAction(`エラーで出塁`);
    });


    // Other Controls
    addRunButton.addEventListener('click', addRun);
    subtractRunButton.addEventListener('click', subtractRun);
    addErrorButton.addEventListener('click', addError);
    subtractErrorButton.addEventListener('click', subtractError);
    clearBasesButton.addEventListener('click', clearBases);

    addBallButton.addEventListener('click', () => {
        balls++;
        if (balls >= 4) {
            addGameAction(`四球 (ボールカウントが上限に達しました)`);
            moveRunners('walk'); // Batter gets a walk, runners advance
            resetCount();
            currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
            populateBatterSelect();
            updatePlayerStatsTables();
        } else {
            addGameAction(`ボール追加`);
        }
        updateScoreboard();
    });

    addStrikeButton.addEventListener('click', () => {
        strikes++;
        if (strikes >= 3) {
            addGameAction(`三振 (ストライクカウントが上限に達しました)`);
            addOut();
            resetCount();
            currentBatterIndex = (currentBatterIndex + 1) % (isTopInning ? gameData.away.players.length : gameData.home.players.length);
            populateBatterSelect();
            updatePlayerStatsTables();
        } else {
            addGameAction(`ストライク追加`);
        }
        updateScoreboard();
    });
    resetCountButton.addEventListener('click', resetCount);

    nextInningButton.addEventListener('click', nextInning);
    switchSidesButton.addEventListener('click', switchSides);
    endGameButton.addEventListener('click', endGame);
    resetGameButton.addEventListener('click', resetGame);

    // Dynamic button for big count view
    const inningGameControls = document.querySelector('.inning-game-controls .button-grid-2col');
    showBigCountButton = document.createElement('button');
    showBigCountButton.id = 'showBigCountButton';
    showBigCountButton.classList.add('btn', 'btn-secondary');
    showBigCountButton.textContent = 'カウント大画面';
    showBigCountButton.addEventListener('click', () => {
        scoreboardSection.classList.add('hidden');
        bigCountSection.classList.remove('hidden');
        bigBallsCount.textContent = balls;
        bigStrikesCount.textContent = strikes;
        bigOutsCount.textContent = outs;
    });
    inningGameControls.appendChild(showBigCountButton);

    backToScoreboardButton.addEventListener('click', () => {
        bigCountSection.classList.add('hidden');
        scoreboardSection.classList.remove('hidden');
    });

    clearHistoryButton.addEventListener('click', () => {
        if (confirm('全ての試合履歴を削除してもよろしいですか？')) {
            gameHistory = [];
            saveGameHistory();
            renderGameHistory();
            alert('試合履歴がクリアされました。');
        }
    });


    // --- Initialization ---
    populatePlayerInputs(); // Initial population of player inputs
    loadGameHistory(); // Load existing game history
});
