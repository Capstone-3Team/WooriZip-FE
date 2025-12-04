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

  const handleSave = () => {
    const src = item.src;
    if (!src) return;

    const cleanUrl = src.split("?")[0];
    const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
    const ext = match?.[1] || (item.type === "video" ? "mp4" : "jpg");

    // 닉네임 + 날짜 조합 파일명
    const namePart = item.nickname || "member";
    const datePart =
      (item.dateLabel && item.dateLabel.replace(/\s+/g, "_")) || "archive";
    const fileName = `${namePart}_${datePart}.${ext}`;

    const link = document.createElement("a");
    link.href = src;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <ArchiveMediaDetail
      dateLabel={item.dateLabel}
      mediaType={item.type === "video" ? "video" : "image"}
      src={item.src}
      onClose={() => navigate(-1)}
      onSave={handleSave}
    />
  );
}
