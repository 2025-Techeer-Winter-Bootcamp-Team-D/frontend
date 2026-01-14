import React, { useState, useEffect, useRef } from "react";
import { PageView } from "../../types";
import { Search, X, ChevronRight, TrendingUp } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setPage: (page: PageView) => void;
  onSearchSelect?: (code: string) => void;
}

const MOCK_COMPANIES = [
  { name: "신한지주", code: "055550", type: "KOSPI", change: "+0.51%" },
  { name: "삼성전자", code: "005930", type: "KOSPI", change: "+0.96%" },
  { name: "SK하이닉스", code: "000660", type: "KOSPI", change: "+2.10%" },
  { name: "현대차", code: "005380", type: "KOSPI", change: "-1.20%" },
  { name: "KB금융", code: "105560", type: "KOSPI", change: "+1.12%" },
  { name: "하나금융", code: "086790", type: "KOSPI", change: "-0.32%" },
  { name: "카카오뱅크", code: "323410", type: "KOSPI", change: "-1.50%" },
  { name: "에코프로비엠", code: "247540", type: "KOSDAQ", change: "-0.80%" },
  { name: "LG에너지솔루션", code: "373220", type: "KOSPI", change: "-1.50%" },
];

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  setPage,
  onSearchSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleCompanyClick = (code: string) => {
    if (onSearchSelect) {
      onSearchSelect(code);
    }
    setPage(PageView.COMPANY_DETAIL);
    onClose();
    setSearchQuery("");
  };

  const filteredCompanies = searchQuery
    ? MOCK_COMPANIES.filter(
        (c) => c.name.includes(searchQuery) || c.code.includes(searchQuery),
      )
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[40] flex items-start justify-center pt-32 px-4">
      <div
        className="fixed top-[57px] left-0 right-0 bottom-0 bg-white/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-lg shadow-2xl border border-white/50 animate-fade-in-up overflow-hidden flex flex-col max-h-[60vh]">
        <div className="flex items-center gap-4 p-6 border-b border-gray-100">
          <Search size={24} className="text-shinhan-blue" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="기업명, 종목코드 또는 산업을 입력하세요"
            className="flex-1 bg-transparent text-xl font-bold text-slate-800 placeholder:text-gray-300 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar bg-white/50">
          {searchQuery ? (
            filteredCompanies.length > 0 ? (
              <div className="py-2">
                <div className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  검색 결과 ({filteredCompanies.length})
                </div>
                {filteredCompanies.map((company) => (
                  <button
                    key={company.code}
                    onClick={() => handleCompanyClick(company.code)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors group border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-white border border-gray-100 flex items-center justify-center font-bold text-slate-700 shadow-sm group-hover:border-blue-200 group-hover:text-shinhan-blue transition-colors">
                        {company.name[0]}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-800 text-lg group-hover:text-shinhan-blue transition-colors">
                          {company.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                          <span>{company.code}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{company.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-slate-800">
                        {company.change}
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-gray-300 ml-auto mt-1 group-hover:text-shinhan-blue group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400">
                <p className="text-lg font-medium mb-1">검색 결과가 없습니다</p>
                <p className="text-sm">다른 키워드로 검색해보세요</p>
              </div>
            )
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  최근 검색어
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["신한지주", "2차전지", "삼성전자"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-slate-600 font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  인기 종목
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCompanyClick("055550")}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left"
                  >
                    <span className="text-red-500 font-bold text-sm">1</span>
                    <span className="font-bold text-slate-700 text-sm">
                      신한지주
                    </span>
                    <TrendingUp size={14} className="text-red-500 ml-auto" />
                  </button>
                  <button
                    onClick={() => handleCompanyClick("005930")}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left"
                  >
                    <span className="text-red-500 font-bold text-sm">2</span>
                    <span className="font-bold text-slate-700 text-sm">
                      삼성전자
                    </span>
                    <TrendingUp size={14} className="text-red-500 ml-auto" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
