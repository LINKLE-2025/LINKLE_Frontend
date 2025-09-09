import { Home, Search, Mic, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";

function MainFooter() {
  return (
    <footer className='bg-white border-t z-[2] border-gray-200 text-gray-400 text-xs py-4 text-center fixed bottom-0 w-full'>
      <div className='flex items-center justify-around'>
        <Link to='/map' className='p-3'>
          <Home className='w-6 h-6 text-gray-900' />
        </Link>
        <Link to='/search' className='p-3'>
          <Search className='w-6 h-6 text-gray-900' />
        </Link>
        <button className='p-3'>
          <Mic className='w-6 h-6 text-gray-900' />
        </button>
        <Link to='/chat' className='p-3'>
          <MessageSquare className='w-6 h-6 text-gray-900' />
        </Link>
        <Link to='/profile' className='p-3'>
          <User className='w-6 h-6 text-gray-900' />
        </Link>
      </div>
    </footer>
  );
}

export default MainFooter;
