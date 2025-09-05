import { ProfilePostDTO } from '@/types/user';
import { useState } from 'react';

interface PostsTabProps {
  posts: ProfilePostDTO[];
}

const PostsTab: React.FC<PostsTabProps> = ({ posts }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <div>
      {posts.length === 0 ? (
        <div>
          <p className="text-gray-400 text-sm mb-2">첫 게시물 작성해보세요</p>
          <p className="text-gray-400 text-xs">링커에 참여하고 나만의 추억을 기록해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {posts.map((post) => (
            <div key={post.postId} className="aspect-square overflow-hidden">
              <img
                src={`/api/post/${post.postId}/image`}
                alt="post"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setPreviewImage(`/api/post/${post.postId}/image`)}
              />
            </div>
          ))}
        </div>
      )}

      {/* 프리뷰 모달 추후 포스트 디테일 링크 생기면 삭제 예정*/}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default PostsTab;
