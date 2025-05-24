import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, HelpCircle, Volume2, VolumeX, Trophy, Star, Coins, Skull } from 'lucide-react';

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
  const [gameState, setGameState] = useState('setup');
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerCategories, setPlayerCategories] = useState({ 1: null, 2: null });
  const [playerEmojis, setPlayerEmojis] = useState({ 1: [], 2: [] });
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameHistory, setGameHistory] = useState([]);
  
  // Coin toss state
  const [isFlipping, setIsFlipping] = useState(false);
  const [tossResult, setTossResult] = useState(null);
  const [showTossResult, setShowTossResult] = useState(false);
  const [tossWinner, setTossWinner] = useState(null);

// Sound effects with improvements
const playSound = useCallback((type) => {
  if (!soundEnabled) return;
  
  // Reuse audio context to avoid performance issues
  const getAudioContext = (() => {
    let context = null;
    return () => {
      if (!context || context.state === 'closed') {
        context = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (context.state === 'suspended') {
        context.resume();
      }
      return context;
    };
  })();
  
  const createOscillator = (audioContext, frequency, gain = 0.3, duration = 0.2) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    return { oscillator, gainNode };
  };
  
  const sounds = {
    place: () => {
      const audioContext = getAudioContext();
      const { oscillator } = createOscillator(audioContext, 600, 0.25, 0.15);
      
      oscillator.type = 'square'; // More pleasant tone
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    },
    
    vanish: () => {
      const audioContext = getAudioContext();
      const { oscillator, gainNode } = createOscillator(audioContext, 400, 0.2, 0.4);
      
      oscillator.type = 'sawtooth';
      // Swoosh effect - frequency drops
      oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    },
    
    win: () => {
      const audioContext = getAudioContext();
      // Victory fanfare - C, E, G major chord progression
      const melody = [
        { freq: 523.25, time: 0 },     // C5
        { freq: 659.25, time: 0.15 },  // E5
        { freq: 783.99, time: 0.3 },   // G5
        { freq: 1046.5, time: 0.45 }   // C6
      ];
      
      melody.forEach(({ freq, time }) => {
        setTimeout(() => {
          const { oscillator } = createOscillator(audioContext, freq, 0.25, 0.3);
          oscillator.type = 'triangle';
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }, time * 1000);
      });
    },
    
    coinFlip: () => {
      const audioContext = getAudioContext();
      const { oscillator } = createOscillator(audioContext, 300, 0.15, 0.4);
      
      oscillator.type = 'square';
      // Coin flip wobble effect
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(500, audioContext.currentTime + 0.1);
      oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.2);
      oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.3);
      oscillator.frequency.linearRampToValueAtTime(350, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    },
    
    tossWin: () => {
      const audioContext = getAudioContext();
      // Ascending happy tune
      const notes = [349.23, 392.00, 440.00, 523.25]; // F, G, A, C
      
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const { oscillator } = createOscillator(audioContext, freq, 0.2, 0.25);
          oscillator.type = 'sine';
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.25);
        }, i * 120);
      });
    },
    
    error: () => {
      const audioContext = getAudioContext();
      const { oscillator } = createOscillator(audioContext, 200, 0.3, 0.2);
      
      oscillator.type = 'sawtooth';
      // Harsh error sound
      oscillator.frequency.linearRampToValueAtTime(150, audioContext.currentTime + 0.1);
      oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    },
    
    hover: () => {
      const audioContext = getAudioContext();
      const { oscillator } = createOscillator(audioContext, 800, 0.1, 0.1);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    },
    
    tick: () => {
      const audioContext = getAudioContext();
      const { oscillator } = createOscillator(audioContext, 1000, 0.15, 0.05);
      
      oscillator.type = 'square';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    }
  };
  
  try {
    sounds[type]?.();
  } catch (e) {
    console.warn('Audio playback failed:', e.message);
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
    setIsFlipping(true);
    setShowTossResult(false);
    playSound('coinFlip');
    
    // Simulate coin flip delay
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const winner = Math.random() < 0.5 ? 1 : 2;
      
      setTossResult(result);
      setTossWinner(winner);
      setCurrentPlayer(winner);
      setIsFlipping(false);
      setShowTossResult(true);
      playSound('tossWin');
    }, 2000);
  };

// Handle cell click
const handleCellClick = (index) => {
  if (gameState !== 'playing' || board[index] || winner) return;

  const newBoard = [...board];
  let playerHistory = [...gameHistory];
  const currentEmoji = getRandomEmoji(playerCategories[currentPlayer]);
  

  const currentPlayerPositions = [];
  for (let i = 0; i < newBoard.length; i++) {
    if (newBoard[i] && newBoard[i].player === currentPlayer) {
      currentPlayerPositions.push(i);
    }
  }

  const positionsWithOrder = currentPlayerPositions.map(pos => {
    for (let j = playerHistory.length - 1; j >= 0; j--) {
      const move = playerHistory[j];
      if (move.player === currentPlayer && move.index === pos) {
        return {
          index: pos,
          placementOrder: j 
        };
      }
    }
    return null;
  }).filter(item => item !== null);


  positionsWithOrder.sort((a, b) => a.placementOrder - b.placementOrder);

  if (positionsWithOrder.length >= 3) {
    const oldestEmojiIndex = positionsWithOrder[0].index;
    if (index === oldestEmojiIndex) {
      playSound('error');
      return;
    }
    newBoard[oldestEmojiIndex] = null;
    playSound('vanish');

    playerHistory.push({ 
      player: currentPlayer, 
      index: oldestEmojiIndex, 
      emoji: null,
      action: 'remove'
    });
  }

  newBoard[index] = { 
    player: currentPlayer, 
    emoji: currentEmoji,
    isNew: true 
  };
  
  playerHistory.push({ 
    player: currentPlayer, 
    index, 
    emoji: currentEmoji,
    action: 'place'
  });
  
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
    setWinner(null);
    setWinningLine([]);
    setGameHistory([]);
    setGameState('toss');
    setTossResult(null);
    setShowTossResult(false);
    setTossWinner(null);
  };

  // Reset everything
  const resetAll = () => {
    setGameState('setup');
    setBoard(Array(9).fill(null));
    setCurrentPlayer(1);
    setPlayerCategories({ 1: null, 2: null });
    setPlayerEmojis({ 1: [], 2: [] });
    setWinner(null);
    setWinningLine([]);
    setScores({ 1: 0, 2: 0 });
    setGameHistory([]);
    setTossResult(null);
    setShowTossResult(false);
    setTossWinner(null);
  };

  // Category selection component
  const CategorySelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden flex items-center justify-center p-4">
      {/* */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-6xl text-white animate-pulse">💀</div>
        <div className="absolute top-32 right-20 text-4xl text-white animate-pulse delay-1000">☠️</div>
        <div className="absolute bottom-20 left-32 text-5xl text-white animate-pulse delay-500">💀</div>
        <div className="absolute bottom-40 right-10 text-3xl text-white animate-pulse delay-1500">⚰️</div>
        <div className="absolute top-1/2 left-1/4 text-4xl text-white animate-pulse delay-2000">👻</div>
        <div className="absolute top-1/3 right-1/3 text-5xl text-white animate-pulse delay-700">💀</div>
      </div>
      
      <div className="bg-black bg-opacity-80 backdrop-blur-sm border border-gray-600 rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Skull className="text-red-500" size={40} />
            Blink Tac Toe
            <Skull className="text-red-500" size={40} />
          </h1>
          <p className="text-gray-300">Choose your emoji categories to begin the game...</p>
        </div>

        <div className="space-y-6">
          {[1, 2].map(player => (
            <div key={player} className="border-2 border-gray-600 bg-gray-900 bg-opacity-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-center text-white">
                Player {player} - Choose Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(emojiCategories).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setPlayerCategories(prev => ({ ...prev, [player]: key }))}
                    disabled={Object.values(playerCategories).includes(key)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      playerCategories[player] === key
                        ? 'border-red-500 bg-red-900 bg-opacity-30 scale-105 shadow-lg shadow-red-500/50'
                        : Object.values(playerCategories).includes(key)
                        ? 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
                        : 'border-gray-600 bg-gray-800 hover:border-red-400 hover:bg-red-900 hover:bg-opacity-20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{category.emojis[0]}</div>
                    <div className="font-medium text-sm text-gray-300">{category.name}</div>
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
                setGameState('toss');
              }
            }}
            disabled={!playerCategories[1] || !playerCategories[2]}
            className="bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-3 rounded-full font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200 flex items-center gap-2 shadow-lg"
          >
            <Coins size={20} />
            Continue to Coin Toss
          </button>
        </div>
      </div>
    </div>
  );

  // Coin toss component
  const CoinToss = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden flex items-center justify-center p-4">
      {/* Haunting background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-16 text-8xl text-white animate-pulse">💀</div>
        <div className="absolute bottom-32 right-24 text-6xl text-white animate-pulse delay-1000">⚰️</div>
        <div className="absolute top-1/2 right-10 text-7xl text-white animate-pulse delay-500">👻</div>
      </div>
      
      <div className="bg-black bg-opacity-80 backdrop-blur-sm border border-gray-600 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            💀 Coin Toss 💀
          </h1>
          <p className="text-gray-300">The spirits will decide who goes first...</p>
        </div>

        {/* Player Categories Display */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[1, 2].map(player => (
            <div key={player} className="bg-gray-900 bg-opacity-50 border border-gray-600 rounded-xl p-4">
              <div className="font-semibold text-white mb-2">Player {player}</div>
              <div className="text-2xl mb-2">
                {emojiCategories[playerCategories[player]].emojis.slice(0, 3).join(' ')}
              </div>
              <div className="text-sm text-gray-400">
                {emojiCategories[playerCategories[player]].name}
              </div>
            </div>
          ))}
        </div>

        {/* Coin Display */}
        <div className="mb-8">
          <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-4 border-gray-500 shadow-lg flex items-center justify-center text-4xl font-bold text-white transition-transform duration-200 ${
            isFlipping ? 'animate-spin' : ''
          }`}>
            {isFlipping ? '🪙' : tossResult === 'heads' ? '👑' : tossResult === 'tails' ? '⭐' : '🪙'}
          </div>
        </div>

        {/* Toss Button or Result */}
        {!showTossResult ? (
          <button
            onClick={handleCoinToss}
            disabled={isFlipping}
            className={`bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg ${
              isFlipping 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 hover:shadow-xl'
            }`}
          >
            <Coins size={20} />
            {isFlipping ? 'Flipping...' : 'Flip Coin'}
          </button>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-900 to-gray-900 border border-red-600 rounded-2xl p-6">
              <div className="text-6xl mb-2">🎭</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Player {tossWinner} Goes First!
              </h3>
              <div className="text-3xl">
                {emojiCategories[playerCategories[tossWinner]].emojis[0]}
              </div>
            </div>
            
            <button
              onClick={() => setGameState('playing')}
              className="bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-3 rounded-full font-semibold text-lg hover:scale-105 transition-transform duration-200 flex items-center gap-2 mx-auto shadow-lg"
            >
              <Play size={20} />
              Begin the Game
            </button>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => setGameState('setup')}
            className="text-gray-400 hover:text-gray-200 underline"
          >
            ← Back to Category Selection
          </button>
        </div>
      </div>
    </div>
  );

  // Help modal
  const HelpModal = () => (
    showHelp && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-900 border border-gray-600 rounded-2xl p-6 max-w-lg w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">How to Play</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold mb-3 text-lg text-white">🎯 Objective</h4>
              <p>Get 3 of your emojis in a row (horizontal, vertical, or diagonal) to win!</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-white">✨ Special Rules</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Each player can only have 3 emojis on the board at once</li>
                <li>When you place a 4th emoji, your oldest emoji disappears</li>
                <li>You get a random emoji from your chosen category each turn</li>
                <li>The 4th emoji cannot be placed where your 1st emoji was</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-lg text-white">🪙 Game Setup</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-2 text-white">1. Choose Categories</p>
                  <p className="text-sm text-gray-400 ml-4">Each player selects a different emoji category for their pieces</p>
                </div>
                
                <div>
                  <p className="font-medium mb-2 text-white">2. Coin Toss</p>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm text-gray-400">Flip a coin to determine the starting player</p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2 text-white">3. Begin Game</p>
                  <p className="text-sm text-gray-400 ml-4">The coin toss winner makes the first move</p>
                </div>
              </div>
              <h4 className="font-semibold mb-3 text-lg text-white mt-4">🎮 Controls</h4>
              <p>Click any empty cell to place your emoji. The game alternates between players automatically.</p>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Game board component - continuing from where it was cut off
  const GameBoard = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden p-4">
      {/*  */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-9xl text-white animate-pulse">💀</div>
        <div className="absolute top-40 right-16 text-7xl text-white animate-pulse delay-1000">⚰️</div>
        <div className="absolute bottom-20 left-20 text-8xl text-white animate-pulse delay-500">👻</div>
        <div className="absolute bottom-32 right-32 text-6xl text-white animate-pulse delay-1500">🕷️</div>
        <div className="absolute top-1/2 left-1/3 text-7xl text-white animate-pulse delay-2000">🦇</div>
        <div className="absolute top-1/4 right-1/4 text-8xl text-white animate-pulse delay-700">💀</div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Skull className="text-red-500" size={32} />
              Blink Tac Toe
            </h1>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHelp(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <HelpCircle size={24} />
            </button>
            <button
              onClick={resetAll}
              className="bg-red-800 bg-opacity-60 hover:bg-opacity-80 text-white px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 border border-red-600"
            >
              <RotateCcw size={16} />
              New Setup
            </button>
          </div>
        </div>

        {/* Score Board */}
        <div className="bg-black bg-opacity-60 backdrop-blur-sm border border-gray-600 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={20} className="text-yellow-400" />
                  <span className="font-semibold">Scores</span>
                </div>
                <div className="flex gap-6">
                  <span>Player 1: {scores[1]}</span>
                  <span>Player 2: {scores[2]}</span>
                </div>
              </div>
            </div>
            <div className="text-white text-right">
              <div className="font-semibold mb-1">Current Turn</div>
              {/* Enhanced current player indicator */}
              <div className={`text-2xl px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                currentPlayer === 1 
                  ? 'bg-red-600 border-red-400 shadow-lg shadow-red-500/50 animate-pulse' 
                  : 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/50 animate-pulse'
              }`}>
                <div className="flex items-center gap-2">
                  <span>Player {currentPlayer}</span>
                  <span>{emojiCategories[playerCategories[currentPlayer]]?.emojis[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Categories Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2].map(player => (
            <div 
              key={player} 
              className={`bg-black bg-opacity-40 backdrop-blur-sm border rounded-2xl p-4 transition-all duration-300 ${
                currentPlayer === player 
                  ? player === 1 
                    ? 'border-red-500 shadow-lg shadow-red-500/30' 
                    : 'border-blue-500 shadow-lg shadow-blue-500/30'
                  : 'border-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold text-white mb-2">Player {player}</div>
                <div className="text-2xl mb-2">
                  {playerCategories[player] ? 
                    emojiCategories[playerCategories[player]].emojis.slice(0, 4).join(' ') 
                    : ''}
                </div>
                <div className="text-sm text-gray-400">
                  {playerCategories[player] ? emojiCategories[playerCategories[player]].name : ''}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Board */}
        <div className="bg-black bg-opacity-60 backdrop-blur-sm border border-gray-600 rounded-3xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 aspect-square max-w-md mx-auto">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                onMouseEnter={() => playSound('hover')}
                className={`aspect-square rounded-2xl border-2 text-5xl flex items-center justify-center transition-all duration-300 hover:scale-105 relative overflow-hidden ${
                  winner && winningLine.includes(index)
                    ? 'border-yellow-400 bg-yellow-900 bg-opacity-30 shadow-lg shadow-yellow-500/50 animate-pulse'
                    : cell
                    ? 'border-gray-500 bg-gray-800 bg-opacity-50'
                    : 'border-gray-600 bg-gray-900 bg-opacity-30 hover:border-gray-400 hover:bg-gray-800 hover:bg-opacity-50 cursor-pointer'
                } ${cell?.isNew ? 'animate-bounce' : ''}`}
                disabled={winner || gameState !== 'playing'}
              >
                {/* Cell content */}
                <div className={`transition-all duration-300 ${cell?.isNew ? 'scale-110' : 'scale-100'}`}>
                  {cell?.emoji}
                </div>
                
                {/* Hover preview for empty cells */}
                {!cell && !winner && gameState === 'playing' && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-30 transition-opacity duration-200 text-3xl">
                    {playerCategories[currentPlayer] ? getRandomEmoji(playerCategories[currentPlayer]) : ''}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Game Status */}
        {winner && (
          <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-600 rounded-3xl p-8 mb-6 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Player {winner} Wins!
            </h2>
            <div className="text-4xl mb-4">
              {playerCategories[winner] ? emojiCategories[playerCategories[winner]].emojis[0] : ''}
            </div>
            <div className="space-y-4">
              <button
                onClick={startNewGame}
                className="bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-3 rounded-full font-semibold text-lg hover:scale-105 transition-transform duration-200 flex items-center gap-2 mx-auto shadow-lg"
              >
                <Play size={20} />
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Current Game Info */}
        {!winner && gameState === 'playing' && (
          <div className="bg-black bg-opacity-40 backdrop-blur-sm border border-gray-600 rounded-2xl p-4 text-center">
            <div className="text-gray-300 mb-2">
              Next emoji will be from: <span className="font-semibold text-white">
                {playerCategories[currentPlayer] ? emojiCategories[playerCategories[currentPlayer]].name : ''}
              </span>
            </div>
            <div className="text-2xl">
              {playerCategories[currentPlayer] ? 
                emojiCategories[playerCategories[currentPlayer]].emojis.join(' ') 
                : ''}
            </div>
          </div>
        )}
      </div>

      {/* Help Modal */}
      <HelpModal />
    </div>
  );

  // Game Over Screen
  const GameOverScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden flex items-center justify-center p-4">
      {/* Celebration background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 text-8xl text-yellow-400 animate-bounce">🎉</div>
        <div className="absolute bottom-32 right-32 text-6xl text-yellow-400 animate-bounce delay-500">🏆</div>
        <div className="absolute top-1/2 right-20 text-7xl text-yellow-400 animate-bounce delay-1000">⭐</div>
        <div className="absolute bottom-20 left-32 text-5xl text-yellow-400 animate-bounce delay-1500">🎊</div>
      </div>
      
      <div className="bg-black bg-opacity-80 backdrop-blur-sm border border-yellow-600 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center relative z-10">
        <div className="mb-8">
          <div className="text-8xl mb-4 animate-pulse">🏆</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Victory!
          </h1>
          <h2 className="text-2xl text-yellow-400 mb-6">
            Player {winner} Wins!
          </h2>
          <div className="text-6xl mb-4">
            {winner && playerCategories[winner] ? emojiCategories[playerCategories[winner]].emojis[0] : ''}
          </div>
        </div>

        {/* Final Scores */}
        <div className="bg-gray-900 bg-opacity-50 border border-gray-600 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center gap-2">
            <Trophy size={24} className="text-yellow-400" />
            Final Scores
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(player => (
              <div key={player} className={`p-4 rounded-xl border-2 ${
                player === winner 
                  ? 'border-yellow-500 bg-yellow-900 bg-opacity-30' 
                  : 'border-gray-600 bg-gray-800 bg-opacity-50'
              }`}>
                <div className="text-2xl mb-2">
                  {playerCategories[player] ? emojiCategories[playerCategories[player]].emojis[0] : ''}
                </div>
                <div className="font-semibold text-white">Player {player}</div>
                <div className="text-2xl font-bold text-white">{scores[player]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={startNewGame}
            className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <Play size={20} />
            Play Again
          </button>
          
          <button
            onClick={resetAll}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <RotateCcw size={20} />
            New Game Setup
          </button>
        </div>
      </div>
    </div>
  );

  // Main render logic
  return (
    <div className="font-sans">
      {gameState === 'setup' && <CategorySelection />}
      {gameState === 'toss' && <CoinToss />}
      {(gameState === 'playing' || gameState === 'gameOver') && <GameBoard />}
    </div>
  );
};

export default BlinkTacToe;