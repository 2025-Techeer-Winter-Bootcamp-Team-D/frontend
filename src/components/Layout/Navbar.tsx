import React from "react";
import { PageView } from "../../types";
import { Search, User } from "lucide-react";

interface NavbarProps {
  currentPage: PageView;
  setPage: (page: PageView) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onSearchOpen?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setPage,
  isLoggedIn = false,
  onLogout,
  onSearchOpen,
}) => {
  const handleLogoClick = () => {
    if (currentPage === PageView.DASHBOARD) {
      window.dispatchEvent(new CustomEvent("dashboard-scroll-top"));
    } else {
      setPage(PageView.DASHBOARD);
    }
  };

  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-3 shadow-sm transition-all duration-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side Group: Logo + Nav */}
        <div className="flex items-center gap-8">
          {/* Logo Area */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <img src="/logo_new.png" alt="Shinhan Insight" className="h-8" />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setPage(PageView.COMPANY_SEARCH)}
              className={`text-sm transition-colors ${
                currentPage === PageView.COMPANY_SEARCH
                  ? "text-[#0046ff] font-bold"
                  : "text-gray-500 hover:text-slate-800 font-medium"
              }`}
            >
              기업검색
            </button>
            <button
              onClick={() => setPage(PageView.COMPANY_DETAIL)}
              className={`text-sm transition-colors ${
                currentPage === PageView.COMPANY_DETAIL
                  ? "text-[#0046ff] font-bold"
                  : "text-gray-500 hover:text-slate-800 font-medium"
              }`}
            >
              기업정보
            </button>
            <button
              onClick={() => setPage(PageView.COMPANY_COMPARE)}
              className={`text-sm transition-colors ${
                currentPage === PageView.COMPANY_COMPARE
                  ? "text-[#0046ff] font-bold"
                  : "text-gray-500 hover:text-slate-800 font-medium"
              }`}
            >
              기업비교
            </button>
            <button
              onClick={() => setPage(PageView.INDUSTRY_ANALYSIS)}
              className={`text-sm transition-colors ${
                currentPage === PageView.INDUSTRY_ANALYSIS
                  ? "text-[#0046ff] font-bold"
                  : "text-gray-500 hover:text-slate-800 font-medium"
              }`}
            >
              산업
            </button>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3 text-gray-600">
          {onSearchOpen && (
            <button
              onClick={onSearchOpen}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
            >
              <Search size={18} />
            </button>
          )}
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              disabled={!onLogout}
              aria-label="로그아웃"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors border border-transparent ${
                onLogout
                  ? "hover:bg-gray-50 hover:border-gray-200 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="w-6 h-6 bg-[#0046ff] rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-sm font-medium hidden lg:block text-slate-700">
                로그아웃
              </span>
            </button>
          ) : (
            <button
              onClick={() => setPage(PageView.LOGIN)}
              aria-label="로그인"
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
  );
};

export default Navbar;
