import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Dashboard from "./pages/Dashboard";
import CompanyDetail from "./pages/CompanyDetail";
import IndustryAnalysis from "./pages/IndustryCompare";
import CompanyCompare from "./pages/CompanyCompare";
import CompanySearch from "./pages/CompanySearch";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import { PageView } from "./types";

function App() {
  const [page, setPage] = useState<PageView>(PageView.DASHBOARD);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("finance");
  const [selectedCompanyCode, setSelectedCompanyCode] =
    useState<string>("055550");
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isDashboard = page === PageView.DASHBOARD;

  const handlePageChange = (newPage: PageView) => {
    if (newPage === PageView.LOGIN) {
      setShowLogin(true);
      setShowSignUp(false);
    } else if (newPage === PageView.SIGN_UP) {
      setShowSignUp(true);
      setShowLogin(false);
    } else {
      setShowLogin(false);
      setShowSignUp(false);
      setPage(newPage);
    }
  };

  const handleCloseAuth = () => {
    setShowLogin(false);
    setShowSignUp(false);
  };

  const handleIndustryClick = (industryId: string) => {
    setSelectedIndustry(industryId);
    setPage(PageView.INDUSTRY_ANALYSIS);
  };

  const toggleStar = (code: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  // Logic to show/hide navbar:
  // If we are NOT on dashboard, always show it.
  // If we are on dashboard, respect the isNavbarVisible state (controlled by scroll).
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
            setCompanyCode={setSelectedCompanyCode}
          />
        );
      case PageView.COMPANY_DETAIL:
        return (
          <CompanyDetail
            setPage={handlePageChange}
            starred={starred}
            onToggleStar={toggleStar}
            companyCode={selectedCompanyCode}
            setCompanyCode={setSelectedCompanyCode}
          />
        );
      case PageView.INDUSTRY_ANALYSIS:
        return (
          <IndustryAnalysis
            setPage={handlePageChange}
            initialIndustryId={selectedIndustry}
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
      {/*
          Navbar Container Logic:
          - Dashboard Mode: Fixed position (overlay), transitions Y-axis to hide/show.
          - Other Modes: Sticky position, always visible.
      */}
      <div
        className={`
          z-50 transition-all duration-500 ease-in-out
          ${isDashboard ? "fixed top-0 left-0 right-0" : "sticky top-0"}
          ${!showNavbar ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}
      `}
      >
        <Navbar
          currentPage={page}
          setPage={handlePageChange}
          onSearchSelect={setSelectedCompanyCode}
          isLoggedIn={isLoggedIn}
          onLogout={() => setIsLoggedIn(false)}
        />
      </div>

      {/*
          Main Content:
          - Dashboard: Full screen height (h-screen), handled internally by its scroll container.
          - Others: Standard container layout.
      */}
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
        <footer className="mt-12 border-t border-slate-200 py-8 bg-white">
          <div className="container mx-auto px-4 text-center">
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
              <a href="#" className="hover:text-shinhan-blue">
                신한은행 바로가기
              </a>
            </div>
            <p className="text-xs text-slate-400">
              Copyright © SHINHAN FINANCIAL GROUP. All Rights Reserved.
            </p>
          </div>
        </footer>
      )}

      {/* Login Popup */}
      {showLogin && (
        <Login
          setPage={handlePageChange}
          onClose={handleCloseAuth}
          onLogin={() => setIsLoggedIn(true)}
        />
      )}

      {/* SignUp Popup */}
      {showSignUp && (
        <SignUp setPage={handlePageChange} onClose={handleCloseAuth} />
      )}
    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/company/:id" element={<CompanyDetailPage />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

function CompanyDetailPage() {
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleStar = (code: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const setPage = (page: PageView) => {
    if (page === PageView.DASHBOARD) {
      navigate("/");
    }
  };

  return (
    <div className="font-sans text-slate-800 min-h-screen pb-10 bg-white">
      <div className="sticky top-0 z-50">
        <Navbar
          currentPage={PageView.COMPANY_DETAIL}
          setPage={setPage}
          onSearchSelect={() => {}}
        />
      </div>
      <main className="container mx-auto px-4 pt-6 max-w-7xl">
        <CompanyDetail
          setPage={setPage}
          starred={starred}
          onToggleStar={toggleStar}
        />
      </main>
      <footer className="mt-12 border-t border-slate-200 py-8 bg-white">
        <div className="container mx-auto px-4 text-center">
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
            <a href="#" className="hover:text-shinhan-blue">
              신한은행 바로가기
            </a>
          </div>
          <p className="text-xs text-slate-400">
            Copyright © SHINHAN FINANCIAL GROUP. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AppWrapper;
