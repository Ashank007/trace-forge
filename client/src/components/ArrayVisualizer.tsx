'use client';

type Props = {
  locals: Record<string, any>;
};

export default function ArrayVisualizer({ locals }: Props) {
  const arrayEntry = Object.entries(locals).find(([_, val]) => Array.isArray(val));
  if (!arrayEntry) return null;

  const [name, arr] = arrayEntry;
  const pointerIndex = typeof locals.i === 'number' ? locals.i : null;

  return (
    <div className="mt-6">
      <h3 className="text-white font-bold mb-2">📦 {name} (Array)</h3>
      <div className="flex gap-2">
        {arr.map((v: any, idx: number) => (
          <div
            key={idx}
            className={`w-10 h-10 flex items-center justify-center border rounded text-white ${
              pointerIndex === idx ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-700'
            }`}
          >
            {v}
          </div>
        ))}
      </div>
      {pointerIndex !== null && (
        <p className="text-sm text-gray-400 mt-1">👆 i = {pointerIndex}</p>
      )}
    </div>
  );
}


