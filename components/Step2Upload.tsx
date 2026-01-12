
import React, { useRef, useState } from 'react';
import { PhotoSet } from '../types';
import { fileToBase64 } from '../utils';
import { Plus, X, Image as ImageIcon, ArrowLeft, Camera, UploadCloud, Trash2 } from 'lucide-react';

interface Step2UploadProps {
  photoSets: PhotoSet[];
  setPhotoSets: React.Dispatch<React.SetStateAction<PhotoSet[]>>;
  onBack: () => void;
  onNext: () => void;
}

export const Step2Upload: React.FC<Step2UploadProps> = ({ photoSets, setPhotoSets, onBack, onNext }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    // Explicitly cast to File[] to fix 'unknown' type errors for sorting and processing
    const fileArray = (Array.from(files) as File[]).sort((a, b) => a.name.localeCompare(b.name));
    const newSets: PhotoSet[] = [];

    for (let i = 0; i < fileArray.length; i += 2) {
      const beforeFile = fileArray[i];
      const afterFile = fileArray[i + 1];

      const beforeBase64 = await fileToBase64(beforeFile);
      const afterBase64 = afterFile ? await fileToBase64(afterFile) : null;

      newSets.push({
        id: Math.random().toString(36).substr(2, 9),
        before: beforeBase64,
        after: afterBase64,
        beforeName: beforeFile.name,
        afterName: afterFile?.name
      });
    }

    // 기존 세트가 '초기화' 상태(사진 없음)면 교체, 아니면 추가
    setPhotoSets(prev => {
      const filteredPrev = prev.filter(s => s.before || s.after);
      return [...filteredPrev, ...newSets].slice(0, 10); // 최대 10세트 제한
    });
    
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSet = (id: string) => {
    setPhotoSets(prev => prev.filter(s => s.id !== id));
  };

  const clearAll = () => {
    setPhotoSets([{ id: 'initial', before: null, after: null }]);
  };

  const isAnyUploaded = photoSets.some(s => s.before && s.after);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1A1D2E]">Before / After 사진 업로드</h2>
        <p className="text-gray-500 mt-2 text-sm">
          사진들을 한꺼번에 선택하세요. <b>파일 이름 순으로 2개씩 짝지어</b> 자동 정렬됩니다.
        </p>
      </div>

      {/* Bulk Upload Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="group relative h-48 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-all cursor-pointer overflow-hidden shadow-sm"
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={handleBulkUpload}
        />
        {isProcessing ? (
          <div className="flex flex-col items-center animate-pulse">
            <UploadCloud className="w-10 h-10 text-[#FF6B35] mb-2" />
            <span className="text-sm font-bold text-[#FF6B35]">사진 처리 중...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-white shadow-sm transition-colors">
              <Plus className="w-8 h-8 text-[#FF6B35]" />
            </div>
            <span className="text-sm font-bold text-[#1A1D2E]">전체 사진 선택하기</span>
            <span className="text-xs text-gray-400 mt-1">파일들을 드래그하거나 클릭하여 업로드</span>
          </div>
        )}
      </div>

      {/* Result Sets */}
      {photoSets.some(s => s.before || s.after) && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-bold text-[#1A1D2E]">생성된 세트 ({photoSets.filter(s => s.before || s.after).length})</span>
            <button 
              onClick={clearAll}
              className="text-xs font-semibold text-red-500 hover:underline flex items-center"
            >
              <Trash2 className="w-3 h-3 mr-1" /> 전체 삭제
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {photoSets.map((set, index) => {
              if (!set.before && !set.after) return null;
              return (
                <div key={set.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative group">
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => removeSet(set.id)}
                      className="bg-white text-red-500 p-1.5 rounded-full shadow-md border border-gray-100 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-xs font-black text-gray-300 w-8 italic">#{index + 1}</div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        {set.before ? (
                          <img src={set.before} className="w-full h-full object-cover" alt="Before" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">No Image</div>
                        )}
                      </div>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[8px] font-bold rounded">BEFORE</div>
                    </div>

                    <div className="relative">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        {set.after ? (
                          <img src={set.after} className="w-full h-full object-cover" alt="After" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">Waiting...</div>
                        )}
                      </div>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[#FF6B35] text-white text-[8px] font-bold rounded">AFTER</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold flex items-center justify-center hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          이전
        </button>
        <button
          disabled={!isAnyUploaded || isProcessing}
          onClick={onNext}
          className={`flex-[2] py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
            isAnyUploaded && !isProcessing ? 'bg-[#FF6B35] hover:bg-[#e85a2a]' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          AI 생성 시작하기 ▶
        </button>
      </div>
    </div>
  );
};
