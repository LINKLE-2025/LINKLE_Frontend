import React, { useEffect, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { useNavigate } from "react-router-dom";

export type LinkerDetail = {
  linkerId: number;
  name: string;
  address?: string;
  adresssName?: string;
  categoryId?: number | null;
  locationX?: number | null;
  locationY?: number | null;
  memo?: string | null;
  createdAt?: string;
  phone?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  detail: LinkerDetail | null;
  loading: boolean;
  error: string | null;
};

// 포스트 타입
type LinkerPost = {
  postId: number;
  imageUrl?: string | null;
  content?: string | null;
  createdDate?: string;
  author?: { name?: string; handle?: string; avatarUrl?: string | null } | null;
};

const prettyDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "-");

export default function LinkerDetailSheet({ open, onClose, detail, loading, error }: Props) {
  const navigate = useNavigate();

  // 포스트 관련 state
  const [posts, setPosts] = useState<LinkerPost[]>([]);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postPage, setPostPage] = useState(1);
  const [postHasNext, setPostHasNext] = useState(false);

  // 포스트 불러오기 함수
  async function LinkerPost(linkerId: number) {
    setPostLoading(true);
    setPostError(null);
    try {
      const res = await fetch(`/api/post?linkerId=${linkerId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`포스트 조회 실패 (${res.status})`);

      type PostDTO = {
        postId: number;
        image?: string | null;
        memo?: string | null;
        createdDate?: string;
      };

      const raw: PostDTO[] = await res.json();
      const postImageUrl = (postId: number) => `/api/post/${postId}/image`;

      const mapped: LinkerPost[] = (raw ?? []).map((p) => ({
        postId: p.postId,
        imageUrl: p.image ? postImageUrl(p.postId) : null,
        content: p.memo ?? null, // memo  → content
        createdDate: p.createdDate ?? undefined,
        author: null, // 필요시 나중에 채우기
      }));

      setPosts(mapped);
      setPostHasNext(false); // 현재 API는 페이지네이션 없음
      setPostPage(1);
    } catch (e: any) {
      setPostError(e?.message ?? String(e));
    } finally {
      setPostLoading(false);
    }
  }
  useEffect(() => {
    if (!open || !detail?.linkerId) return;
    LinkerPost(detail.linkerId); // ← 여기
  }, [open, detail?.linkerId]);

  useEffect(() => {
    if (!open) {
      setPosts([]);
      setPostPage(1);
      setPostHasNext(false);
      setPostError(null);
    }
  }, [open]);

  const CreatePost = () => {
    if (!detail) return;
    navigate(`/post?linkerId=${detail.linkerId}`, { state: { linker: detail } });
  };

  return (
    <Sheet
      isOpen={open}
      onClose={onClose}
      snapPoints={[0.92, 0.78, 0.6]}
      initialSnap={1}
      detent='content-height'
    >
      <Sheet.Container>
        {/* 상단 핸들바 */}
        <Sheet.Header>
          <div className='mx-auto my-2 h-1.5 w-12 rounded-full bg-gray-300' />
        </Sheet.Header>

        <Sheet.Content>
          {/* 제목/주소/우측 아이콘 */}
          <div className='px-4 pb-2'>
            {loading ? (
              <p className='text-gray-500'>불러오는 중…</p>
            ) : error ? (
              <p className='text-red-500'>{error}</p>
            ) : (
              <>
                <div className='flex items-start justify-between'>
                  <div className='min-w-0'>
                    <h2 className='text-lg font-bold truncate'>{detail?.name ?? "-"}</h2>
                    <p className='mt-0.5 text-sm text-gray-500 truncate'>
                      {detail?.address ?? detail?.adresssName ?? "-"}
                    </p>
                  </div>
                  <div className='ml-3 flex shrink-0 gap-2'>
                    <button
                      className='h-10 w-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center'
                      title='포스트작성'
                      onClick={CreatePost}
                    >
                      <img src='/icons/mapicon/photo.png' alt='' />
                    </button>
                    <button
                      className='h-10 w-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center'
                      title='채팅방생성'
                    >
                      <img src='/icons/mapicon/chat.png' alt='' />
                    </button>
                  </div>
                </div>

                <div className='mt-3 flex items-center justify-between text-xs text-gray-500'>
                  <div className='flex gap-4'>
                    <span>3 채팅방</span>
                    {/* 실제 포스트 개수로 표시 */}
                    <span>{posts.length} 포스트</span>
                  </div>
                  <span>{prettyDate(detail?.createdAt)} 만료 예정</span>
                </div>
              </>
            )}
          </div>

          {/* 탭 바 */}
          <div className='mt-2 border-b'>
            <div className='flex items-center justify-around text-sm'>
              <button className='relative py-2 font-semibold'>
                <img src='/icons/mapicon/Vector.png' alt='' />
                <span className='absolute -bottom-[1px] left-0 right-0 h-[2px] bg-black' />
              </button>
              <button className='py-2 text-gray-400'>
                <img src='/icons/mapicon/User Account.png' alt='' />
              </button>
              <button className='py-2 text-gray-400'>
                <img src='/icons/mapicon/lucide_crown.png' alt='' />
              </button>
            </div>
          </div>

          {/* 포스트 그리드 */}
          <div className='px-1 pt-2 pb-6'>
            {postLoading && posts.length === 0 ? (
              <div className='p-6 text-center text-gray-500 text-sm'>불러오는 중…</div>
            ) : postError ? (
              <div className='p-6 text-center text-red-500 text-sm'>{postError}</div>
            ) : posts.length === 0 ? (
              <div className='p-6 text-center text-gray-400 text-sm'>
                아직 등록된 포스트가 없어요.
                <br />
                <br />
              </div>
            ) : (
              <>
                <div className='grid grid-cols-3 gap-1'>
                  {posts.map((p) => (
                    <button
                      key={p.postId}
                      className='aspect-square overflow-hidden bg-gray-100'
                      title={p.content ?? ""}
                      onClick={() =>
                        navigate(`/post/${p.postId}`, {
                          state: { linker: detail }, // 현재 링크된 linker 정보 같이 전달
                        })
                      }
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt='' className='h-full w-full object-cover' />
                      ) : (
                        <div className='h-full w-full p-2 text-[11px] text-left line-clamp-2'>
                          {p.content ?? "(이미지 없음)"}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* 더 보기 
                <div className='mt-3 flex justify-center'>
                  {postHasNext ? (
                    <button
                      disabled={postLoading}
                      onClick={() => LinkerPost(detail!.linkerId, postPage + 1)}
                      className='px-4 py-2 text-sm border rounded-lg bg-white disabled:opacity-50'
                    >
                      {postLoading ? "불러오는 중…" : "더 보기"}
                    </button>
                  ) : (
                    posts.length > 0 && (
                      <div className='py-2 text-xs text-gray-400'>마지막 포스트까지 다 봤어요</div>
                    )
                  )}
                </div>
                */}
              </>
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
}
