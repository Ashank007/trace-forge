'use client';

import { useState, useRef, useEffect } from 'react';
import ArrayVisualizer from '@/components/ArrayVisualizer';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { EditorView, Decoration } from '@codemirror/view';
import { StateEffect, StateField, Compartment, EditorState, Extension } from '@codemirror/state';

// Define a Compartment for the line highlight extension
const lineHighlightCompartment = new Compartment();

// Define a StateEffect type for updating the line highlight
const setLineHighlight = StateEffect.define<number | null>();

// Define a StateField that manages the line highlight decoration
const lineHighlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none; // Start with no decorations
  },
  update(decorations, tr) {
    let newDecorations = decorations.map(tr.changes); // Apply document changes to existing decorations

    for (const effect of tr.effects) {
      if (effect.is(setLineHighlight)) {
        if (effect.value === null) {
          return Decoration.none; // Clear all decorations
        } else {
          const lineNum = effect.value;
          // Ensure the line number is valid
          if (lineNum > 0 && lineNum <= tr.state.doc.lines) {
            const { from, to } = tr.state.doc.line(lineNum);
            const highlightDecoration = Decoration.line({
              attributes: { class: 'cm-current-line-highlight' },
            });
            newDecorations = Decoration.set([highlightDecoration.range(from)]);
          } else {
            return Decoration.none; // Clear if invalid line number
          }
        }
      }
    }
    return newDecorations;
  },
  provide: (f) => EditorView.decorations.from(f), // Make this field provide decorations to the editor
});


export default function Home() {
  const [code, setCode] = useState(
    `arr = [1, 2, 3]\nsum = 0\n\nfor i in range(len(arr)):\n    sum += arr[i]\n\nprint(sum)`
  );
  const [trace, setTrace] = useState<any[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const editorViewRef = useRef<EditorView | null>(null);

  const runCode = async () => {
    try {
      const res = await fetch('http://localhost:8000/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setTrace(data.trace);
      setStepIndex(0);
    } catch (error) {
      console.error('❌ Error tracing code:', error);
    }
  };

  const nextStep = () => {
    setStepIndex((prev) => Math.min(prev + 1, trace.length - 1));
  };

  const prevStep = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const currentStep = trace[stepIndex];

  useEffect(() => {
    const view = editorViewRef.current;
    if (!view) return;

    let effects: StateEffect<any>[] = [];

    if (currentStep?.line) {
      const line = currentStep.line;
      // Add effect to set the highlight
      effects.push(setLineHighlight.of(line));
      // Add effect to scroll into view
      effects.push(EditorView.scrollIntoView(view.state.doc.line(line).from, { y: 'center' }));
    } else {
      // Add effect to clear the highlight
      effects.push(setLineHighlight.of(null));
    }

    if (effects.length > 0) {
      view.dispatch({ effects });
    }

    // Cleanup: Clear highlight when component unmounts or dependencies change
    return () => {
        if (view) {
            view.dispatch({
                effects: [setLineHighlight.of(null)],
            });
        }
    };
  }, [stepIndex, trace]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4 space-y-6 text-white">
      <CodeMirror
        value={code}
        height="400px"
        theme="dark"
        extensions={[
          python(),
          EditorView.lineWrapping,
          lineHighlightCompartment.of([lineHighlightField]), // Provide the custom StateField within the compartment
        ]}
        onChange={(val) => setCode(val)}
        onCreateEditor={(view) => {
          editorViewRef.current = view;
        }}
      />

      <div className="flex gap-4">
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
          <div className="bg-black text-green-400 p-4 rounded shadow">
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
