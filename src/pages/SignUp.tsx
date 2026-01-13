import React, { useState } from 'react';
import { PageView } from '../types';
import GlassCard from '../components/Layout/GlassCard';
import { User, Mail, Lock, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';

interface SignUpProps {
  setPage: (page: PageView) => void;
}

const SignUp: React.FC<SignUpProps> = ({ setPage }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#002C9C]">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <GlassCard className="p-8 md:p-10 bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">회원가입</h1>
            <p className="text-slate-500 text-sm">
              서비스 이용을 위해 정보를 입력해주세요
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            
            {/* Name Fields Row */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 ml-1">성</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400 group-focus-within:text-shinhan-blue transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="홍"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-slate-800 placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 ml-1">이름</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400 group-focus-within:text-shinhan-blue transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="길동"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-slate-800 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">이메일</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400 group-focus-within:text-shinhan-blue transition-colors" />
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
              <label className="text-xs font-bold text-slate-600 ml-1">비밀번호</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-shinhan-blue transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-slate-800 placeholder:text-gray-400 font-sans"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">비밀번호 확인</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-shinhan-blue transition-colors" />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력해주세요"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-shinhan-blue focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-slate-800 placeholder:text-gray-400 font-sans"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${agreed ? 'bg-shinhan-blue border-shinhan-blue' : 'bg-white border-gray-300 group-hover:border-shinhan-blue'}`}>
                   {agreed && <Check size={14} className="text-white" strokeWidth={3} />}
                   <input type="checkbox" className="hidden" checked={agreed} onChange={() => setAgreed(!agreed)} />
                </div>
                <span className="text-sm text-slate-600 select-none">
                  <span className="text-shinhan-blue font-bold hover:underline">이용약관</span> 및 <span className="text-shinhan-blue font-bold hover:underline">개인정보 처리방침</span>에 동의합니다
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              onClick={() => setPage(PageView.DASHBOARD)}
              className="w-full py-4 bg-shinhan-blue hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] mt-4"
            >
              계정 생성
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              이미 계정이 있으신가요?{' '}
              <button 
                onClick={() => setPage(PageView.DASHBOARD)} // Assuming Login redirects to dashboard for now
                className="font-bold text-shinhan-blue hover:text-blue-700 ml-1 hover:underline"
              >
                로그인
              </button>
            </p>
          </div>
        </GlassCard>

        {/* Back to Home (Optional) */}
        <button 
          onClick={() => setPage(PageView.DASHBOARD)}
          className="absolute top-[-50px] left-0 text-white/70 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default SignUp;