'use client';

import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { EditorView } from '@codemirror/view';
import VariableTimelineChart from '@/components/VariableTimelineChart';
import TraceStepper from '@/components/TraceStepper';
import ArrayVisualizer from '@/components/ArrayVisualizer';

export default function Home() {
  const [code, setCode] = useState(`arr = [1, 2, 3]\nsum = 0\nfor i in range(len(arr)):\n    sum += arr[i]\nprint(sum)`);
  const [trace, setTrace] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<Record<string, [number, any][]>>({});
  const [stepIndex, setStepIndex] = useState(0);

  const runCode = async () => {
    try {
      const res = await fetch('http://localhost:8000/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'python' }),
      });
      const data = await res.json();
      console.log(data);
      
      setTrace(data.trace.trace || []);
      setTimeline(data.trace.timeline || {});
      setStepIndex(0);
    } catch (err) {
      console.error(err);
    }
  };

  const nextStep = () => setStepIndex((i) => Math.min(i + 1, trace.length - 1));
  const prevStep = () => setStepIndex((i) => Math.max(i - 1, 0));

  const current = trace[stepIndex];

  // Helper: Extract variable state at current step from timeline
  const getTimelineAtStep = (step: number) => {
    const currentTimeline: Record<string, any> = {};
    for (const [variable, steps] of Object.entries(timeline)) {
      const entry = (steps as [number, any][]).find(([s]) => s === step);
      if (entry) currentTimeline[variable] = entry[1];
    }
    return currentTimeline;
  };

  const timelineAtStep = getTimelineAtStep(stepIndex);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      <h1 className="text-xl font-bold mb-2">🧪 Python Code Visualizer</h1>

      <CodeMirror
        value={code}
        height="400px"
        extensions={[python(), EditorView.lineWrapping]}
        theme="dark"
        onChange={setCode}
      />

      <div className="flex gap-4 mt-4">
        <button onClick={runCode} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">▶ Run</button>
        <button onClick={prevStep} className="bg-gray-700 px-4 py-2 rounded">◀ Prev</button>
        <button onClick={nextStep} className="bg-gray-700 px-4 py-2 rounded">Next ▶</button>
        <span className="text-sm mt-2 text-gray-300">Step {stepIndex + 1} / {trace.length}</span>
      </div>

      {current && (
        <>
          <div className="mt-6 bg-black p-4 rounded">
            <h2 className="font-semibold text-green-400 mb-2">🔍 Locals:</h2>
            <pre className="text-green-300 text-sm">{JSON.stringify(current.locals, null, 2)}</pre>

            {current.branch && (
              <p className={`mt-2 font-bold ${
                current.branch === 'if' ? 'text-blue-400' :
                current.branch === 'else' ? 'text-yellow-400' :
                'text-gray-400'
              }`}>
                🛤️ Branch: {current.branch.toUpperCase()}
              </p>
            )}
          </div>


          {trace.length > 0 && (
            <>
              {/* Existing Step Viewer */}
              <TraceStepper trace={trace} stepIndex={stepIndex} setStepIndex={setStepIndex} />
              
              {/* New Timeline Chart Here */}
              <VariableTimelineChart timeline={timeline} />
            </>
          )}

          <ArrayVisualizer locals={current.locals} />
        </>
      )}
    </div>
  );
}


