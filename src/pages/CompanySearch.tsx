import React, { useState, useMemo } from "react";
import GlassCard from "../components/Layout/GlassCard";
import {
  Search,
  Star,
  TrendingUp,
  Filter,
  ChevronRight,
  ArrowRight,
  User,
} from "lucide-react";
import { PageView } from "../types";

interface CompanySearchProps {
  setPage: (page: PageView) => void;
  starred: Set<string>;
  onToggleStar: (code: string) => void;
  setCompanyCode: (code: string) => void;
}

// Mock Data for the Ranking List
const RANKING_DATA = [
  {
    rank: 1,
    name: "삼성전자",
    code: "005930",
    sector: "반도체",
    price: "73,400",
    change: "+0.96%",
    changeVal: 700,
    marketCap: "430조",
  },
  {
    rank: 2,
    name: "SK하이닉스",
    code: "000660",
    sector: "반도체",
    price: "164,500",
    change: "+2.10%",
    changeVal: 3400,
    marketCap: "119조",
  },
  {
    rank: 3,
    name: "LG에너지솔루션",
    code: "373220",
    sector: "2차전지",
    price: "385,000",
    change: "-1.50%",
    changeVal: -5000,
    marketCap: "90조",
  },
  {
    rank: 4,
    name: "삼성바이오로직스",
    code: "207940",
    sector: "바이오",
    price: "812,000",
    change: "+2.50%",
    changeVal: 19000,
    marketCap: "57조",
  },
  {
    rank: 5,
    name: "현대차",
    code: "005380",
    sector: "자동차",
    price: "245,000",
    change: "-1.20%",
    changeVal: -3000,
    marketCap: "51조",
  },
  {
    rank: 6,
    name: "기아",
    code: "000270",
    sector: "자동차",
    price: "112,000",
    change: "-0.80%",
    changeVal: -900,
    marketCap: "44조",
  },
  {
    rank: 7,
    name: "셀트리온",
    code: "068270",
    sector: "바이오",
    price: "185,000",
    change: "+1.80%",
    changeVal: 3300,
    marketCap: "40조",
  },
  {
    rank: 8,
    name: "POSCO홀딩스",
    code: "005490",
    sector: "철강",
    price: "420,000",
    change: "+0.50%",
    changeVal: 2000,
    marketCap: "35조",
  },
  {
    rank: 9,
    name: "신한지주",
    code: "055550",
    sector: "금융",
    price: "78,200",
    change: "+0.51%",
    changeVal: 400,
    marketCap: "40조",
  },
  {
    rank: 10,
    name: "KB금융",
    code: "105560",
    sector: "금융",
    price: "72,100",
    change: "+1.12%",
    changeVal: 800,
    marketCap: "38조",
  },
  {
    rank: 11,
    name: "NAVER",
    code: "035420",
    sector: "서비스",
    price: "185,500",
    change: "-0.30%",
    changeVal: -500,
    marketCap: "30조",
  },
  {
    rank: 12,
    name: "삼성SDI",
    code: "006400",
    sector: "2차전지",
    price: "385,000",
    change: "+0.20%",
    changeVal: 1000,
    marketCap: "26조",
  },
  {
    rank: 13,
    name: "LG화학",
    code: "051910",
    sector: "화학",
    price: "450,000",
    change: "-1.10%",
    changeVal: -5000,
    marketCap: "31조",
  },
  {
    rank: 14,
    name: "카카오",
    code: "035720",
    sector: "서비스",
    price: "52,100",
    change: "+0.80%",
    changeVal: 400,
    marketCap: "23조",
  },
  {
    rank: 15,
    name: "하나금융지주",
    code: "086790",
    sector: "금융",
    price: "58,400",
    change: "-0.32%",
    changeVal: -200,
    marketCap: "28조",
  },
];

const CompanySearch: React.FC<CompanySearchProps> = ({
  setPage,
  starred,
  onToggleStar,
  setCompanyCode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleCompanyClick = (code: string) => {
    setCompanyCode(code);
    setPage(PageView.COMPANY_DETAIL);
  };

  const filteredList = useMemo(() => {
    if (!searchQuery) return RANKING_DATA;
    return RANKING_DATA.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.includes(searchQuery) ||
        item.sector.includes(searchQuery),
    );
  }, [searchQuery]);

  // Get details for starred companies
  const starredList = useMemo(() => {
    return RANKING_DATA.filter((item) => starred.has(item.code));
  }, [starred]);

  // Helper Star Icon
  const StarIcon = ({ isActive }: { isActive: boolean }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={isActive ? "#F59E0B" : "none"}
      stroke={isActive ? "#F59E0B" : "#CBD5E1"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  return (
    <div className="animate-fade-in pb-12">
      {/* 1. Header & Search Bar */}
      <div className="flex flex-col items-center justify-center mb-10 pt-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">기업 검색</h1>
        <div className="w-full max-w-2xl relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={24} />
          </div>
          <input
            type="text"
            placeholder="기업명, 종목코드 또는 산업군을 입력하세요..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-blue-500/5 text-lg focus:outline-none focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400 text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Global Ranking / Search Results (Span 3) */}
        <div className="lg:col-span-3">
          <GlassCard className="p-0 overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-shinhan-blue" />
                {searchQuery
                  ? `검색 결과 (${filteredList.length})`
                  : "시가총액 상위 랭킹"}
              </h2>
              <button className="text-sm font-medium text-gray-500 hover:text-shinhan-blue flex items-center gap-1">
                <Filter size={14} /> 필터
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 font-medium border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 w-16 text-center">순위</th>
                    <th className="px-6 py-4 w-16">관심</th>
                    <th className="px-6 py-4">기업명</th>
                    <th className="px-6 py-4 text-center">산업</th>
                    <th className="px-6 py-4 text-right">현재가</th>
                    <th className="px-6 py-4 text-right">등락률</th>
                    <th className="px-6 py-4 text-right">시가총액</th>
                    <th className="px-6 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredList.map((item, index) => (
                    <tr
                      key={item.code}
                      onClick={() => handleCompanyClick(item.code)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-bold ${index < 3 ? "text-shinhan-blue text-lg" : "text-slate-500"}`}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onToggleStar(item.code)}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <StarIcon isActive={starred.has(item.code)} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-base">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          {item.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                          {item.sector}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        {item.price}원
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${item.change.startsWith("+") ? "text-red-500" : "text-blue-500"}`}
                      >
                        {item.change}
                        <div className="text-[10px] font-normal opacity-70">
                          {item.change.startsWith("+") ? "▲" : "▼"}{" "}
                          {Math.abs(item.changeVal).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600 font-medium">
                        {item.marketCap}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight
                          size={18}
                          className="text-gray-300 group-hover:text-shinhan-blue transition-colors"
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredList.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-20 text-center text-gray-400"
                      >
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right: Favorites Sidebar (Span 1) - LIST VIEW */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-0 overflow-hidden flex flex-col h-full bg-white border-2 border-shinhan-light/50">
            <div className="p-5 border-b border-gray-100 bg-shinhan-blue text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Star size={20} className="fill-white" />
                나의 관심 기업
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                {starred.size}개의 기업을 구독 중입니다.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar bg-white">
              {starredList.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {starredList.map((item) => (
                    <div
                      key={item.code}
                      onClick={() => handleCompanyClick(item.code)}
                      className="p-4 hover:bg-blue-50 transition-colors cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(item.code);
                          }}
                          className="text-yellow-400 hover:text-yellow-500 transition-colors"
                        >
                          <Star size={18} fill="currentColor" />
                        </button>
                        <div>
                          <div className="font-bold text-slate-800 text-sm group-hover:text-shinhan-blue transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {item.code}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-700 text-sm">
                          {item.price}
                        </div>
                        <div
                          className={`text-xs font-bold ${item.change.startsWith("+") ? "text-red-500" : "text-blue-500"}`}
                        >
                          {item.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star size={24} className="text-gray-300" />
                  </div>
                  <p className="text-slate-500 font-bold mb-1">
                    관심 기업이 없습니다
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    왼쪽 리스트에서{" "}
                    <Star size={10} className="inline mx-0.5 text-gray-400" />{" "}
                    버튼을 눌러
                    <br />
                    관심 기업을 추가해보세요.
                  </p>
                </div>
              )}

              {/* Manual Add Placeholder if starred contains codes not in RANKING_DATA */}
              {starred.size > starredList.length && (
                <div className="text-center text-xs text-gray-400 py-3 border-t border-gray-50">
                  + 그 외 {starred.size - starredList.length}개 기업
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <button className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 font-bold text-sm hover:border-shinhan-blue hover:text-shinhan-blue hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                관심 그룹 관리 <ArrowRight size={14} />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default CompanySearch;
