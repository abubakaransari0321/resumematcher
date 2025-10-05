import React from 'react';

const Test = () => {
  return (
    <div className="min-h-screen pt-24 px-4 flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">
          🎉 TEST PAGE WORKS!
        </h1>
        <p className="text-xl text-green-400 mb-6">
          This proves routing is working on Vercel
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg">
            <p className="text-green-300">✅ Route: /test</p>
            <p className="text-green-300">✅ Component loaded successfully</p>
            <p className="text-green-300">✅ Vercel SPA routing working</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mr-4"
          >
            Go to Home
          </button>
          <button
            onClick={() => window.location.href = '/results'}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Test Results Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;