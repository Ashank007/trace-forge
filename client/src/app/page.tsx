'use client';

import { useState, useRef, useEffect } from 'react';
import ArrayVisualizer from '@/components/ArrayVisualizer';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';

export default function Home() {
  const [code, setCode] = useState(`arr = [1, 2, 3]\nsum = 0\nfor i in range(len(arr)):\n    sum += arr[i]\nprint(sum)`);
  const [trace, setTrace] = useState<any[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [language, setLanguage] = useState('python');
  const editorViewRef = useRef<EditorView | null>(null);

  const languageExtensions = {
    python: python(),
    javascript: javascript(),
    cpp: cpp(),
    java: java(),
  };

  const runCode = async () => {
    try {
      const res = await fetch('http://localhost:8000/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setTrace(data.trace);
      setStepIndex(0);
    } catch (error) {
      console.error('❌ Error tracing code:', error);
    }
  };

  const nextStep = () => setStepIndex((prev) => Math.min(prev + 1, trace.length - 1));
  const prevStep = () => setStepIndex((prev) => Math.max(prev - 1, 0));
  const currentStep = trace[stepIndex];

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4 space-y-6 text-white">
      {/* Language selector */}
      <div className="mb-2">
       <label className="text-sm font-semibold text-gray-300 mr-2">🗣 Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-[#1f1f1f] text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="python">🐍 Python</option>
          <option value="javascript">🟨 JavaScript</option>
          <option value="cpp">💻 C++</option>
          <option value="java">☕ Java</option>
        </select>
      </div>

      <CodeMirror
        value={code}
        height="400px"
        theme="dark"
        extensions={[languageExtensions[language], EditorView.lineWrapping]}
        onChange={(val) => setCode(val)}
        onCreateEditor={(view) => {
          editorViewRef.current = view;
        }}
      />

      <div className="flex gap-4 mt-2">
        <button
          onClick={runCode}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          ▶ Run & Visualize
        </button>
        <button
          onClick={prevStep}
          className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
        >
          ◀ Prev
        </button>
        <button
          onClick={nextStep}
          className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
        >
          Next ▶
        </button>
        <span className="mt-2 text-sm text-gray-300">
          Step {stepIndex + 1} / {trace.length}
        </span>
      </div>

      {currentStep && (
        <>
          <div className="bg-black text-green-400 p-4 rounded shadow mt-4">
            <h3 className="font-bold text-white mb-2">🔍 Variable State:</h3>
            <pre>{JSON.stringify(currentStep.locals, null, 2)}</pre>
          </div>

          <div className="mt-4">
            <h3 className="text-white font-bold mb-2">📦 Array Visualizer</h3>
            <ArrayVisualizer locals={currentStep.locals} />
          </div>
        </>
      )}
    </div>
  );
}


