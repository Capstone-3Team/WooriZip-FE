import TTSButton from "./TTSButton";

export default function QuestionField({ question, onClickTTS }) {
  return (
    <section className="flex items-center justify-between px-4 pt-4">
      {/* 질문 필드 */}
      <div className="flex-1">
        <div className="inline-flex max-w-full items-center rounded-xl bg-yellow-20 px-4 py-2">
          <span className="line-clamp-2 text-sm font-medium text-text-main">
            {question}
          </span>
        </div>
      </div>

      {/* 오른쪽 TTS 버튼 */}
      <div className="ml-2">
        <TTSButton onClick={onClickTTS} />
      </div>
    </section>
  );
}
