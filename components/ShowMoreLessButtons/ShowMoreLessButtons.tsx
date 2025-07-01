import React from "react";

interface ShowMoreLessButtonsProps {
  showMoreVisible: boolean;
  showLessVisible: boolean;
  onShowMore: () => void;
  onShowLess: () => void;
  buttonsRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ShowMoreLessButtons({
  showMoreVisible,
  showLessVisible,
  onShowMore,
  onShowLess,
  buttonsRef,
}: ShowMoreLessButtonsProps) {
  return (
    <div className="flex justify-center gap-6" ref={buttonsRef}>
      {showMoreVisible && (
        <button
          onClick={onShowMore}
          className="px-8 py-3 bg-white/20 backdrop-blur-sm cursor-pointer lg:hover:bg-white/30 text-white rounded-xl lg:hover:shadow-lg transition-all duration-300 font-medium border border-white/20"
        >
          Afficher plus
        </button>
      )}
      {showLessVisible && (
        <button
          onClick={onShowLess}
          className="px-8 py-3 bg-white/10 backdrop-blur-sm cursor-pointer lg:hover:bg-white/20 text-white rounded-xl lg:hover:shadow-lg transition-all duration-300 font-medium border border-white/20"
        >
          Afficher moins
        </button>
      )}
    </div>
  );
}
