'use client';

interface TraceStepperProps {
  trace: any[];
  stepIndex: number;
  setStepIndex: (i: number) => void;
}

export default function TraceStepper({ trace, stepIndex, setStepIndex }: TraceStepperProps) {
  return (
    <div className="mt-6 bg-[#1a1a1a] p-4 rounded text-sm text-gray-300">
      <h3 className="font-semibold text-white mb-2">🧭 Execution Steps:</h3>
      <div className="overflow-x-auto whitespace-nowrap">
        {trace.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setStepIndex(idx)}
            className={`inline-block px-2 py-1 mx-1 rounded ${
              idx === stepIndex ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

