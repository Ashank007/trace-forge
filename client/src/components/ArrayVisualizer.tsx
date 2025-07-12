'use client';

import React from 'react';

type ArrayVisualizerProps = {
  locals: Record<string, any>;
};

const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ locals }) => {
  // Find first list in locals
  const arrayEntry = Object.entries(locals).find(
    ([_, value]) => Array.isArray(value)
  );

  if (!arrayEntry) return null;

  const [arrayName, array] = arrayEntry;

  // Try to find pointer variable (like 'i', 'j', etc.)
  const pointerIndex = typeof locals.i === 'number' ? locals.i : null;

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold text-white mb-2">📦 {arrayName} (Array)</h2>
      <div className="flex space-x-2">
        {array.map((val: any, idx: number) => (
          <div
            key={idx}
            className={`w-12 h-12 border rounded flex items-center justify-center text-white text-lg ${
              pointerIndex === idx
                ? 'bg-yellow-400 text-black font-bold'
                : 'bg-gray-800'
            }`}
          >
            {val}
          </div>
        ))}
      </div>
      {pointerIndex !== null && (
        <p className="text-sm text-gray-300 mt-1 ml-2">👆 i = {pointerIndex}</p>
      )}
    </div>
  );
};

export default ArrayVisualizer;

