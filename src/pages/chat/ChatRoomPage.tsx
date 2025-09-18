import { useParams } from "react-router-dom";
import ChatWindow from "../../components/chat/ChatWindow";

export default function ChatRoomPage() {
  const { roomId: rid } = useParams();
  const roomId = Number(rid);



  if (!roomId) return <div className='p-4'>잘못된 방 ID입니다.</div>;
  return <ChatWindow roomId={roomId} />;
}
