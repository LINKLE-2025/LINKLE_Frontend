import React, { useEffect, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { useNavigate, useOutletContext } from "react-router-dom";

export type LinkerDetail = {
  linkerId: number;
  name: string;
  address?: string;
  addressName?: string;
  categoryId?: number | null;
  locationX?: number | null;
  locationY?: number | null;
  memo?: string | null;
  createdDate?: string;
  phone?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  detail: LinkerDetail | null;
  loading: boolean;
  error: string | null;
};

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

  // AppLayout에서 Outlet context로 받은 header/footer 높이
  type LayoutContext = { headerHeight: number; footerHeight: number };
  const { footerHeight } = useOutletContext<LayoutContext>();

  // 포스트 상태
  const [posts, setPosts] = useState<LinkerPost[]>([]);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postPage, setPostPage] = useState(1);
  const [postHasNext, setPostHasNext] = useState(false);

  // 포스트 불러오기
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
        content: p.memo ?? null,
        createdDate: p.createdDate ?? undefined,
        author: null,
      }));

      setPosts(mapped);
      setPostHasNext(false);
      setPostPage(1);
    } catch (e: any) {
      setPostError(e?.message ?? String(e));
    } finally {
      setPostLoading(false);
    }
  }

  useEffect(() => {
    if (!open || !detail?.linkerId) return;
    LinkerPost(detail.linkerId);
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
    navigate(`/post?linkerId=${detail.linkerId}`, {
      state: { linker: detail },
    });
  };

  return (
    <Sheet
      isOpen={open}
      onClose={onClose}
      snapPoints={[0.92, 0.78, 0.6]}
      initialSnap={3}
      detent='content-height'
    >
      <Sheet.Container style={{ bottom: footerHeight, zIndex: 1500, boxShadow: "none" }}>
        <Sheet.Header>
          <div className='mx-auto my-2 h-1.5 w-12 rounded-full bg-gray-300' />
        </Sheet.Header>

        <Sheet.Content style={{ paddingBottom: 12 }}>
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
                      {detail?.address ?? detail?.addressName ?? "-"}
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
                    <span>{posts.length} 포스트</span>
                  </div>
                  <span>
                    {prettyDate(
                      detail?.createdDate, //TODO: 만료일자로 바꾸기
                    )}{" "}
                    만료 예정
                  </span>
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
                          state: { linker: detail },
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
              </>
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>

      {/* 백드롭도 푸터 위에서 끝나도록 */}
      <Sheet.Backdrop style={{ bottom: footerHeight, zIndex: 1490, background: "transparent" }} />
    </Sheet>
  );
}
