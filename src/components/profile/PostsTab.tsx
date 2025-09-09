import { ProfilePostDTO } from '@/types/user';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//  게시물 탭 컴포넌트
// post의 정보를 불러옴
interface PostsTabProps {
  posts: ProfilePostDTO[];
}

function PostsTab({ posts }: PostsTabProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();

  // 게시물이 없을 때 보여지는 문구 및 그리드 형태의 게시물을 보여줌
  return (
    <div>
      {posts.length === 0 ? (
        <div>
          <p className="text-gray-400 text-sm mb-2">첫 게시물 작성해보세요</p>
          <p className="text-gray-400 text-xs">링커에 참여하고 나만의 추억을 기록해보세요</p>
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
