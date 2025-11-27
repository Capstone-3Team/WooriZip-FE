import { useLocation, useNavigate } from "react-router-dom";
import ArchiveMediaDetail from "@/components/archive/ArchiveMediaDetail";

export default function MemberArchiveDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // MemberArchiveGridPage에서 넘긴 item
  const item = location.state?.item;

  // 새로고침하거나 state 없이 진입했을 때 안전 처리
  if (!item) {
    navigate(-1);
    return null;
  }

  return (
    <ArchiveMediaDetail
      dateLabel={item.dateLabel}
      mediaType={item.type === "video" ? "video" : "image"}
      src={item.src}
      onClose={() => navigate(-1)}
      // onSave 안 넘기면 기본 다운로드 로직 사용
    />
  );
}
