import { Link } from "react-router-dom";

export default function ExistAccount() {
  return (
    <div className='text-base sm:mb-10'>
      <Link to='/login' className='text-base font-bold text-linkleGray hover:text-black'>
        이미 계정이 있습니다
      </Link>
    </div>
  );
}
