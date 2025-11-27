import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import ArchiveSectionCard from "@/components/archive/ArchiveSectionCard";

export default function MemberArchivePage() {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  // TODO: 실제 데이터로 교체
  const memberSections = [
    {
      id: "younger-sibling",
      name: "나동생",
      previews: [
        { thumbnailUrl: "/mock/member-1-1.png", alt: "나동생 추억 1" },
        { thumbnailUrl: "/mock/member-1-2.png", alt: "나동생 추억 2" },
        { thumbnailUrl: "/mock/member-1-3.png", alt: "나동생 추억 3" },
      ],
    },
    {
      id: "mom",
      name: "엄마",
      previews: [
        { thumbnailUrl: "/mock/member-2-1.jpeg", alt: "엄마 추억 1" },
        { thumbnailUrl: "/mock/member-2-2.jpg", alt: "엄마 추억 2" },
      ],
    },
    {
      id: "cute-me",
      name: "귀요미",
      previews: [
        { thumbnailUrl: "/mock/member-3-1.jpeg", alt: "귀요미 추억 1" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header
        variant="solid"
        title="멤버별 추억"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-6 h-6" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 bg-yellow-20 px-6 pt-4 pb-10 overflow-y-auto">
        {memberSections.map((member) => (
          <ArchiveSectionCard
            key={member.id}
            title={member.name}
            previewItems={member.previews}
            onClick={() => navigate(`/archive/members/${member.id}`)}
          />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
