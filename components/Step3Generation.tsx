
import React, { useEffect, useState } from 'react';
import { GenerationStep, ProgressState } from '../types';
import { Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Step3GenerationProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const Step3Generation: React.FC<Step3GenerationProps> = ({ onComplete, onCancel }) => {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProgressState[]>([
    { id: GenerationStep.PREPROCESS, label: "사진 전처리", status: "completed" },
    { id: GenerationStep.IMAGE_GEN, label: "데이터 전송 및 분석", status: "processing" },
    { id: GenerationStep.WATERMARK, label: "AI 블로그 생성", status: "pending" },
    { id: GenerationStep.TEXT_GEN, label: "SEO 최적화 중", status: "pending" },
    { id: GenerationStep.ASSEMBLY, label: "결과물 조립", status: "pending" }
  ]);

  useEffect(() => {
    // 실제 API 응답 속도에 맞춰 시각적인 즐거움을 주기 위한 페이크 프로그레스
    const interval = setInterval(() => {
      setProgress(prev => {
        // 90%에서 멈추고 실제 응답을 기다림 (App.tsx에서 setStep(4)를 호출할 때까지)
        if (prev >= 90) {
          return 90;
        }
        
        setSteps(current => {
          const next = [...current];
          if (prev > 20) {
            next[1].status = 'completed';
            next[2].status = 'processing';
          }
          if (prev > 50) {
            next[2].status = 'completed';
            next[3].status = 'processing';
          }
          if (prev > 80) {
            next[3].status = 'completed';
            next[4].status = 'processing';
          }
          return next;
        });

        return prev + 1;
      });
    }, 200); // 전송 중임을 보여주기 위해 속도를 약간 늦춤

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 space-y-8 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#1A1D2E]">서버로 데이터를 전송하고 있습니다</h2>
        <p className="text-sm text-gray-500">잠시만 기다려주시면 멋진 블로그 글이 완성됩니다.</p>
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-gray-100 border-t-[#FF6B35] animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-[#FF6B35]">
            {progress}%
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500 mr-3" />}
              {step.status === 'processing' && <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin mr-3" />}
              {step.status === 'pending' && <Clock className="w-4 h-4 text-gray-300 mr-3" />}
              <span className={`font-medium ${step.status === 'completed' ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
            {step.status === 'completed' && <span className="text-green-500">완료</span>}
            {step.status === 'processing' && <span className="text-[#FF6B35] animate-pulse">처리 중...</span>}
            {step.status === 'pending' && <span className="text-gray-300">대기</span>}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md space-y-2 text-center">
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#FF6B35] h-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-center text-xs text-gray-400 mt-2">
          <AlertCircle className="w-3 h-3 mr-1" />
          <span>인터넷 속도에 따라 최대 1분 정도 소요될 수 있습니다.</span>
        </div>
      </div>

      <button 
        onClick={onCancel}
        className="px-6 py-2 text-gray-400 hover:text-red-500 transition-colors text-sm font-medium"
      >
        생성 취소
      </button>
    </div>
  );
};
