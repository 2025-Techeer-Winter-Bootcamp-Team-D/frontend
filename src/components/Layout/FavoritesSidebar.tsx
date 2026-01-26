import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Heart,
  Clock,
  FileText,
} from "lucide-react";
import { useStarred } from "../../context/StarredContext";
import { useAuth } from "../../hooks/useAuth";

type TabType = "portfolio" | "favorites" | "recent" | "realtime";

interface FavoritesSidebarProps {
  onShowLogin?: () => void;
}

const FavoritesSidebar: React.FC<FavoritesSidebarProps> = ({ onShowLogin }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("favorites");
  const { favoriteMap, isLoading } = useStarred();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: "portfolio" as TabType, label: "내 투자", icon: TrendingUp },
    { id: "favorites" as TabType, label: "관심", icon: Heart },
    { id: "recent" as TabType, label: "최근 본", icon: Clock },
  ];

  const favoritesList = Array.from(favoriteMap.values());

  const handleCompanyClick = (companyId: string) => {
    navigate(`/company/${companyId}`);
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
            {tabs.find((t) => t.id === activeTab)?.label}
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
                    <button
                      onClick={() => handleCompanyClick(item.companyId)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50"
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
                  </li>
                ))}
              </ul>
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
