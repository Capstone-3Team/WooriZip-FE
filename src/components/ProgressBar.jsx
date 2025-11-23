function ProgressBar({ currentStep = 1, totalSteps = 7, className = "" }) {
  const ratio = Math.max(0, Math.min(currentStep / totalSteps, 1));
  const width = `${ratio * 100}%`;

  return (
    <div
      className={`w-full h-1.5 bg-gray-20 rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-yellow-main rounded-full transition-[width] duration-300"
        style={{ width }}
      />
    </div>
  );
}

export default ProgressBar;
