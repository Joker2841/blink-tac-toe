import React, { useState } from 'react';

function App() {
  const emojiCategories = {
    animals: { name: 'Animals', emojis: ['🐶', '🐱', '🐵', '🐰', '🦊', '🐸'] },
    food: { name: 'Food', emojis: ['🍕', '🍟', '🍔', '🍩', '🌮', '🍎'] },
    sports: { name: 'Sports', emojis: ['⚽', '🏀', '🏈', '🎾', '🏐', '🎱'] },
    nature: { name: 'Nature', emojis: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼'] }
  };

  const [gameState, setGameState] = useState('setup');
  const [playerCategories, setPlayerCategories] = useState({ 1: null, 2: null });
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(1);

  const getRandomEmoji = (categoryKey) => {
    const category = emojiCategories[categoryKey];
    return category.emojis[Math.floor(Math.random() * category.emojis.length)];
  };

  const handleCellClick = (index) => {
    if (board[index]) return;
    
    const newBoard = [...board];
    const emoji = getRandomEmoji(playerCategories[currentPlayer]);
    newBoard[index] = { player: currentPlayer, emoji };
    
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const GameBoard = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-4">🌟 Blink Tac Toe</h1>
        
        <div className="bg-white bg-opacity-10 rounded-2xl p-4 mb-6 text-white text-center">
          <div className="text-lg font-semibold">Player {currentPlayer}'s Turn</div>
          <div className="text-sm opacity-80">
            Category: {emojiCategories[playerCategories[currentPlayer]].name}
          </div>
        </div>

        <div className="bg-white bg-opacity-10 rounded-3xl p-6">
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                className="aspect-square bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl transition-all hover:bg-opacity-30"
              >
                {cell?.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const CategorySelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">🌟 Blink Tac Toe</h1>
        
        {[1, 2].map(player => (
          <div key={player} className="mb-8 p-6 border-2 border-gray-200 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Player {player} - Choose Category
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(emojiCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setPlayerCategories(prev => ({ ...prev, [player]: key }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    playerCategories[player] === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.emojis[0]}</div>
                  <div className="font-medium">{category.name}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
        
        <button
          onClick={() => setGameState('playing')}
          disabled={!playerCategories[1] || !playerCategories[2]}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-full font-semibold disabled:opacity-50"
        >
          Start Game
        </button>
      </div>
    </div>
  );

  return gameState === 'setup' ? <CategorySelection /> : <GameBoard />;
}

export default App;