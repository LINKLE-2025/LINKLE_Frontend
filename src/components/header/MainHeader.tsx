export default function MainHeader() {
  return (
    <header className='fixed top-0 w-full flex items-center bg-white border-b border-gray-200 px-5 py-3'>
      <a className='flex items-center' href='/'>
        <img src='/logos/linkle-icon.svg' alt='LINKLE 로고' className='h-7 mr-1.5' />
        <img src='/logos/logo_text.svg' alt='LINKLE 로고' className='h-6' />
      </a>
    </header>
  );
}
