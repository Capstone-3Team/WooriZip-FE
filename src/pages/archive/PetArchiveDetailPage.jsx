import { useLocation, useNavigate } from "react-router-dom";
import ArchiveMediaDetail from "@/components/archive/ArchiveMediaDetail";

export default function PetArchiveDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const item = location.state?.item;

  // 직접 URL로 들어왔을 때 같은 경우 안전 처리
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
    />
  );
}
