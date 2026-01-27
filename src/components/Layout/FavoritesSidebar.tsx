import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Clock,
  FileText,
  Scale,
  X,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useStarred } from "../../context/StarredContext";
import { useAuth } from "../../hooks/useAuth";
import { useComparisons } from "../../hooks/useCompareQueries";
import { getComparison } from "../../api/comparison";
import { getVisits, removeVisit, clearVisits } from "../../api/users";

type TabType = "recent" | "favorites" | "portfolio";

interface FavoritesSidebarProps {
  onShowLogin?: () => void;
}

const FavoritesSidebar: React.FC<FavoritesSidebarProps> = ({ onShowLogin }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("favorites");
  const { favoriteMap, isLoading, toggleStar } = useStarred();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 방문 기록 조회
  const { data: visitList = [], isLoading: isVisitsLoading } = useQuery({
    queryKey: ["visits"],
    queryFn: async () => {
      const res = await getVisits();
      return res.data ?? res;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  // 방문 기록 삭제 mutation
  const removeVisitMutation = useMutation({
    mutationFn: (visitId: number) => removeVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  // 전체 방문 기록 삭제 mutation
  const clearVisitsMutation = useMutation({
    mutationFn: clearVisits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  // 비교 세트 목록 조회
  const { data: comparisonList = [], isLoading: isComparisonsLoading } =
    useComparisons();

  // 각 비교 세트의 기업 목록 조회
  const comparisonDetails = useQueries({
    queries: comparisonList.map((comparison) => ({
      queryKey: ["comparison-companies", comparison.id],
      queryFn: async () => {
        const res = await getComparison(comparison.id);
        const apiData = res?.data ?? res;
        return {
          id: comparison.id,
          name: comparison.name,
          companies: (apiData?.companies ?? []) as Array<{
            stock_code: string;
            companyName: string;
          }>,
        };
      },
      enabled: isAuthenticated && activeTab === "portfolio",
      staleTime: 1000 * 60 * 5,
    })),
  });

  const tabs = [
    {
      id: "recent" as TabType,
      label: "최근 본",
      headerLabel: "최근 본 기업",
      icon: Clock,
    },
    {
      id: "favorites" as TabType,
      label: "관심",
      headerLabel: "관심",
      icon: Heart,
    },
    {
      id: "portfolio" as TabType,
      label: "내 비교",
      headerLabel: "내 비교 세트",
      icon: Scale,
    },
  ];

  const favoritesList = Array.from(favoriteMap.values());

  const handleCompanyClick = (companyId: string) => {
    navigate(`/company/${companyId}`);
  };

  const handleComparisonClick = (comparisonId: number) => {
    navigate(`/compare?set=${comparisonId}`);
  };

  const handleTabClick = (tabId: TabType) => {
    if (activeTab === tabId && isExpanded) {
      setIsExpanded(false);
    } else {
      setActiveTab(tabId);
      setIsExpanded(true);
    }
  };

  return (
    <div className="fixed right-0 top-20 z-40 flex h-[calc(100vh-120px)]">
      {/* 확장된 콘텐츠 패널 */}
      <div
        className={`bg-white border border-r-0 border-slate-200 rounded-l-xl shadow-lg overflow-hidden transition-all duration-300 flex flex-col ${
          isExpanded ? "w-[260px] opacity-100" : "w-0 opacity-0"
        }`}
      >
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <h3 className="font-bold text-slate-800">
            {tabs.find((t) => t.id === activeTab)?.headerLabel}
          </h3>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            // 비로그인 상태
            <div className="h-full flex flex-col items-center justify-center px-4 py-8 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <FileText size={28} className="text-slate-300" />
              </div>
              <button
                onClick={onShowLogin}
                className="text-slate-500 hover:text-blue-600 underline underline-offset-2 transition-colors text-sm"
              >
                로그인이 필요해요
              </button>
            </div>
          ) : isLoading ? (
            // 로딩 상태
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === "favorites" ? (
            // 관심 목록
            favoritesList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center px-4 py-8 text-center">
                <Heart size={32} className="text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">
                  관심 종목을 추가해보세요
                </p>
              </div>
            ) : (
              <ul>
                {favoritesList.map((item) => (
                  <li key={item.companyId}>
                    <div className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50">
                      {/* 클릭 가능한 기업 정보 영역 */}
                      <button
                        onClick={() => handleCompanyClick(item.companyId)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        {/* 로고 */}
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {item.logoUrl ? (
                            <img
                              src={item.logoUrl}
                              alt={item.companyName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">
                              {item.companyName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        {/* 기업명 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {item.companyName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.companyId}
                          </p>
                        </div>
                      </button>
                      {/* 관심 해제 버튼 */}
                      <button
                        onClick={() => toggleStar(item.companyId)}
                        className="p-1.5 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                        title="관심 해제"
                        aria-label={`${item.companyName} 관심 해제`}
                      >
                        <Heart
                          size={18}
                          fill="#EF4444"
                          className="text-red-500"
                        />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : activeTab === "portfolio" ? (
            // 내 비교 세트 목록
            isComparisonsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comparisonList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center px-4 py-8 text-center">
                <Scale size={32} className="text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">
                  비교 세트를 만들어보세요
                </p>
                <button
                  onClick={() => navigate("/compare")}
                  className="mt-3 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium"
                >
                  <ArrowLeft size={14} />
                  비교 페이지로 이동
                </button>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {comparisonDetails.map((query, index) => {
                  const comparison = query.data;
                  const listItem = comparisonList[index];
                  const isDetailLoading = query.isLoading;

                  return (
                    <button
                      key={listItem.id}
                      onClick={() => handleComparisonClick(listItem.id)}
                      className="w-full p-3 bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors text-left group"
                    >
                      {/* 세트 이름 */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-slate-800 group-hover:text-blue-600 truncate">
                          {listItem.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {comparison?.companies?.length ??
                            listItem.companyCount ??
                            0}
                          개
                        </span>
                      </div>
                      {/* 기업 뱃지 */}
                      <div className="flex flex-wrap gap-1">
                        {isDetailLoading ? (
                          <div className="flex gap-1">
                            <span className="px-2 py-0.5 bg-slate-200 rounded-full text-xs animate-pulse w-12 h-5" />
                            <span className="px-2 py-0.5 bg-slate-200 rounded-full text-xs animate-pulse w-10 h-5" />
                          </div>
                        ) : comparison?.companies?.length ? (
                          comparison.companies.slice(0, 4).map((company) => (
                            <span
                              key={company.stock_code}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 truncate max-w-20"
                            >
                              {company.companyName}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            기업이 없습니다.
                          </span>
                        )}
                        {comparison?.companies &&
                          comparison.companies.length > 4 && (
                            <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs text-slate-500">
                              +{comparison.companies.length - 4}
                            </span>
                          )}
                      </div>
                    </button>
                  );
                })}
                {/* 새 비교 만들기 버튼 */}
                <button
                  onClick={() => navigate("/compare")}
                  className="w-full p-3 border border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl transition-colors flex items-center justify-center gap-1 text-slate-400 hover:text-blue-500"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm">비교 페이지로 이동</span>
                </button>
              </div>
            )
          ) : activeTab === "recent" ? (
            // 최근 본 목록
            isVisitsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : visitList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center px-4 py-8 text-center">
                <Clock size={32} className="text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">
                  최근 본 종목이 없습니다
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* 전체 삭제 버튼 */}
                <div className="px-4 py-2 border-b border-slate-100 flex justify-end">
                  <button
                    onClick={() => clearVisitsMutation.mutate()}
                    disabled={clearVisitsMutation.isPending}
                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    전체 삭제
                  </button>
                </div>
                <ul className="flex-1 overflow-y-auto">
                  {visitList.map((item) => (
                    <li key={item.visitId}>
                      <div className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50">
                        {/* 클릭 가능한 기업 정보 영역 */}
                        <button
                          onClick={() => handleCompanyClick(item.stockCode)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          {/* 로고 */}
                          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {item.logoUrl ? (
                              <img
                                src={item.logoUrl}
                                alt={item.companyName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <span className="text-xs font-bold text-slate-400">
                                {item.companyName?.charAt(0)}
                              </span>
                            )}
                          </div>
                          {/* 기업명 */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {item.companyName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {item.stockCode}
                            </p>
                          </div>
                        </button>
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() =>
                            removeVisitMutation.mutate(item.visitId)
                          }
                          disabled={removeVisitMutation.isPending}
                          className="p-1.5 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
                          title="삭제"
                          aria-label={`${item.companyName} 방문 기록 삭제`}
                        >
                          <X size={16} className="text-slate-400" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : (
            // 다른 탭 (준비 중)
            <div className="h-full flex flex-col items-center justify-center px-4 py-8 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                {React.createElement(
                  tabs.find((t) => t.id === activeTab)?.icon || Heart,
                  { size: 28, className: "text-slate-300" },
                )}
              </div>
              <p className="text-sm text-slate-400">준비 중입니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 아이콘 탭 바 */}
      <div className="w-14 bg-white border border-slate-200 rounded-l-xl shadow-lg flex flex-col items-center py-3 gap-1">
        {/* 접기/펼치기 버튼 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "사이드바 접기" : "사이드바 펼치기"}
          className="w-10 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 mb-2"
        >
          {isExpanded ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="w-8 border-t border-slate-100 mb-2" />

        {/* 탭 아이콘들 */}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && isExpanded;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`w-10 py-2.5 flex flex-col items-center gap-1 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-medium whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesSidebar;
