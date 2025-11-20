import React, { useState } from "react";

function TextInput({
  label, // 제목
  description, // 부연설명 (선택)
  placeholder,
  value,
  onChange,
  multiline = false, // false: 한 줄, true: 상세 내용 textarea
  rows = 4,
  disabled = false, // 비활성 스타일 (입력 가능)
  readOnly = false, // 입력 불가 (접근 불가 상태)
  errorMessage, // 에러 메시지 있으면 에러 상태
  supportingText, // 서포팅 텍스트 (에러 없을 때만)
  showPasswordToggle = false, // 비밀번호 보기/숨기기
  type = "text",
  name,
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isError = Boolean(errorMessage);
  const isInactive = disabled; // 입력 가능하지만 비활성 스타일
  const isReadOnly = readOnly; // 진짜 수정 불가

  // 라벨 + 부연설명
  const renderLabel = () => {
    if (!label && !description) return null;

    return (
      <div className="mb-1">
        {label && (
          <label
            htmlFor={name}
            className="block text-base font-semibold text-text-main"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="mt-0.5 text-xs text-gray-60">{description}</p>
        )}
      </div>
    );
  };

  // 기본 필드 스타일
  const baseFieldClass =
    "w-full rounded-lg border bg-bg-app px-3 text-sm text-text-main placeholder:text-gray-40 focus:outline-none";

  // 상태별 border / 배경 / 텍스트
  let stateClass = "border-gray-20 focus:border-yellow-main";

  if (isReadOnly) {
    // ✅ 접근 불가: 노랑 배경 + 진한 텍스트
    stateClass =
      "border-gray-20 bg-yellow-40 text-text-main placeholder:text-text-main cursor-default";
  } else if (isError) {
    stateClass = "border-accent focus:border-accent";
  } else if (isInactive) {
    // ✅ 비활성 스타일: 회색 텍스트지만 입력은 가능
    stateClass =
      "border-gray-20 bg-bg-app text-gray-60 placeholder:text-gray-60 " +
      "focus:border-yellow-main focus:text-text-main focus:placeholder:text-gray-40";
  }

  const singleLineClass = "h-13"; // 버튼과 동일 높이
  const multiLineClass = "py-3 min-h-[120px] resize-none";

  const renderField = () => {
    if (multiline) {
      // 상세 내용 textarea
      return (
        <textarea
          id={name}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={isReadOnly}
          className={`${baseFieldClass} ${multiLineClass} ${stateClass} ${className}`}
          {...props}
        />
      );
    }

    // 비밀번호 토글
    if (showPasswordToggle && type === "password") {
      const actualType = showPassword ? "text" : "password";

      return (
        <div className="relative">
          <input
            id={name}
            name={name}
            type={actualType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={isReadOnly}
            className={`${baseFieldClass} ${singleLineClass} ${stateClass} pr-10 ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => {
              if (!isReadOnly) {
                setShowPassword((prev) => !prev);
              }
            }}
            tabIndex={isReadOnly ? -1 : 0}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-60 text-xs"
          >
            {showPassword ? (
              <img src="/icons/eye.svg" />
            ) : (
              <img src="/icons/eye-off.svg" />
            )}
          </button>
        </div>
      );
    }

    // 일반 input
    return (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={isReadOnly}
        className={`${baseFieldClass} ${singleLineClass} ${stateClass} ${className}`}
        {...props}
      />
    );
  };

  const renderBottomText = () => {
    if (isError && errorMessage) {
      return <p className="mt-1 ml-2 text-xs text-accent">{errorMessage}</p>;
    }

    if (supportingText) {
      return <p className="mt-1 ml-2 text-xs text-gray-60">{supportingText}</p>;
    }

    return null;
  };

  return (
    <div className="flex flex-col">
      {renderLabel()}
      {renderField()}
      {renderBottomText()}
    </div>
  );
}

export default TextInput;
