import React, { useState } from "react";
import { PageView } from "../types";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";

interface LoginProps {
  setPage: (page: PageView) => void;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ setPage, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="w-full max-w-md relative z-10 animate-fade-in-up pointer-events-auto">
        <div className="p-8 md:p-10 bg-white border border-gray-200 shadow-2xl rounded-3xl relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">로그인</h1>
            <p className="text-slate-500 text-sm">
              신한 파이낸셜 인사이트에 오신 것을 환영합니다
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">
                이메일
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail
                    size={18}
                    className="text-gray-400 group-focus-within:text-shinhan-blue transition-colors"
                  />
                </div>
                <input
                  type="email"
                  placeholder="example@shinhan.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-slate-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">
                비밀번호
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock
                    size={18}
                    className="text-gray-400 group-focus-within:text-shinhan-blue transition-colors"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호 입력"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-slate-800 placeholder:text-gray-400 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              onClick={() => setPage(PageView.DASHBOARD)}
              className="w-full py-4 bg-shinhan-blue hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] mt-6"
            >
              로그인
            </button>
          </form>

          {/* SignUp Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              계정이 없으신가요?{" "}
              <button
                onClick={() => setPage(PageView.SIGN_UP)}
                className="font-bold text-shinhan-blue hover:text-blue-700 ml-1 hover:underline"
              >
                회원가입
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
