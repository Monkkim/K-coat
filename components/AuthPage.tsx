import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-success';

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', name: '' });
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '오류가 발생했습니다.');
      }

      setMode('reset-success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🏗️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1D2E]">K-COAT</h1>
              <span className="text-[#FF6B35] font-semibold">STUDIO</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {mode === 'login' && (
              <>
                <h2 className="text-2xl font-bold text-[#1A1D2E] mb-2">로그인</h2>
                <p className="text-gray-500 mb-6">K-COAT Studio에 오신 것을 환영합니다</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      아이디
                    </label>
                    <input
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
                      placeholder="아이디를 입력하세요"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="inline w-4 h-4 mr-1" />
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all pr-12"
                        placeholder="비밀번호를 입력하세요"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#FF6B35] text-white py-3 rounded-xl font-semibold hover:bg-[#e55a2a] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        로그인
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center space-y-2">
                  <button
                    onClick={() => { setMode('forgot-password'); setError(''); }}
                    className="text-sm text-gray-500 hover:text-[#FF6B35] transition-colors"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                  <div className="text-sm text-gray-500">
                    계정이 없으신가요?{' '}
                    <button
                      onClick={() => { setMode('register'); setError(''); }}
                      className="text-[#FF6B35] font-semibold hover:underline"
                    >
                      회원가입
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === 'register' && (
              <>
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="flex items-center gap-1 text-gray-500 hover:text-[#FF6B35] mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  로그인으로 돌아가기
                </button>

                <h2 className="text-2xl font-bold text-[#1A1D2E] mb-2">회원가입</h2>
                <p className="text-gray-500 mb-6">새 계정을 만들어 시작하세요</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      이름
                    </label>
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
                      placeholder="이름을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      아이디 *
                    </label>
                    <input
                      type="text"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
                      placeholder="사용할 아이디를 입력하세요"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      이메일 *
                    </label>
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
                      placeholder="이메일을 입력하세요"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="inline w-4 h-4 mr-1" />
                      비밀번호 *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all pr-12"
                        placeholder="비밀번호를 입력하세요"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#FF6B35] text-white py-3 rounded-xl font-semibold hover:bg-[#e55a2a] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        회원가입
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {mode === 'forgot-password' && (
              <>
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="flex items-center gap-1 text-gray-500 hover:text-[#FF6B35] mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  로그인으로 돌아가기
                </button>

                <h2 className="text-2xl font-bold text-[#1A1D2E] mb-2">비밀번호 찾기</h2>
                <p className="text-gray-500 mb-6">가입한 이메일을 입력하세요</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      이메일
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
                      placeholder="이메일을 입력하세요"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#FF6B35] text-white py-3 rounded-xl font-semibold hover:bg-[#e55a2a] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        비밀번호 재설정 요청
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {mode === 'reset-success' && (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A1D2E] mb-2">이메일 전송 완료</h2>
                  <p className="text-gray-500 mb-6">
                    비밀번호 재설정 링크가 이메일로 전송되었습니다.<br />
                    이메일을 확인해주세요.
                  </p>
                  <button
                    onClick={() => { setMode('login'); setError(''); }}
                    className="bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#e55a2a] transition-all"
                  >
                    로그인으로 돌아가기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#FF6B35] to-[#e55a2a] items-center justify-center p-12">
        <div className="text-center text-white max-w-md">
          <h2 className="text-4xl font-bold mb-6">블로그 자동화의 새로운 시작</h2>
          <p className="text-lg opacity-90 mb-8">
            시공 현장 정보와 사진만 입력하면<br />
            AI가 SEO 최적화된 블로그 글을 자동으로 생성합니다.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold">자동 콘텐츠 생성</div>
              <div className="text-sm opacity-80">AI 기반 블로그 글 작성</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl mb-2">📷</div>
              <div className="font-semibold">Before/After 관리</div>
              <div className="text-sm opacity-80">시공 사진 자동 정렬</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-semibold">리치 텍스트 편집</div>
              <div className="text-sm opacity-80">네이버 블로그 최적화</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold">원클릭 복사</div>
              <div className="text-sm opacity-80">서식 유지 복사/붙여넣기</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
