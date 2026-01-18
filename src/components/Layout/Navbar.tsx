import React, { useState } from "react";
import { PageView } from "../../types";
import {
  Search,
  Bell,
  User,
  X,
  TrendingUp,
  Check,
  AlertTriangle,
  TrendingDown,
  Newspaper,
} from "lucide-react";

interface NavbarProps {
  currentPage: PageView;
  setPage: (page: PageView) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onSearchOpen?: () => void;
}

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "alert",
    title: "급등 알림",
    message: "신한지주가 5% 이상 상승했습니다.",
    time: "10분 전",
    read: false,
  },
  {
    id: 2,
    type: "news",
    title: "뉴스 알림",
    message: "삼성전자 실적 발표 관련 뉴스가 있습니다.",
    time: "30분 전",
    read: false,
  },
  {
    id: 3,
    type: "drop",
    title: "급락 알림",
    message: "SK하이닉스가 3% 이상 하락했습니다.",
    time: "1시간 전",
    read: true,
  },
  {
    id: 4,
    type: "news",
    title: "리포트 알림",
    message: "KB금융 신규 애널리스트 리포트가 발행되었습니다.",
    time: "2시간 전",
    read: true,
  },
];

const getNotiIcon = (type: string) => {
  switch (type) {
    case "alert":
      return <TrendingUp size={16} className="text-green-600" />;
    case "drop":
      return <TrendingDown size={16} className="text-red-600" />;
    case "news":
      return <Newspaper size={16} className="text-blue-600" />;
    default:
      return <AlertTriangle size={16} className="text-yellow-600" />;
  }
};

const getNotiColor = (type: string) => {
  switch (type) {
    case "alert":
      return "bg-green-100";
    case "drop":
      return "bg-red-100";
    case "news":
      return "bg-blue-100";
    default:
      return "bg-yellow-100";
  }
};

const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setPage,
  isLoggedIn = false,
  onLogout,
  onSearchOpen,
}) => {
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleLogoClick = () => {
    if (currentPage === PageView.DASHBOARD) {
      window.dispatchEvent(new CustomEvent("dashboard-scroll-top"));
    } else {
      setPage(PageView.DASHBOARD);
    }
  };

  return (
    <>
      {/* 
          Updated Navbar:
          - Added '기업검색' tab
      */}
      <nav className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-3 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Side Group: Logo + Nav */}
          <div className="flex items-center gap-8">
            {/* Logo Area */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleLogoClick}
            >
              <div className="flex items-center justify-center text-shinhan-blue font-black text-xl italic">
                S
              </div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">
                Shinhan <span className="text-shinhan-blue">Insight</span>
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => setPage(PageView.COMPANY_SEARCH)}
                className={`text-sm transition-colors ${
                  currentPage === PageView.COMPANY_SEARCH
                    ? "text-shinhan-blue font-bold"
                    : "text-gray-500 hover:text-slate-800 font-medium"
                }`}
              >
                기업검색
              </button>
              <button
                onClick={() => setPage(PageView.COMPANY_DETAIL)}
                className={`text-sm transition-colors ${
                  currentPage === PageView.COMPANY_DETAIL
                    ? "text-shinhan-blue font-bold"
                    : "text-gray-500 hover:text-slate-800 font-medium"
                }`}
              >
                기업정보
              </button>
              <button
                onClick={() => setPage(PageView.COMPANY_COMPARE)}
                className={`text-sm transition-colors ${
                  currentPage === PageView.COMPANY_COMPARE
                    ? "text-shinhan-blue font-bold"
                    : "text-gray-500 hover:text-slate-800 font-medium"
                }`}
              >
                기업비교
              </button>
              <button
                onClick={() => setPage(PageView.INDUSTRY_ANALYSIS)}
                className={`text-sm transition-colors ${
                  currentPage === PageView.INDUSTRY_ANALYSIS
                    ? "text-shinhan-blue font-bold"
                    : "text-gray-500 hover:text-slate-800 font-medium"
                }`}
              >
                산업
              </button>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3 text-gray-600">
            <button
              onClick={onSearchOpen}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
            >
              <Search size={18} />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsNotiOpen(!isNotiOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotiOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[55]"
                    onClick={() => setIsNotiOpen(false)}
                  ></div>
                  <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] animate-fade-in-up overflow-hidden flex flex-col origin-top-right">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        알림
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleMarkAllRead}
                          disabled={unreadCount === 0}
                          className={`text-xs font-medium flex items-center gap-1 transition-colors ${unreadCount > 0 ? "text-gray-500 hover:text-shinhan-blue" : "text-gray-300 cursor-not-allowed"}`}
                        >
                          <Check size={12} /> 모두 읽음
                        </button>
                        <button
                          onClick={() => setIsNotiOpen(false)}
                          className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                          <Bell size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">알림이 없습니다</p>
                        </div>
                      ) : (
                        notifications.map((note) => (
                          <div
                            key={note.id}
                            onClick={() => handleMarkAsRead(note.id)}
                            className={`p-4 border-b border-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer flex gap-3 group relative ${!note.read ? "bg-blue-50/30" : ""}`}
                          >
                            {!note.read && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-shinhan-blue"></div>
                            )}
                            <div
                              className={`mt-1 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${getNotiColor(note.type)}`}
                            >
                              {getNotiIcon(note.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4
                                  className={`text-sm ${!note.read ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}
                                >
                                  {note.title}
                                </h4>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                  {note.time}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 leading-snug line-clamp-2 group-hover:text-slate-700 transition-colors">
                                {note.message}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(note.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-all shrink-0 self-center"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            {isLoggedIn ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-6 h-6 bg-shinhan-blue rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium hidden lg:block text-slate-700">
                  로그아웃
                </span>
              </button>
            ) : (
              <button
                onClick={() => setPage(PageView.LOGIN)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                  <User size={14} className="text-slate-500" />
                </div>
                <span className="text-sm font-medium hidden lg:block text-slate-700">
                  로그인
                </span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
