import { ProfilePostDTO } from '@/types/user';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//  게시물 탭 컴포넌트
// post의 정보를 불러옴
interface PostsTabProps {
  posts: ProfilePostDTO[];
}

function PostsTab({ posts }: PostsTabProps) {
  const navigate = useNavigate();

  console.log(posts);
  // 게시물이 없을 때 보여지는 문구 및 그리드 형태의 게시물을 보여줌
  return (
    <div>
      {posts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <img
            src='/icons/favicon/favicon.svg' // 🔹 워터마크 이미지 경로
            alt='워터마크'
            className='w-24 h-24 opacity-20 mb-4' // 크기, 투명도, 아래 여백
          />
          <div className="text-center px-8">
            <p className="text-gray-400 text-base mb-2">링커에 참여하고</p>
            <p className="text-gray-400 text-base">나만의 추억을 기록해 보세요</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
            <div key={post.postId} className="aspect-square overflow-hidden">
              <img
                src={`/api/post/${post.postId}/image`}
                alt="post"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => navigate(`/post/${post.postId}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostsTab;
