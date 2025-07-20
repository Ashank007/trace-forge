'use client';

interface VariableTimelineChartProps {
  timeline: Record<string, [number, any][]>;
}

export default function VariableTimelineChart({ timeline }: VariableTimelineChartProps) {
  return (
    <div className="mt-8 p-6 bg-[#121212] border border-gray-700 rounded-lg text-white shadow-md">
      <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">
        📊 Variable Timeline
      </h2>

      {Object.keys(timeline).length === 0 ? (
        <p className="text-gray-400 italic">No variable history to display.</p>
      ) : (
        Object.entries(timeline).map(([varName, changes]) => (
          <div key={varName} className="mb-6">
            <h3 className="text-blue-400 font-medium text-md mb-2">{varName}</h3>
            <div className="relative w-full overflow-x-auto">
              <div className="flex gap-4 text-sm">
                {changes.map(([step, value], idx) => (
                  <div
                    key={idx}
                    className="min-w-[100px] px-3 py-2 bg-gray-800 rounded-lg text-center shadow-sm border border-gray-600"
                    title={`Step ${step}`}
                  >
                    <div className="text-xs text-gray-400 mb-1">Step #{step}</div>
                    <div className="font-mono text-yellow-300 break-words text-sm">
                      {JSON.stringify(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}


