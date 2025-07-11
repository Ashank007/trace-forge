'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const MonacoEditor = dynamic(() => import('react-monaco-editor'), { ssr: false });

export default function Home() {
  const [code, setCode] = useState(`arr = [1, 2, 3]\nsum = 0\nfor i in range(len(arr)):\n    sum += arr[i]\nprint(sum)`);
  const [trace, setTrace] = useState<any[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const runCode = async () => {
    const res = await fetch("http://localhost:8000/trace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setTrace(data.trace);
    setStepIndex(0); // reset to start
  };

  const nextStep = () => {
    setStepIndex((prev) => Math.min(prev + 1, trace.length - 1));
  };

  const prevStep = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const currentStep = trace[stepIndex];

  return (
    <div className="p-4 space-y-4">
      <MonacoEditor
        height="400"
        language="python"
        theme="vs-dark"
        value={code}
        onChange={(val) => setCode(val || '')}
        options={{
          readOnly: true,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          selectOnLineNumbers: true,
        }}
      />
      <div className="flex space-x-4">
        <button onClick={runCode} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Run & Visualize
        </button>
        <button onClick={prevStep} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          ◀ Prev
        </button>
        <button onClick={nextStep} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          Next ▶
        </button>
        <span className="text-sm text-gray-300 mt-2">Step {stepIndex + 1} / {trace.length}</span>
      </div>

      {currentStep && (
        <div className="bg-black text-green-400 p-4 rounded">
          <h3 className="font-bold text-white mb-2">🔍 Variable State:</h3>
          <pre>{JSON.stringify(currentStep.locals, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}


