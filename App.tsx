
import React, { useState } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { Step1Form } from './components/Step1Form';
import { Step2Upload } from './components/Step2Upload';
import { Step3Workspace } from './components/Step3Workspace';
import { Step4Success } from './components/Step4Success';
import { KCoatFormData, PhotoSet, N8NResponse } from './types';
import { formatDate } from './utils';
import { WEBHOOK_URL } from './constants';
import { Sparkles, Crown } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<KCoatFormData>({
    buildingName: '',
    workDate: formatDate(new Date()),
    workType: 'remodeling',
    detailedLocation: '',
    productType: '',
    productColor: '',
    workHours: 4,
    issues: [],
    useWatermark: true,
    photoSets: []
  });

  const [photoSets, setPhotoSets] = useState<PhotoSet[]>([
    { id: 'initial', before: null, after: null }
  ]);

  const [apiResult, setApiResult] = useState<N8NResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateFormData = (updates: Partial<KCoatFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const startGeneration = async () => {
    const processedSets = photoSets
      .filter(s => s.before && s.after)
      .map(s => ({ before: s.before!, after: s.after! }));
    
    const finalPayload = {
      ...formData,
      photoSets: processedSets
    };

    setStep(3); 
    setIsGenerating(true);
    setApiResult(null);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API Response:", data);

      // Handle array response (n8n returns array with single object)
      const responseData = Array.isArray(data) ? data[0] : data;

      let finalTitle = responseData.title || `(${formData.buildingName}) 탄성코트 시공 후기`;
      let finalSections: { type: string; content: string }[] = [];
      let finalImages: string[] = [];
      let finalHashtags = "#탄성코트 #KCOAT #베란다칠 #결로방지";

      // Parse Korean key format from n8n
      const sectionKeyMap: { [key: string]: string } = {
        '인트로': 'intro',
        '제품': 'product',
        '오프닝': 'opening',
        'USP': 'usp',
        'FAQ': 'faq',
        'TECH': 'tech',
        '철학': 'philosophy',
        '과정': 'process',
        '정리': 'recap',
        '헤더': 'header'
      };

      // Extract sections from Korean keys
      for (const [koreanKey, englishType] of Object.entries(sectionKeyMap)) {
        if (responseData[koreanKey]) {
          finalSections.push({
            type: englishType,
            content: responseData[koreanKey]
          });
        }
      }

      // Extract hashtags
      if (responseData['해시태그']) {
        finalHashtags = responseData['해시태그'];
      } else if (responseData.hashtags) {
        finalHashtags = responseData.hashtags;
      }

      // Extract images - handle object format with html property
      if (responseData.images && Array.isArray(responseData.images)) {
        finalImages = responseData.images.map((img: any) => {
          if (typeof img === 'string') {
            return img;
          }
          if (img.html) {
            // Extract src from HTML
            const match = img.html.match(/src="([^"]+)"/);
            return match ? match[1] : '';
          }
          if (img.url) {
            return img.url;
          }
          return '';
        }).filter((url: string) => url);
      }

      // Fallback: if sections still empty but sections array exists
      if (!finalSections.length && responseData.sections) {
        finalSections = responseData.sections;
      }

      // Fallback: if html exists but no sections, parse html
      if (!finalSections.length && responseData.html) {
        finalSections = [{
          type: 'text',
          content: responseData.html
        }];
      }

      setApiResult({
        success: true,
        title: finalTitle,
        sections: finalSections,
        images: finalImages,
        hashtags: finalHashtags
      });
      
      setIsGenerating(false);
    } catch (err) {
      console.error('전송 에러:', err);
      alert("생성 중 오류가 발생했습니다. (연결 시간이 너무 길거나 데이터 형식이 다를 수 있습니다)");
      setIsGenerating(false);
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#FAF9F6]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-[#FF6B35] p-2 rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-[#1A1D2E] tracking-tight">K-COAT <span className="text-[#FF6B35]">STUDIO</span></h1>
          </div>
          <div className="flex items-center space-x-1 bg-[#1A1D2E] text-white px-3 py-1.5 rounded-full text-[10px] font-bold">
            <Crown className="w-3 h-3 text-yellow-400" />
            <span>PRO PLAN</span>
          </div>
        </div>
      </header>

      <main className={`${step >= 3 ? 'max-w-7xl' : 'max-w-3xl'} mx-auto px-6 pt-10 transition-all duration-700`}>
        <StepIndicator currentStep={step} />

        <div className="mt-8">
          {step === 1 && (
            <Step1Form 
              data={formData} 
              updateData={updateFormData} 
              onNext={() => setStep(2)} 
            />
          )}

          {step === 2 && (
            <Step2Upload 
              photoSets={photoSets} 
              setPhotoSets={setPhotoSets} 
              onBack={() => setStep(1)} 
              onNext={startGeneration} 
            />
          )}

          {step === 3 && (
            <Step3Workspace 
              isGenerating={isGenerating}
              result={apiResult}
              onBack={() => setStep(2)}
              onComplete={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <Step4Success 
              onReset={() => {
                setStep(1);
                setApiResult(null);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
