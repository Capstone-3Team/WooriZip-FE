import { useLocation, useNavigate } from "react-router-dom";
import ArchiveMediaDetail from "@/components/archive/ArchiveMediaDetail";

export default function DailyArchiveDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // DailyArchivePage에서 넘긴 state
  const item = location.state?.item;

  if (!item) {
    // 직접 접근했을 때 등 안전 처리
    navigate(-1);
    return null;
  }

  return (
    <ArchiveMediaDetail
      dateLabel={item.dateLabel}
      mediaType={item.type === "video" ? "video" : "image"}
      src={item.src}
      onClose={() => navigate(-1)}
      // onSave를 전달하지 않으면 컴포넌트 내부의 기본 다운로드 로직 사용
    />
  );
}
