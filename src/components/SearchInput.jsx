import TextInput from "@/components/TextInput";

function SearchInput({
  value,
  onChange,
  placeholder = "검색어를 입력해주세요",
  name = "search",
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <TextInput
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        // 라벨/부연설명 필요 없으니까 비워두기
        label={null}
        description={null}
        // 버튼/검색창 높이 맞추기 위해 그대로 사용
        className="pr-9"
      />
      {/* 이미지 대신 텍스트 아이콘 → 파일 없어도 무조건 보임 */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-60 text-sm">
        🔍
      </span>
    </div>
  );
}

export default SearchInput;
