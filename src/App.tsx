import { useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import FavoritesSidebar from "./components/Layout/FavoritesSidebar";
import SearchModal from "./components/Layout/SearchModal";
import { PageView } from "./types";
import { StarredProvider, useStarred } from "./context/StarredContext";
import { logout } from "./api/users";
import { notifyAuthChange, useAuth } from "./hooks/useAuth";

// 코드 스플리팅: 페이지 컴포넌트 지연 로딩
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CompanyDetail = lazy(() => import("./pages/CompanyDetail"));
const IndustryAnalysis = lazy(() => import("./pages/IndustryCompare"));
const CompanyCompare = lazy(() => import("./pages/CompanyCompare"));
const CompanySearch = lazy(() => import("./pages/CompanySearch"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Login = lazy(() => import("./pages/Login"));

// 로딩 폴백 컴포넌트
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

// URL 경로와 PageView 매핑
const PATH_TO_PAGE: Record<string, PageView> = {
  "/": PageView.DASHBOARD,
  "/search": PageView.COMPANY_SEARCH,
  "/compare": PageView.COMPANY_COMPARE,
  "/industry": PageView.INDUSTRY_ANALYSIS,
};

const PAGE_TO_PATH: Record<PageView, string> = {
  [PageView.DASHBOARD]: "/",
  [PageView.COMPANY_SEARCH]: "/search",
  [PageView.COMPANY_COMPARE]: "/compare",
  [PageView.INDUSTRY_ANALYSIS]: "/industry",
  [PageView.COMPANY_DETAIL]: "/company",
  [PageView.LOGIN]: "/",
  [PageView.SIGN_UP]: "/",
};

/**
 * 기업 상세 페이지 (독립 라우트용)
 */
function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { starred, toggleStar } = useStarred();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAuthenticated: isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // 네비게이션 처리 함수
  const handlePageChange = (page: PageView) => {
    if (page === PageView.LOGIN) {
      setShowSignUp(false);
      setShowLogin(true);
      return;
    }
    if (page === PageView.SIGN_UP) {
      setShowLogin(false);
      setShowSignUp(true);
      return;
    }
    if (page === PageView.COMPANY_DETAIL) {
      // 이미 기업 상세 페이지에 있으므로 상단으로 스크롤
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // 직접 해당 페이지 경로로 이동 (중간에 "/" 거치지 않음)
    const targetPath = PAGE_TO_PATH[page];
    navigate(targetPath);
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (error) {
      console.error("로그아웃 API 실패:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      qc.clear();
      notifyAuthChange();
    }
  };

  return (
    <div className="font-sans text-slate-800 min-h-screen pb-10 bg-white">
      <div className="sticky top-0 z-50">
        <Navbar
          currentPage={PageView.COMPANY_DETAIL}
          setPage={handlePageChange}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      </div>
      <main className="container mx-auto px-4 pt-6 max-w-7xl min-h-[calc(100vh-8rem)]">
        <Suspense fallback={<PageLoader />}>
          {/* URL 파라미터 id를 우선적으로 사용 */}
          <CompanyDetail
            setPage={handlePageChange}
            starred={starred}
            onToggleStar={toggleStar}
            companyCode={id}
          />
        </Suspense>
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

      {/* 즐겨찾기 사이드바 */}
      <FavoritesSidebar onShowLogin={() => setShowLogin(true)} />

      {/* 로그인/회원가입 모달 */}
      <Suspense fallback={null}>
        {showLogin && (
          <Login
            setPage={handlePageChange}
            onClose={() => setShowLogin(false)}
          />
        )}
        {showSignUp && (
          <SignUp
            setPage={handlePageChange}
            onClose={() => setShowSignUp(false)}
          />
        )}
      </Suspense>
    </div>
  );
}

function App() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("finance");
  const [selectedCompanyCode, setSelectedCompanyCode] =
    useState<string>("005930");

  const { starred, toggleStar } = useStarred();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const location = useLocation();

  // URL 경로로부터 현재 페이지 결정
  const getCurrentPageFromPath = useCallback((): PageView => {
    const path = location.pathname;
    if (path.startsWith("/industry")) return PageView.INDUSTRY_ANALYSIS;
    return PATH_TO_PAGE[path] ?? PageView.DASHBOARD;
  }, [location.pathname]);

  const page = getCurrentPageFromPath();

  // CompanyDetailPage에서 전달된 targetPage state 처리
  useEffect(() => {
    const state = location.state as { targetPage?: PageView } | null;
    if (state?.targetPage) {
      const targetPath = PAGE_TO_PATH[state.targetPage];
      // state 초기화하면서 해당 페이지로 이동
      navigate(targetPath, { replace: true, state: null });
    }
  }, [location.state, navigate]);

  // URL에서 industry code 읽어서 설정
  useEffect(() => {
    const match = location.pathname.match(/^\/industry\/(.+)$/);
    if (match && match[1]) {
      setSelectedIndustry(match[1]);
    }
  }, [location.pathname]);

  // UI 상태 관리
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // useAuth 훅으로 로그인 상태 관리 (accessToken 기반)
  const { isAuthenticated: isLoggedIn } = useAuth();

  const isDashboard = page === PageView.DASHBOARD;

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (error) {
      console.error("로그아웃 API 실패:", error);
    } finally {
      // 토큰 제거
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // React Query 캐시 초기화
      qc.clear();
      // 인증 상태 변경 알림 (useAuth 훅이 자동으로 감지)
      notifyAuthChange();
    }
  };

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
      // URL 경로를 변경하여 페이지 이동 (브라우저 히스토리에 기록됨)
      const targetPath = PAGE_TO_PATH[newPage];
      navigate(targetPath);
    }
  };

  const handleIndustryClick = (indutyCode: string) => {
    setSelectedIndustry(indutyCode);
    // URL 경로를 변경하여 산업 분석 페이지로 이동
    navigate(`/industry/${indutyCode}`);
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
        return (
          <CompanyCompare
            setPage={handlePageChange}
            onShowLogin={() => setShowLogin(true)}
          />
        );
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
      className={`font-sans text-slate-800 ${isDashboard ? "min-h-screen bg-white" : "min-h-screen pb-10 bg-white"}`}
    >
      <div
        className={`z-50 transition-all duration-500 ease-in-out ${isDashboard ? "fixed top-0 left-0 right-0" : "sticky top-0"} ${!showNavbar ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100 pointer-events-auto"}`}
      >
        <Navbar
          currentPage={page}
          setPage={handlePageChange}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onSearchOpen={() => setShowSearch(true)}
        />
      </div>

      <main
        className={
          isDashboard
            ? "w-full"
            : "container mx-auto px-4 pt-6 max-w-7xl min-h-[calc(100vh-8rem)]"
        }
      >
        <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
      </main>

      {!isDashboard && (
        <footer className="mt-12 border-t border-slate-200 py-8 bg-white text-center">
          <p className="text-xs text-slate-400">
            Copyright © BIZSCOPE. All Rights Reserved.
          </p>
        </footer>
      )}

      <Suspense fallback={null}>
        {showLogin && (
          <Login
            setPage={handlePageChange}
            onClose={() => setShowLogin(false)}
          />
        )}
        {showSignUp && (
          <SignUp
            setPage={handlePageChange}
            onClose={() => setShowSignUp(false)}
          />
        )}
      </Suspense>

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

      {/* 즐겨찾기 사이드바 (대시보드 제외) */}
      {!isDashboard && (
        <FavoritesSidebar onShowLogin={() => setShowLogin(true)} />
      )}
    </div>
  );
}

function AppWrapper() {
  return (
    <StarredProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/company/:id" element={<CompanyDetailPage />} />
          {/* 각 페이지에 고유 경로 부여 - 브라우저 뒤로가기 지원 */}
          <Route path="/" element={<App />} />
          <Route path="/search" element={<App />} />
          <Route path="/compare" element={<App />} />
          <Route path="/industry" element={<App />} />
          <Route path="/industry/:code" element={<App />} />
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </StarredProvider>
  );
}

export default AppWrapper;
