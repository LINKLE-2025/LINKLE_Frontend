import "@/index.css";
import { useState } from "react";

function App() {
  const [d1, setD1] = useState(0);

  return (
    <div className='flex flex-col gap-4 h-screen items-center justify-center bg-gray-100'>
      <h1 className='text-sm'>작은 제목 (text-sm)</h1>
      <h1 className='text-3xl'>중간 제목 (text-3xl)</h1>
      <h1 className='text-7xl'>큰 제목 (text-7xl)</h1>

      <button
        onClick={() => setD1((prev) => prev + 1)}
        className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
      >
        d1 값: {d1}
      </button>
    </div>
  );
}

export default App;
