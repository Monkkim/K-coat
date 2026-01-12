
import React from 'react';
import { PRODUCT_OPTIONS, COLOR_OPTIONS, ISSUE_TAGS } from '../constants';
import { WorkType } from '../types';
import { Calendar, Building, MapPin, Package, Palette, Clock, Tag } from 'lucide-react';

interface Step1FormProps {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
}

export const Step1Form: React.FC<Step1FormProps> = ({ data, updateData, onNext }) => {
  const isFormValid = data.buildingName && data.workDate && data.detailedLocation && data.productType && data.productColor;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1A1D2E]">시공 현장 정보 입력</h2>
        <p className="text-gray-500 mt-2 text-sm">정확한 정보를 입력할수록 더 정교한 SEO 문서를 작성합니다.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        {/* Building Name */}
        <div>
          <label className="flex items-center text-sm font-semibold text-[#1A1D2E] mb-2">
            <Building className="w-4 h-4 mr-2 text-[#FF6B35]" />
            시공 아파트/건물명 <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
            placeholder="예: 반포 래미안 원베일리"
            value={data.buildingName}
            onChange={(e) => updateData({ buildingName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Work Date */}
          <div>
            <label className="flex items-center text-sm font-semibold text-[#1A1D2E] mb-2">
              <Calendar className="w-4 h-4 mr-2 text-[#FF6B35]" />
              시공 일자 <span className="text-red-500 ml-1">*</span>
            </label>
            <input 
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
              value={data.workDate}
              onChange={(e) => updateData({ workDate: e.target.value })}
            />
          </div>

          {/* Work Type */}
          <div>
            <label className="flex items-center text-sm font-semibold text-[#1A1D2E] mb-2">
              시공 분류 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-2">
              {(['remodeling', 'new', 'occupied'] as WorkType[]).map((type) => (
                <button
                  key={type}
                  className={`flex-1 py-3 px-2 text-xs font-medium rounded-xl border transition-all ${
                    data.workType === type 
                      ? 'bg-[#1A1D2E] text-white border-[#1A1D2E]' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#FF6B35]/50'
                  }`}
                  onClick={() => updateData({ workType: type })}
                >
                  {type === 'remodeling' ? '구축/리모델링' : type === 'new' ? '신축' : '거주 세대'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Location */}
        <div>
          <label className="flex items-center text-sm font-semibold text-[#1A1D2E] mb-2">
            <MapPin className="w-4 h-4 mr-2 text-[#FF6B35]" />
            상세 시공 위치 <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
            placeholder="예: 베란다 3개소, 다용도실 등"
            value={data.detailedLocation}
            onChange={(e) => updateData({ detailedLocation: e.target.value })}
          />
        </div>

        {/* Product Type */}
        <div>
          <label className="flex items-center text-sm font-semibold text-[#1A1D2E] mb-2">
            <Package className="w-4 h-4 mr-2 text-[#FF6B35]" />
            시공 제품 선택 <span className="text-red-500 ml-1">*</span>
          </label>
          <select 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all appearance-none"
            value={data.productType}
            onChange={(e) => updateData({ productType: e.target.value })}
          >
            <option value="">제품을 선택하세요</option>
            {PRODUCT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Color */}
          <div>
            <label className="flex items-center text-sm font-semibold text-[#1A1D2E] mb-2">
              <Palette className="w-4 h-4 mr-2 text-[#FF6B35]" />
              제품 색상 <span className="text-red-500 ml-1">*</span>
            </label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all appearance-none"
              value={data.productColor}
              onChange={(e) => updateData({ productColor: e.target.value })}
            >
              <option value="">색상을 선택하세요</option>
              {COLOR_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Work Hours */}
          <div>
            <label className="flex items-center text-sm font-semibold text-[#1A1D2E] mb-2">
              <Clock className="w-4 h-4 mr-2 text-[#FF6B35]" />
              작업 시간
            </label>
            <div className="flex items-center">
              <input 
                type="number"
                min="0.5"
                step="0.5"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                value={data.workHours}
                onChange={(e) => updateData({ workHours: parseFloat(e.target.value) })}
              />
              <span className="ml-3 text-sm font-medium text-gray-500">시간</span>
            </div>
          </div>
        </div>

        {/* Issues */}
        <div>
          <label className="flex items-center text-sm font-semibold text-[#1A1D2E] mb-2">
            <Tag className="w-4 h-4 mr-2 text-[#FF6B35]" />
            현장 주요 이슈 (다중 선택 가능)
          </label>
          <div className="flex flex-wrap gap-2">
            {ISSUE_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  const newIssues = data.issues.includes(tag)
                    ? data.issues.filter((i: string) => i !== tag)
                    : [...data.issues, tag];
                  updateData({ issues: newIssues });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  data.issues.includes(tag)
                    ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#FF6B35]/50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Watermark Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h4 className="text-sm font-semibold text-[#1A1D2E]">워터마크 자동 삽입</h4>
            <p className="text-xs text-gray-500 mt-1">케이코트 로고를 결과 이미지에 자동 삽입합니다.</p>
          </div>
          <button 
            onClick={() => updateData({ useWatermark: !data.useWatermark })}
            className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${data.useWatermark ? 'bg-[#FF6B35]' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${data.useWatermark ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <button
        disabled={!isFormValid}
        onClick={onNext}
        className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
          isFormValid ? 'bg-[#FF6B35] hover:bg-[#e85a2a]' : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        다음 단계: 사진 올리기 ▶
      </button>
    </div>
  );
};
