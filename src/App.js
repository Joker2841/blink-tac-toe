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

  return gameState === 'setup' ? <CategorySelection /> : <div>Game Board Coming Soon...</div>;
}

export default App;