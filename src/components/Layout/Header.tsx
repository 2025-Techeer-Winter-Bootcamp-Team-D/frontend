import React from "react";

interface Props {
  totalCount: number;
  filteredCount: number;
}

const Header: React.FC<Props> = ({ totalCount, filteredCount }) => {
  return (
    <header className="max-w-7xl mx-auto mb-8 text-center md:text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0046FF]">
            The Ultimate Screener
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            엄선된 {totalCount}개 우량 기업 중 당신만의 진주를 찾아보세요.
          </p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm flex items-center gap-3 shadow-sm h-fit">
          <span className="text-slate-500 font-medium">
            분석 대상:{" "}
            <span className="text-slate-900 font-bold">{totalCount}</span>
          </span>
          <div className="w-px h-4 bg-slate-200"></div>
          <span className="text-[#0046FF] font-bold">
            조건 충족: {filteredCount}개
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
