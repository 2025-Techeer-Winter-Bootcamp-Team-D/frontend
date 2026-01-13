import React, { useState } from "react";
import Navbar from "./components/Layout/Navbar";
import Dashboard from "./pages/Dashboard";
import CompanyDetail from "./pages/CompanyDetail";
import IndustryAnalysis from "./pages/IndustryCompare";
import CompanyCompare from "./pages/CompanyCompare";
import CompanySearch from "./pages/CompanySearch";
import SignUp from "./pages/SignUp";
import { PageView } from "./types";

function App() {
  const [page, setPage] = useState<PageView>(PageView.DASHBOARD);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("finance");
  const [selectedCompanyCode, setSelectedCompanyCode] =
    useState<string>("055550");
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const isDashboard = page === PageView.DASHBOARD;
  const isAuthPage = page === PageView.SIGN_UP || page === PageView.LOGIN;

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
            setPage={setPage}
            onIndustryClick={handleIndustryClick}
            onShowNavbar={setIsNavbarVisible}
          />
        );
      case PageView.COMPANY_SEARCH:
        return (
          <CompanySearch
            setPage={setPage}
            starred={starred}
            onToggleStar={toggleStar}
            setCompanyCode={setSelectedCompanyCode}
          />
        );
      case PageView.COMPANY_DETAIL:
        return (
          <CompanyDetail
            setPage={setPage}
            starred={starred}
            onToggleStar={toggleStar}
            companyCode={selectedCompanyCode}
            setCompanyCode={setSelectedCompanyCode}
          />
        );
      case PageView.INDUSTRY_ANALYSIS:
        return (
          <IndustryAnalysis
            setPage={setPage}
            initialIndustryId={selectedIndustry}
            starred={starred}
            onToggleStar={toggleStar}
          />
        );
      case PageView.COMPANY_COMPARE:
        return <CompanyCompare setPage={setPage} />;
      case PageView.SIGN_UP:
        return <SignUp setPage={setPage} />;
      case PageView.LOGIN:
        return (
          <Dashboard
            setPage={setPage}
            onIndustryClick={handleIndustryClick}
            onShowNavbar={setIsNavbarVisible}
          />
        );
      default:
        return (
          <Dashboard
            setPage={setPage}
            onIndustryClick={handleIndustryClick}
            onShowNavbar={setIsNavbarVisible}
          />
        );
    }
  };

  // Auth pages have their own layout
  if (isAuthPage) {
    return <div className="font-sans text-slate-800">{renderPage()}</div>;
  }

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
          setPage={setPage}
          onSearchSelect={setSelectedCompanyCode}
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
    </div>
  );
}

export default App;
