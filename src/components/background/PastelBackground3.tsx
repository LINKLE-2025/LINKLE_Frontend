export default function PastelBackground3() {
  return (
    // Orange, Lime, Sky Pastel Blobs Background
    <div className='absolute inset-0 -z-10 bg-gradient-to-tr from-orange-50/50 via-lime-50/50 to-sky-50/50 overflow-hidden'>
      {/* Blob */}
      <div className='absolute top-10 left-10 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob'></div>
      <div className='absolute top-48 right-16 w-72 h-72 bg-lime-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000'></div>
      <div className='absolute bottom-20 left-1/2 w-72 h-72 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000'></div>
    </div>
  );
}
