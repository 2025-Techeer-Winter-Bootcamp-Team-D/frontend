import React, { useState } from "react";
import { PageView } from "../types";
import { Mail, Lock, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { signup } from "../api/users";
import GlassCard from "../components/Layout/GlassCard";
import { useMutation } from "@tanstack/react-query";

interface SignUpProps {
  setPage: (page: PageView) => void;
  onClose: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ setPage, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // useMutation을 사용하여 회원가입 로직 관리
  const { mutate, isPending } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      setPage(PageView.LOGIN);
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    },
  });

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!agreed) {
      setError("이용약관에 동의해주세요.");
      return;
    }

    // mutate 함수 호출
    mutate({ email, password, password2: confirmPassword });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-12 pb-4 px-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <GlassCard className="w-full max-w-md relative z-10 p-6 md:p-7 animate-fade-in max-h-[80vh] overflow-y-auto">
        <button
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">회원가입</h1>
          <p className="text-slate-500 text-sm">
            서비스 이용을 위해 정보를 입력해주세요
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSignUp}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 ml-1">
              이메일
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail
                  size={18}
                  className="text-gray-400 group-focus-within:text-blue-600 transition-colors"
                />
              </div>
              <input
                type="email"
                placeholder="example@shinhan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 ml-1">
              비밀번호
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock
                  size={18}
                  className="text-gray-400 group-focus-within:text-blue-600 transition-colors"
                />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="8자 이상 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-slate-800"
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 ml-1">
              비밀번호 확인
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock
                  size={18}
                  className="text-gray-400 group-focus-within:text-blue-600 transition-colors"
                />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호 재입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  agreed
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300"
                }`}
              >
                {agreed && (
                  <Check size={14} className="text-white" strokeWidth={3} />
                )}
                <input
                  type="checkbox"
                  className="hidden"
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                />
              </div>
              <span className="text-sm text-slate-600 select-none">
                이용약관에 동의합니다
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                가입 중...
              </>
            ) : (
              "계정 생성"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              onClick={() => setPage(PageView.LOGIN)}
              className="font-bold text-blue-600 hover:underline ml-1"
            >
              로그인
            </button>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default SignUp;
