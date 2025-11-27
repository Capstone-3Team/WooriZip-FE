import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import ArchiveSectionCard from "@/components/archive/ArchiveSectionCard";

function ArchivePage() {
  const navigate = useNavigate();

  // TODO: 실제 데이터로 교체
  const dailyPreviews = [
    { thumbnailUrl: "/mock/daily-1.png", alt: "일상 기록 1" },
    { thumbnailUrl: "/mock/daily-2.png", alt: "일상 기록 2" },
  ];

  const memberPreviews = [
    { thumbnailUrl: "/mock/member-1.png", alt: "멤버 기록 1" },
    { thumbnailUrl: "/mock/member-2.jpeg", alt: "멤버 기록 2" },
    { thumbnailUrl: "/mock/member-3.jpg", alt: "멤버 기록 3" },
  ];

  const petPreviews = [{ thumbnailUrl: "/mock/pet-1.jpeg", alt: "반려동물 1" }];

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header variant="plain" title="보관함" />

      <main className="flex-1 bg-yellow-20 px-6 pt-4 pb-10 overflow-y-auto">
        <ArchiveSectionCard
          title="일상 기록 보관함"
          previewItems={dailyPreviews}
          onClick={() => navigate("/archive/daily")}
        />

        <ArchiveSectionCard
          title="멤버별 추억 보관함"
          previewItems={memberPreviews}
          onClick={() => navigate("/archive/members")}
        />

        <ArchiveSectionCard
          title="반려동물과의 추억 보관함"
          previewItems={petPreviews}
          onClick={() => navigate("/archive/pets")}
        />
      </main>

      <BottomNav />
    </div>
  );
}

export default ArchivePage;
