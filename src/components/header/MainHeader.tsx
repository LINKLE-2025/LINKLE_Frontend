import { Link } from "react-router-dom";

type Props = {
  className?: string;
};

export default function MainHeader({ className = "" }: Props) {
  return (
    <header
      className={`fixed top-0 w-full z-[2] flex items-center bg-white border-b border-gray-200 px-5 py-3 ${className}`}
    >
      <Link className='flex items-center' to='/'>
        <img src='/logos/linkle-icon.svg' alt='LINKLE 로고' className='h-7 mr-1.5' />
        <img src='/logos/logo_text.svg' alt='LINKLE 로고' className='h-6' />
      </Link>
    </header>
  );
}
