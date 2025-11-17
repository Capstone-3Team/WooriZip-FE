export default function TTSButton({
  onClick,
  iconSrc = "/icons/tts.svg",
  alt = "음성으로 듣기",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-40"
    >
      <img src={iconSrc} alt={alt} className="h-5 w-5" />
    </button>
  );
}
