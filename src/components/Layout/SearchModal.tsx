import React, { useState, useEffect, useRef } from "react";
import { PageView } from "../../types";
import { Search, X, ChevronRight, TrendingUp, Loader2 } from "lucide-react";
import GlassCard from "./GlassCard";
import { searchCompanies, type CompanySearchItem } from "../../api/company";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setPage: (page: PageView) => void;
  onSearchSelect?: (code: string) => void;
}

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 8;

// 최근 검색어 로컬스토리지에서 가져오기
const getRecentSearches = (): string[] => {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// 최근 검색어 로컬스토리지에 저장
const saveRecentSearch = (query: string) => {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter((q) => q !== query);
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  setPage,
  onSearchSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CompanySearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 마운트 시 최근 검색어 로드
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      // 모달 열릴 때 최근 검색어 새로고침
      setRecentSearches(getRecentSearches());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 검색어 변경 시 API 호출 (디바운스 적용)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await searchCompanies(searchQuery);
        // API 응답 구조에 따라 results 추출
        const data = response.data;
        const results = data?.data?.results ?? data?.results ?? [];
        setSearchResults(results);
      } catch (error) {
        console.error("검색 실패:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleCompanyClick = (code: string, companyName?: string) => {
    // 검색어 또는 기업명 저장
    if (companyName) {
      const updated = saveRecentSearch(companyName);
      setRecentSearches(updated);
    } else if (searchQuery.trim()) {
      const updated = saveRecentSearch(searchQuery.trim());
      setRecentSearches(updated);
    }

    if (onSearchSelect) {
      onSearchSelect(code);
    }
    setPage(PageView.COMPANY_DETAIL);
    onClose();
    setSearchQuery("");
    setSearchResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <GlassCard className="w-full max-w-lg relative z-10 p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">기업 검색</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="relative mb-6">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="기업명 또는 종목코드를 입력하세요"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100/50 outline-none transition-all"
            autoFocus
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {searchQuery === "" ? (
            <div className="space-y-6">
              {/* 최근 검색어 */}
              {recentSearches.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    최근 검색어
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-slate-600 font-medium transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 인기 종목 TOP 4 */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  인기 종목 TOP 4
                </h4>
                <div className="space-y-1">
                  {[
                    { name: "삼성전자", code: "005930", change: "+0.96%" },
                    { name: "SK하이닉스", code: "000660", change: "+2.10%" },
                    { name: "신한지주", code: "055550", change: "+0.51%" },
                    {
                      name: "LG에너지솔루션",
                      code: "373220",
                      change: "-1.50%",
                    },
                  ].map((company, index) => (
                    <button
                      key={company.code}
                      onClick={() =>
                        handleCompanyClick(company.code, company.name)
                      }
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group text-left"
                    >
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-600">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <span className="font-bold text-slate-700 group-hover:text-shinhan-blue transition-colors">
                          {company.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-400 font-mono">
                          {company.code}
                        </span>
                      </div>
                      <span
                        className={`font-bold text-sm ${company.change.startsWith("+") ? "text-red-500" : "text-blue-500"}`}
                      >
                        {company.change}
                      </span>
                      <TrendingUp
                        size={14}
                        className={
                          company.change.startsWith("+")
                            ? "text-red-500"
                            : "text-blue-500"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-shinhan-blue" />
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((company) => (
              <button
                key={company.stock_code}
                onClick={() =>
                  handleCompanyClick(company.stock_code, company.company_name)
                }
                className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-xl transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-blue-100 group-hover:text-shinhan-blue transition-colors">
                    {company.company_name[0]}
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 group-hover:text-shinhan-blue transition-colors">
                      {company.company_name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-mono">{company.stock_code}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{company.market}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <ChevronRight
                    size={18}
                    className="text-gray-400 group-hover:text-shinhan-blue"
                  />
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default SearchModal;
