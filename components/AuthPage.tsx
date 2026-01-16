import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { User, Lock, Mail, Eye, EyeOff, ArrowRight, UserPlus, KeyRound } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'reset';

export const AuthPage: React.FC = () => {
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(username, password);
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        if (password.length < 6) {
          throw new Error('비밀번호는 6자 이상이어야 합니다.');
        }
        await register(username, email, password);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccess('비밀번호 재설정 안내가 이메일로 전송되었습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">K</span>
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-[#1A1D2E]">K-COAT </span>
              <span className="text-[#FF6B35]">STUDIO</span>
            </h1>
          </div>
          <p className="text-gray-500">블로그 자동화 대시보드</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                mode === 'login'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                mode === 'register'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  아이디
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>
            )}

            {(mode === 'register' || mode === 'reset') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>
            )}

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  비밀번호 확인
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF6B35] hover:bg-[#e55a2b] text-white py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  로그인 <ArrowRight className="w-5 h-5" />
                </>
              ) : mode === 'register' ? (
                <>
                  회원가입 <UserPlus className="w-5 h-5" />
                </>
              ) : (
                <>
                  비밀번호 재설정 <KeyRound className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'login' && (
              <button
                onClick={() => switchMode('reset')}
                className="text-sm text-gray-500 hover:text-[#FF6B35] transition-colors"
              >
                비밀번호를 잊으셨나요?
              </button>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => switchMode('login')}
                className="text-sm text-gray-500 hover:text-[#FF6B35] transition-colors"
              >
                로그인으로 돌아가기
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          © 2024 K-COAT Studio. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
