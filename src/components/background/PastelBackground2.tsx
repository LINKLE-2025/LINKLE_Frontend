export default function PastelBackground2() {
  return (
    // Green, Purple, Pink Pastel Blobs Background
    <div className='absolute inset-0 -z-10 bg-gradient-to-tr from-green-50/50 via-purple-50/50 to-pink-50/50 overflow-hidden'>
      {/* Blob */}
      <div className='absolute top-16 left-16 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob'></div>
      <div className='absolute top-40 right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000'></div>
      <div className='absolute bottom-24 left-1/4 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000'></div>
    </div>
  );
}
