import React from "react";

function MainHeader() {
  return (
    <header className='flex items-center border-b border-gray-200 px-5 py-3'>
      <img src='/logos/linkle-icon.svg' alt='LINKLE 로고' className='h-7 mr-1.5' />
      <img src='/logos/logo_text.svg' alt='LINKLE 로고' className='h-6' />
    </header>
  );
}

export default MainHeader;
