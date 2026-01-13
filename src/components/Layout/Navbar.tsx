import React, { useState, useEffect, useRef } from 'react';
import { PageView } from '../../types';
import { Search, Bell, User, X, ChevronRight, TrendingUp } from 'lucide-react';

interface NavbarProps {
  currentPage: PageView;
  setPage: (page: PageView) => void;
  onSearchSelect?: (code: string) => void;
}

// Mock Data for Search Functionality
const MOCK_COMPANIES = [
  { name: '신한지주', code: '055550', type: 'KOSPI', change: '+0.51%' },
  { name: '삼성전자', code: '005930', type: 'KOSPI', change: '+0.96%' },
  { name: 'SK하이닉스', code: '000660', type: 'KOSPI', change: '+2.10%' },
  { name: '현대차', code: '005380', type: 'KOSPI', change: '-1.20%' },
  { name: 'KB금융', code: '105560', type: 'KOSPI', change: '+1.12%' },
  { name: '하나금융', code: '086790', type: 'KOSPI', change: '-0.32%' },
  { name: '카카오뱅크', code: '323410', type: 'KOSPI', change: '-1.50%' },
  { name: '에코프로비엠', code: '247540', type: 'KOSDAQ', change: '-0.80%' },
  { name: 'LG에너지솔루션', code: '373220', type: 'KOSPI', change: '-1.50%' },
];

const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage, onSearchSelect }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleCompanyClick = (code: string) => {
    if (onSearchSelect) {
      onSearchSelect(code);
    }
    setPage(PageView.COMPANY_DETAIL);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleLogoClick = () => {
    if (currentPage === PageView.DASHBOARD) {
        window.dispatchEvent(new CustomEvent('dashboard-scroll-top'));
    } else {
        setPage(PageView.DASHBOARD);
    }
  };

  const filteredCompanies = searchQuery
    ? MOCK_COMPANIES.filter(c => 
        c.name.includes(searchQuery) || c.code.includes(searchQuery)
      )
    : [];

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
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
                <div className="flex items-center justify-center text-shinhan-blue font-black text-xl italic">
                S
                </div>
                <span className="text-lg font-bold text-slate-800 tracking-tight">Shinhan <span className="text-shinhan-blue">Insight</span></span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
                <button
                onClick={() => setPage(PageView.COMPANY_SEARCH)}
                className={`text-sm transition-colors ${
                    currentPage === PageView.COMPANY_SEARCH
                    ? 'text-shinhan-blue font-bold'
                    : 'text-gray-500 hover:text-slate-800 font-medium'
                }`}
                >
                기업검색
                </button>
                <button
                onClick={() => setPage(PageView.COMPANY_DETAIL)}
                className={`text-sm transition-colors ${
                    currentPage === PageView.COMPANY_DETAIL
                    ? 'text-shinhan-blue font-bold'
                    : 'text-gray-500 hover:text-slate-800 font-medium'
                }`}
                >
                기업정보
                </button>
                <button
                onClick={() => setPage(PageView.COMPANY_COMPARE)}
                className={`text-sm transition-colors ${
                    currentPage === PageView.COMPANY_COMPARE
                    ? 'text-shinhan-blue font-bold'
                    : 'text-gray-500 hover:text-slate-800 font-medium'
                }`}
                >
                기업비교
                </button>
                <button
                onClick={() => setPage(PageView.INDUSTRY_ANALYSIS)}
                className={`text-sm transition-colors ${
                    currentPage === PageView.INDUSTRY_ANALYSIS
                    ? 'text-shinhan-blue font-bold'
                    : 'text-gray-500 hover:text-slate-800 font-medium'
                }`}
                >
                산업
                </button>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3 text-gray-600">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
            >
              <Search size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <button 
              onClick={() => setPage(PageView.SIGN_UP)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                <User size={14} className="text-slate-500" />
              </div>
              <span className="text-sm font-medium hidden lg:block text-slate-700">김신한</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-32 px-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSearchOpen(false)}
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
                onClick={() => setIsSearchOpen(false)}
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
                          <ChevronRight size={16} className="text-gray-300 ml-auto mt-1 group-hover:text-shinhan-blue group-hover:translate-x-1 transition-all" />
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
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">최근 검색어</h4>
                    <div className="flex flex-wrap gap-2">
                      {['신한지주', '2차전지', '삼성전자'].map((tag) => (
                        <button key={tag} onClick={() => setSearchQuery(tag)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-slate-600 font-medium transition-colors">
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">인기 종목</h4>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => handleCompanyClick('055550')} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left">
                          <span className="text-red-500 font-bold text-sm">1</span>
                          <span className="font-bold text-slate-700 text-sm">신한지주</span>
                          <TrendingUp size={14} className="text-red-500 ml-auto" />
                       </button>
                       <button onClick={() => handleCompanyClick('005930')} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left">
                          <span className="text-red-500 font-bold text-sm">2</span>
                          <span className="font-bold text-slate-700 text-sm">삼성전자</span>
                          <TrendingUp size={14} className="text-red-500 ml-auto" />
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;