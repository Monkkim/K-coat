
import React from 'react';
import { CheckCircle2, RefreshCw, Share2, Sparkles, Building2 } from 'lucide-react';

interface Step4SuccessProps {
  onReset: () => void;
}

export const Step4Success: React.FC<Step4SuccessProps> = ({ onReset }) => {
  return (
    <div className="max-w-xl mx-auto py-20 animate-in zoom-in-95 duration-700">
      <div className="bg-white rounded-[48px] shadow-2xl border border-gray-100 p-12 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B35]/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#1A1D2E]/5 rounded-full -ml-20 -mb-20 blur-3xl" />

        <div className="relative">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h2 className="text-3xl font-black text-[#1A1D2E] mb-4">포스팅 생성 완료!</h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            블로그 내용이 성공적으로 조합되었습니다.<br />
            이제 네이버 블로그 스마트에디터에 그대로 붙여넣기 하세요.
          </p>

          <div className="grid grid-cols-1 gap-4 mb-10">
            <div className="flex items-center p-4 bg-gray-50 rounded-2xl text-left border border-gray-100">
              <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                <Sparkles className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">SEO status</p>
                <p className="text-sm font-bold text-gray-700">최적화 완료 (A+ 등급)</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-2xl text-left border border-gray-100">
              <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                <Building2 className="w-5 h-5 text-[#1A1D2E]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Internal DB</p>
                <p className="text-sm font-bold text-gray-700">시공 사례 데이터베이스 저장됨</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.open('https://blog.naver.com/', '_blank')}
              className="w-full py-5 bg-[#FF6B35] text-white rounded-3xl font-black shadow-xl hover:bg-[#e85a2a] transition-all transform active:scale-95 flex items-center justify-center"
            >
              <Share2 className="w-5 h-5 mr-3" />
              네이버 블로그 바로가기
            </button>
            <button 
              onClick={onReset}
              className="w-full py-5 bg-white border border-gray-100 text-gray-500 rounded-3xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-3" />
              새 포스팅 만들기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
