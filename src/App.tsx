import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Dashboard from "./pages/Dashboard";
import CompanyDetail from "./pages/CompanyDetail";
import IndustryAnalysis from "./pages/IndustryCompare";
import CompanyCompare from "./pages/CompanyCompare";
import CompanySearch from "./pages/CompanySearch";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import SearchModal from "./components/Layout/SearchModal";
import { PageView } from "./types";
import { StarredProvider, useStarred } from "./context/StarredContext";

const queryClient = new QueryClient();

/**
 * 기업 상세 페이지 (독립 라우트용)
 */
function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { starred, toggleStar } = useStarred();
  const navigate = useNavigate();

  // 네비게이션 처리 함수
  const handlePageChange = (page: PageView) => {
    if (page === PageView.DASHBOARD) {
      navigate("/");
    } else if (page === PageView.COMPANY_SEARCH) {
      navigate("/search");
    }
  };

  return (
    <div className="font-sans text-slate-800 min-h-screen pb-10 bg-white">
      <div className="sticky top-0 z-50">
        <Navbar
          currentPage={PageView.COMPANY_DETAIL}
          setPage={handlePageChange}
        />
      </div>
      <main className="container mx-auto px-4 pt-6 max-w-7xl">
        {/* URL 파라미터 id를 우선적으로 사용 */}
        <CompanyDetail
          setPage={handlePageChange}
          starred={starred}
          onToggleStar={toggleStar}
          companyCode={id}
        />
      </main>
      <footer className="mt-12 border-t border-slate-200 py-8 bg-white text-center">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-6 mb-4 text-sm text-slate-500">
            <a href="#" className="hover:text-shinhan-blue">
              개인정보처리방침
            </a>
            <a href="#" className="hover:text-shinhan-blue">
              이용약관
            </a>
            <a href="#" className="hover:text-shinhan-blue">
              고객센터
            </a>
          </div>
          <p className="text-xs text-slate-400">
            Copyright © BIZSCOPE. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<PageView>(PageView.DASHBOARD);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("finance");
  const [selectedCompanyCode, setSelectedCompanyCode] =
    useState<string>("055550");

  const { starred, toggleStar } = useStarred();
  const navigate = useNavigate();

  // UI 상태 관리
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const isDashboard = page === PageView.DASHBOARD;

  const handlePageChange = (newPage: PageView) => {
    if (newPage === PageView.LOGIN) {
      setShowLogin(true);
    } else if (newPage === PageView.SIGN_UP) {
      setShowSignUp(true);
    } else if (newPage === PageView.COMPANY_DETAIL) {
      // 상세 페이지 이동 시 URL 기반 라우팅으로 전환
      navigate(`/company/${selectedCompanyCode}`);
    } else {
      setShowLogin(false);
      setShowSignUp(false);
      setPage(newPage);
    }
  };

  const handleIndustryClick = (indutyCode: string) => {
    setSelectedIndustry(indutyCode);
    setPage(PageView.INDUSTRY_ANALYSIS);
  };

  const showNavbar = !isDashboard || isNavbarVisible;

  const renderPage = () => {
    switch (page) {
      case PageView.DASHBOARD:
        return (
          <Dashboard
            setPage={handlePageChange}
            onIndustryClick={handleIndustryClick}
            onShowNavbar={setIsNavbarVisible}
          />
        );
      case PageView.COMPANY_SEARCH:
        return (
          <CompanySearch
            setPage={handlePageChange}
            starred={starred}
            onToggleStar={toggleStar}
            setCompanyCode={(code) => {
              setSelectedCompanyCode(code);
              navigate(`/company/${code}`);
            }}
          />
        );
      case PageView.INDUSTRY_ANALYSIS:
        return (
          <IndustryAnalysis
            setPage={handlePageChange}
            initialIndutyCode={selectedIndustry}
            starred={starred}
            onToggleStar={toggleStar}
            setCompanyCode={setSelectedCompanyCode}
          />
        );
      case PageView.COMPANY_COMPARE:
        return <CompanyCompare setPage={handlePageChange} />;
      default:
        return (
          <Dashboard
            setPage={handlePageChange}
            onIndustryClick={handleIndustryClick}
            onShowNavbar={setIsNavbarVisible}
          />
        );
    }
  };

  return (
    <div
      className={`font-sans text-slate-800 transition-all duration-500 ${isDashboard ? "h-screen flex flex-col overflow-hidden bg-[#002C9C]" : "min-h-screen pb-10 bg-white"}`}
    >
      <div
        className={`z-50 transition-all duration-500 ease-in-out ${isDashboard ? "fixed top-0 left-0 right-0" : "sticky top-0"} ${!showNavbar ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
      >
        <Navbar
          currentPage={page}
          setPage={handlePageChange}
          isLoggedIn={isLoggedIn}
          onLogout={() => setIsLoggedIn(false)}
          onSearchOpen={() => setShowSearch(true)}
        />
      </div>

      <main
        className={
          isDashboard
            ? "w-full h-screen relative overflow-hidden"
            : "container mx-auto px-4 pt-6 max-w-7xl"
        }
      >
        {renderPage()}
      </main>

      {!isDashboard && (
        <footer className="mt-12 border-t border-slate-200 py-8 bg-white text-center">
          <p className="text-xs text-slate-400">
            Copyright © BIZSCOPE. All Rights Reserved.
          </p>
        </footer>
      )}

      {showLogin && (
        <Login
          setPage={handlePageChange}
          onClose={() => setShowLogin(false)}
          onLogin={() => setIsLoggedIn(true)}
        />
      )}
      {showSignUp && (
        <SignUp
          setPage={handlePageChange}
          onClose={() => setShowSignUp(false)}
        />
      )}

      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        setPage={handlePageChange}
        onSearchSelect={(code) => {
          setSelectedCompanyCode(code);
          setShowSearch(false);
          navigate(`/company/${code}`);
        }}
      />
    </div>
  );
}

function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <StarredProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/company/:id" element={<CompanyDetailPage />} />
            <Route path="/*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </StarredProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default AppWrapper;
