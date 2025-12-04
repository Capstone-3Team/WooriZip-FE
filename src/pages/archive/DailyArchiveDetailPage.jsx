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

  // 저장하기 버튼이 눌렸을 때 실제로 파일을 저장하는 핸들러
  const handleSave = () => {
    const src = item.src;
    if (!src) return;

    // 확장자 추출 (쿼리스트링 제거 후 .jpg, .mp4 등 찾기)
    const cleanUrl = src.split("?")[0];
    const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
    const ext = match?.[1] || (item.type === "video" ? "mp4" : "jpg");

    // 날짜 기반 파일명 (공백은 _ 로 치환)
    const baseName =
      (item.dateLabel && item.dateLabel.replace(/\s+/g, "_")) ||
      "woorizip_media";
    const fileName = `${baseName}.${ext}`;

    // ✅ 숨은 a 태그로 다운로드 트리거
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
      onSave={handleSave} // 저장하기 버튼에 다운로드 핸들러 연결
    />
  );
}
