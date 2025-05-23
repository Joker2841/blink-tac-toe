import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, HelpCircle, Volume2, VolumeX, Trophy, Star, Users, Coins } from 'lucide-react';

const BlinkTacToe = () => {
  // Emoji categories
  const emojiCategories = {
    animals: { name: 'Animals', emojis: ['🐶', '🐱', '🐵', '🐰', '🦊', '🐸'] },
    food: { name: 'Food', emojis: ['🍕', '🍟', '🍔', '🍩', '🌮', '🍎'] },
    sports: { name: 'Sports', emojis: ['⚽', '🏀', '🏈', '🎾', '🏐', '🎱'] },
    nature: { name: 'Nature', emojis: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼'] },
    space: { name: 'Space', emojis: ['🚀', '🛸', '⭐', '🌙', '☄️', '🪐'] },
    transport: { name: 'Transport', emojis: ['🚗', '🚁', '✈️', '🚢', '🚂', '🏍️'] }
  };

  // Game state
  const [gameState, setGameState] = useState('nameEntry');
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [firstPlayer, setFirstPlayer] = useState(1);
  const [playerNames, setPlayerNames] = useState({ 1: '', 2: '' });
  const [playerCategories, setPlayerCategories] = useState({ 1: null, 2: null });
  const [playerEmojis, setPlayerEmojis] = useState({ 1: [], 2: [] });
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameHistory, setGameHistory] = useState([]);
  const [coinToss, setCoinToss] = useState({ isFlipping: false, result: null, winner: null });

  // Sound effects
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    
    const sounds = {
      place: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      },
      vanish: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      },
      win: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();     
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);           
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
          }, i * 200);
        });
      },
      coinFlip: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(800 + i * 100, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
          }, i * 150);
        }
      }
    };
    
    try {
      sounds[type]?.();
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [soundEnabled]);

  // Check for winner
  const checkWinner = useCallback((boardState) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (boardState[a] && boardState[b] && boardState[c]) {
        if (boardState[a].player === boardState[b].player && 
            boardState[a].player === boardState[c].player) {
          return { winner: boardState[a].player, line };
        }
      }
    }
    return null;
  }, []);

  // Get random emoji from category
  const getRandomEmoji = useCallback((categoryKey) => {
    const category = emojiCategories[categoryKey];
    return category.emojis[Math.floor(Math.random() * category.emojis.length)];
  }, []);

  // Handle coin toss
  const handleCoinToss = () => {
    setCoinToss({ isFlipping: true, result: null, winner: null });
    playSound('coinFlip');
    
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 1 : 2;
      const winner = result;
      setCoinToss({ isFlipping: false, result, winner });
      setFirstPlayer(winner);
      setCurrentPlayer(winner);
    }, 2000);
  };

  // Handle cell click
  const handleCellClick = (index) => {
    if (gameState !== 'playing' || board[index] || winner) return;

    const newBoard = [...board];
    const playerHistory = [...gameHistory];
    const currentEmoji = getRandomEmoji(playerCategories[currentPlayer]);
    
    // Add to player's emoji history
    playerHistory.push({ player: currentPlayer, index, emoji: currentEmoji });
    
    // Get current player's emojis on board
    const currentPlayerEmojis = playerHistory.filter(move => 
      move.player === currentPlayer && newBoard[move.index]?.player === currentPlayer
    );

    // Handle vanishing rule (max 3 emojis per player)
    if (currentPlayerEmojis.length >= 3) {
      // Find oldest emoji position
      const oldestMove = currentPlayerEmojis[0];
      if (oldestMove && oldestMove.index !== index) {
        newBoard[oldestMove.index] = null;
        playSound('vanish');
      }
    }

    // Place new emoji
    newBoard[index] = { 
      player: currentPlayer, 
      emoji: currentEmoji,
      isNew: true 
    };
    
    setBoard(newBoard);
    setGameHistory(playerHistory);
    playSound('place');

    // Check for winner
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores(prev => ({ ...prev, [result.winner]: prev[result.winner] + 1 }));
      setGameState('gameOver');
      playSound('win');
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }

    // Remove isNew flag after animation
    setTimeout(() => {
      setBoard(prevBoard => 
        prevBoard.map(cell => 
          cell ? { ...cell, isNew: false } : null
        )
      );
    }, 300);
  };

  // Start new game
  const startNewGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer(firstPlayer);
    setWinner(null);
    setWinningLine([]);
    setGameHistory([]);
    setGameState('playing');
  };

  // Reset everything
  const resetAll = () => {
    setGameState('nameEntry');
    setBoard(Array(9).fill(null));
    setCurrentPlayer(1);
    setFirstPlayer(1);
    setPlayerNames({ 1: '', 2: '' });
    setPlayerCategories({ 1: null, 2: null });
    setPlayerEmojis({ 1: [], 2: [] });
    setWinner(null);
    setWinningLine([]);
    setScores({ 1: 0, 2: 0 });
    setGameHistory([]);
    setCoinToss({ isFlipping: false, result: null, winner: null });
  };

  // Name entry component
  const NameEntry = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌟 Blink Tac Toe</h1>
          <p className="text-gray-600">Enter player names to get started!</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 1 Name
            </label>
            <input
              type="text"
              value={playerNames[1]}
              onChange={(e) => setPlayerNames(prev => ({ ...prev, 1: e.target.value }))}
              placeholder="Enter Player 1 name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              maxLength={15}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 2 Name
            </label>
            <input
              type="text"
              value={playerNames[2]}
              onChange={(e) => setPlayerNames(prev => ({ ...prev, 2: e.target.value }))}
              placeholder="Enter Player 2 name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              maxLength={15}
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              if (playerNames[1].trim() && playerNames[2].trim()) {
                setGameState('coinToss');
              }
            }}
            disabled={!playerNames[1].trim() || !playerNames[2].trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200 flex items-center gap-2"
          >
            <Users size={20} />
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  // Coin toss component
  const CoinToss = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🪙 Coin Toss</h1>
          <p className="text-gray-600">Let's see who goes first!</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-center items-center space-x-8 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-2">
                👤
              </div>
              <div className="font-semibold text-blue-600">{playerNames[1] || 'Player 1'}</div>
              <div className="text-sm text-gray-500">Heads</div>
            </div>
            
            <div className="text-4xl">VS</div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-2xl mb-2">
                👤
              </div>
              <div className="font-semibold text-pink-600">{playerNames[2] || 'Player 2'}</div>
              <div className="text-sm text-gray-500">Tails</div>
            </div>
          </div>

          {/* Coin */}
          <div className="flex justify-center mb-6">
            <div className={`w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-6xl shadow-lg transition-transform duration-200 ${
              coinToss.isFlipping ? 'animate-spin' : ''
            }`}>
              {coinToss.isFlipping ? '🪙' : 
               coinToss.result === null ? '🪙' :
               coinToss.result === 1 ? '👑' : '🎯'}
            </div>
          </div>

          {/* Result */}
          {coinToss.winner && !coinToss.isFlipping && (
            <div className="mb-6">
              <div className="text-2xl font-bold text-green-600 mb-2">
                🎉 {playerNames[coinToss.winner]} wins the toss!
              </div>
              <div className="text-gray-600">
                You'll make the first move!
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!coinToss.result && (
            <button
              onClick={handleCoinToss}
              disabled={coinToss.isFlipping}
              className={`bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:scale-105 transition-transform duration-200 flex items-center gap-2 mx-auto ${
                coinToss.isFlipping ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Coins size={20} />
              {coinToss.isFlipping ? 'Flipping...' : 'Flip Coin'}
            </button>
          )}

          {coinToss.winner && (
            <button
              onClick={() => setGameState('setup')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:scale-105 transition-transform duration-200 flex items-center gap-2 mx-auto"
            >
              <Play size={20} />
              Choose Categories
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Category selection component
  const CategorySelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌟 Choose Categories</h1>
          <p className="text-gray-600">Select your emoji categories!</p>
        </div>

        <div className="space-y-6">
          {[1, 2].map(player => (
            <div key={player} className="border-2 border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">
                {playerNames[player]} - Choose Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(emojiCategories).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setPlayerCategories(prev => ({ ...prev, [player]: key }))}
                    disabled={Object.values(playerCategories).includes(key)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      playerCategories[player] === key
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : Object.values(playerCategories).includes(key)
                        ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{category.emojis[0]}</div>
                    <div className="font-medium text-sm">{category.name}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              if (playerCategories[1] && playerCategories[2]) {
                setGameState('playing');
              }
            }}
            disabled={!playerCategories[1] || !playerCategories[2]}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200 flex items-center gap-2"
          >
            <Play size={20} />
            Start Game
          </button>
        </div>
      </div>
    </div>
  );

  // Help modal
  const HelpModal = () => (
    showHelp && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">How to Play</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🎯 Objective</h4>
              <p>Get 3 of your emojis in a row (horizontal, vertical, or diagonal) to win!</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">✨ Special Rules</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Each player can only have 3 emojis on the board at once</li>
                <li>When you place a 4th emoji, your oldest emoji disappears</li>
                <li>You get a random emoji from your chosen category each turn</li>
                <li>The 4th emoji cannot be placed where your 1st emoji was</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎮 Controls</h4>
              <p>Click any empty cell to place your emoji. The game alternates between players automatically.</p>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Game board component
  const GameBoard = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">🌟 Blink Tac Toe</h1>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-white hover:text-yellow-300 transition-colors"
            >
              {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHelp(true)}
              className="text-white hover:text-yellow-300 transition-colors"
            >
              <HelpCircle size={24} />
            </button>
            <button
              onClick={resetAll}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2"
            >
              <RotateCcw size={16} />
              New Game
            </button>
          </div>
        </div>

        {/* Score Board */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={20} className="text-yellow-400" />
                  <span className="font-semibold">Scores</span>
                </div>
                <div className="flex gap-6">
                  <span>{playerNames[1]}: {scores[1]}</span>
                  <span>{playerNames[2]}: {scores[2]}</span>
                </div>
              </div>
            </div>
            <div className="text-white text-right">
              <div className="font-semibold mb-1">Current Turn</div>
              <div className={`text-lg px-4 py-2 rounded-full ${
                currentPlayer === 1 ? 'bg-blue-500' : 'bg-pink-500'
              }`}>
                {playerNames[currentPlayer]}
              </div>
            </div>
          </div>
        </div>

        {/* Category Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2].map(player => (
            <div key={player} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white text-center">
                <div className="font-semibold mb-2">{playerNames[player]}</div>
                <div className="text-2xl mb-2">
                  {emojiCategories[playerCategories[player]].emojis.slice(0, 3).join(' ')}
                </div>
                <div className="text-sm opacity-80">
                  {emojiCategories[playerCategories[player]].name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Board */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameState !== 'playing' || winner}
                className={`aspect-square bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 hover:bg-opacity-30 hover:scale-105 ${
                  cell?.isNew ? 'animate-bounce' : ''
                } ${
                  winningLine.includes(index) ? 'bg-yellow-400 bg-opacity-50 animate-pulse' : ''
                }`}
              >
                {cell?.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Game Over */}
        {winner && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {playerNames[winner]} Wins!
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={startNewGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform duration-200 flex items-center gap-2"
              >
                <Play size={20} />
                Play Again
              </button>
              <button
                onClick={resetAll}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform duration-200 flex items-center gap-2"
              >
                <RotateCcw size={20} />
                New Game
              </button>
            </div>
          </div>
        )}
      </div>

      <HelpModal />
    </div>
  );

  return (
    <div className="font-sans">
      {gameState === 'nameEntry' && <NameEntry />}
      {gameState === 'coinToss' && <CoinToss />}
      {gameState === 'setup' && <CategorySelection />}
      {(gameState === 'playing' || gameState === 'gameOver') && <GameBoard />}
    </div>
  );
};

export default BlinkTacToe;