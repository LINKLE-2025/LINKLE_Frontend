export default function PastelBackground() {
  return (
    // Pink, Yellow, Blue Pastel Blobs Background
    <div className='absolute inset-0 -z-10 bg-gradient-to-tr from-pink-50/50 via-yellow-50/50 to-blue-50/50 overflow-hidden'>
      {/* Blob */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob'></div>
      <div className='absolute top-40 right-10 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000'></div>
      <div className='absolute bottom-20 left-1/3 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000'></div>
    </div>
  );
}
