export async function shareFamilyInvite(familyCode) {
  if (!familyCode) {
    alert("가족 코드가 아직 발급되지 않았어요. 잠시 후 다시 시도해 주세요.");
    return;
  }

  // 초대 링크: /splash?code=가족코드
  const inviteUrl = `${window.location.origin}/splash?code=${familyCode}`;

  // 메시지 안에 코드 + 안내 문구
  const shareText = `우리.zip 가족 초대 코드: ${familyCode}
링크를 눌러 우리.zip 가족이 되어보세요!`;

  // 1) 모바일 등 Web Share API 지원 브라우저 → 네이티브 공유 시트
  if (navigator.share) {
    try {
      await navigator.share({
        title: "우리.zip - 가족 초대",
        text: shareText,
        url: inviteUrl,
      });
      return; // 여기서 끝
    } catch (err) {
      // 사용자가 공유창을 닫은 경우도 포함되니 조용히 넘어가도 됨
      console.error("navigator.share 실패:", err);
      // 아래 fallback으로 진행
    }
  }

  // 2) 데스크탑 / 미지원 브라우저 → 텍스트 + 링크 한꺼번에 복사
  try {
    await navigator.clipboard.writeText(`${shareText}\n${inviteUrl}`);
    alert(
      "초대 코드와 링크가 복사되었어요. 카카오톡 등 메신저에 붙여넣어 가족에게 보내 주세요!"
    );
  } catch (err) {
    console.error("클립보드 복사 실패:", err);
    alert("복사에 실패했어요. 다시 시도해 주세요.");
  }
}
