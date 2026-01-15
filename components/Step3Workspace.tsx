
import React, { useState, useEffect } from 'react';
import { N8NResponse, ContentBlock } from '../types';
import { copyRichTextToClipboard } from '../utils';
import { Loader2, Check, CheckCircle, Copy, GripVertical, Trash2, Plus, Image as ImageIcon, Layout, ArrowLeft, Save, Sparkles, Clock, AlertTriangle } from 'lucide-react';

interface Step3WorkspaceProps {
  isGenerating: boolean;
  result: N8NResponse | null;
  onBack: () => void;
  onComplete: () => void;
}

export const Step3Workspace: React.FC<Step3WorkspaceProps> = ({ isGenerating, result, onBack, onComplete }) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [title, setTitle] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    if (result) {
      setTitle(result.title || '');
      setHashtags(result.hashtags || '');

      // HTML 필드가 있으면 하나의 통합 블록으로 처리 (요청 사항)
      if (result.html) {
        setBlocks([{
          id: `full-html-${Date.now()}`,
          type: 'text',
          content: result.html
        }]);
      }
      // sections가 있으면 기존 방식대로 처리
      else if (result.sections && result.sections.length > 0) {
        const initialBlocks: ContentBlock[] = result.sections.map((section, idx) => ({
          id: `block-${idx}-${Date.now()}`,
          type: 'text',
          content: section.content,
          sectionType: section.type
        }));
        setBlocks(initialBlocks);
      }
    }
  }, [result]);

  const handleCopy = async () => {
    const finalHtml = `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.8; color: #333; max-width: 700px; margin: 0 auto;">
        <h1 style="font-size: 28px; color: #1A1D2E; text-align: center; margin-bottom: 40px; border-bottom: 3px solid #FF6B35; padding-bottom: 15px; font-weight: bold;">
          ${title}
        </h1>
        
        ${blocks.map(block => {
          if (block.type === 'text') {
            return block.content;
          }
          return `
            <div style="text-align: center; margin: 40px 0;">
              <img src="${block.content}" style="max-width: 100%; border-radius: 15px; display: block; margin: 0 auto;" alt="시공사진" />
            </div>`;
        }).join('')}
        
        <div style="margin-top: 60px; padding: 25px; background-color: #f8f9fa; border-radius: 12px; color: #666; font-size: 14px;">
          ${hashtags}
        </div>
      </div>
    `;
    
    const success = await copyRichTextToClipboard(finalHtml);
    if (success) {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const onDrop = (index: number) => {
    if (draggedImage) {
      const newBlock: ContentBlock = {
        id: `img-${Date.now()}-${Math.random()}`,
        type: 'image',
        content: draggedImage
      };
      const newBlocks = [...blocks];
      newBlocks.splice(index, 0, newBlock);
      setBlocks(newBlocks);
      setDraggedImage(null);
    } else if (draggedBlockId) {
      const draggedIndex = blocks.findIndex(b => b.id === draggedBlockId);
      if (draggedIndex === -1) return;

      const newBlocks = [...blocks];
      const [draggedBlock] = newBlocks.splice(draggedIndex, 1);

      let targetIndex = index;
      if (draggedIndex < index) {
        targetIndex--;
      }

      newBlocks.splice(targetIndex, 0, draggedBlock);
      setBlocks(newBlocks);
      setDraggedBlockId(null);
    }
  };

  const handleBlockDragStart = (blockId: string) => {
    setDraggedBlockId(blockId);
  };

  const handleBlockDragEnd = () => {
    setDraggedBlockId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {isGenerating && (
        <div className="bg-[#1A1D2E] text-white p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Loader2 className="w-8 h-8 mr-4 text-[#FF6B35] animate-spin" />
              <div>
                <h3 className="font-black text-lg">AI가 콘텐츠를 생성하고 있습니다</h3>
                <p className="text-gray-400 text-sm">텍스트와 이미지를 함께 처리 중입니다</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold border border-white/20">
                처리 중...
              </div>
            </div>
          </div>
          {blocks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-400" />
                <span className="text-gray-300">텍스트 블록 {blocks.length}개 생성 완료</span>
              </div>
              <div className="flex items-center text-sm mt-2">
                <Loader2 className="w-4 h-4 mr-2 text-[#FF6B35] animate-spin" />
                <span className="text-gray-300">이미지 합성 중... (5~10분 소요)</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-[#1A1D2E] flex items-center">
            <Sparkles className="w-6 h-6 mr-3 text-[#FF6B35]" />
            블로그 에디터 워크스페이스
          </h2>
          <p className="text-gray-400 text-sm mt-1">텍스트가 먼저 생성됩니다. 사진이 도착하면 본문에 배치하세요.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-5 py-2.5 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> 나가기
          </button>
          <button 
            onClick={handleCopy}
            disabled={blocks.length === 0}
            className={`px-8 py-2.5 rounded-xl text-sm font-black text-white shadow-xl flex items-center transition-all transform active:scale-95 ${
              copyStatus === 'copied' ? 'bg-green-500' : 'bg-[#FF6B35] hover:bg-[#e85a2a]'
            } ${blocks.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {copyStatus === 'copied' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copyStatus === 'copied' ? '복사 완료' : '네이버 블로그로 복사'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        
        {/* 본문 에디터 */}
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden min-h-[900px]">
          <div className="bg-[#1A1D2E] px-10 py-4 flex items-center justify-between">
            <div className="flex items-center text-white/50 text-[10px] font-black uppercase tracking-widest">
              <Layout className="w-3 h-3 mr-2" /> Live Workspace
            </div>
          </div>

          <div className="p-12 space-y-8">
            <div className="group">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Post Title</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full text-3xl font-black text-[#1A1D2E] border-none outline-none bg-transparent placeholder-gray-100"
              />
              <div className="h-1 w-20 bg-[#FF6B35] mt-4 rounded-full" />
            </div>

            <div className="space-y-1">
              {blocks.length === 0 && isGenerating && (
                <div className="py-20 flex flex-col items-center justify-center text-gray-300">
                  <Loader2 className="w-12 h-12 mb-4 text-[#FF6B35] animate-spin" />
                  <p className="text-lg font-bold text-[#1A1D2E] mb-2">AI가 블로그 콘텐츠를 생성하고 있습니다</p>
                  <p className="text-sm italic">각 섹션이 블록 형태로 표시됩니다...</p>
                </div>
              )}

              {blocks.length === 0 && !isGenerating && (
                <div className="py-20 flex flex-col items-center justify-center text-gray-300">
                  <Clock className="w-10 h-10 mb-2 animate-pulse" />
                  <p className="italic">데이터를 기다리는 중...</p>
                </div>
              )}
              
              <DropArea onDrop={() => onDrop(0)} visible={blocks.length > 0} />
              
              {blocks.map((block, idx) => (
                <React.Fragment key={block.id}>
                  <div
                    draggable
                    onDragStart={() => handleBlockDragStart(block.id)}
                    onDragEnd={handleBlockDragEnd}
                    className={`group relative flex items-start gap-4 p-4 rounded-3xl hover:bg-gray-50/50 transition-all border border-transparent hover:border-gray-100 animate-in fade-in slide-in-from-left-4 ${
                      draggedBlockId === block.id ? 'opacity-50' : ''
                    }`}
                    style={{ animationDelay: `${idx * 50}ms`, animationDuration: '300ms' }}
                  >
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-4">
                      <div className="cursor-grab active:cursor-grabbing p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-red-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1">
                      {block.type === 'text' ? (
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateBlock(block.id, e.currentTarget.innerHTML)}
                          className="outline-none prose prose-orange max-w-none py-2 text-lg font-medium leading-relaxed text-[#2D3436] whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                      ) : (
                        <div className="my-10 relative rounded-[32px] overflow-hidden border-8 border-white shadow-2xl group/img">
                          <img src={block.content} className="w-full h-auto" alt="시공사진" />
                          <div className="absolute top-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/20 uppercase tracking-widest">Construct Photo</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <DropArea onDrop={() => onDrop(idx + 1)} visible={true} />
                </React.Fragment>
              ))}
            </div>

            <div className="mt-20 pt-10 border-t border-gray-100">
              <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">SEO Hashtags</div>
              <textarea 
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full bg-gray-50 p-6 rounded-[24px] text-sm font-mono text-gray-500 border-none outline-none focus:ring-2 focus:ring-[#FF6B35]/10 transition-all"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* 우측 이미지 뱅크 */}
        <div className="sticky top-28 space-y-6">
          <div className="bg-[#1A1D2E] text-white p-8 rounded-[48px] shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/20 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="relative">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black flex items-center uppercase tracking-widest text-[#FF6B35]">
                  <ImageIcon className="w-5 h-5 mr-3" /> Photo Bank
                </h3>
                {isGenerating && <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin" />}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {result?.images?.map((img, idx) => {
                  // Extract image URL from HTML if needed
                  let imageUrl = img;
                  if (typeof img === 'string' && img.includes('<img')) {
                    const match = img.match(/src="([^"]+)"/);
                    if (match) imageUrl = match[1];
                  }

                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => setDraggedImage(imageUrl)}
                      className="aspect-square bg-white/5 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing hover:ring-4 ring-[#FF6B35] transition-all group relative border border-white/5 shadow-inner"
                    >
                      <img src={imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus className="text-white w-6 h-6" />
                      </div>
                    </div>
                  );
                })}
                
                {isGenerating && (
                  <>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse flex flex-col items-center justify-center border border-white/10">
                        <ImageIcon className="w-6 h-6 text-white/10 mb-2" />
                        <span className="text-[8px] text-white/20 font-bold uppercase">Synthesizing...</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {isGenerating && (
                <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center text-[#FF6B35] text-xs font-bold mb-1">
                    <AlertTriangle className="w-3 h-3 mr-2" /> 5-10분 대기 필요
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    워터마크 삽입 및 고해상도 합성이 진행 중입니다. 텍스트를 먼저 편집하셔도 됩니다.
                  </p>
                </div>
              )}

              {!isGenerating && (!result?.images || result.images.length === 0) && (
                <div className="text-center py-12 text-gray-600 text-xs italic">
                  생성된 사진이 없습니다.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl">
            <h4 className="text-[10px] font-black text-[#1A1D2E] mb-5 uppercase tracking-widest flex items-center">
              <span className="w-2 h-2 bg-[#FF6B35] rounded-full mr-3" /> Editor Tips
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <p className="text-[11px] text-gray-500 leading-relaxed">사진은 <b>점선 영역</b>에 드래그하여 드롭하세요.</p>
              </div>
              <div className="flex gap-3 items-start">
                <p className="text-[11px] text-gray-500 leading-relaxed">텍스트를 클릭하면 즉시 수정이 가능합니다.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onComplete}
            disabled={isGenerating || blocks.length === 0}
            className="w-full py-6 bg-[#1A1D2E] text-white rounded-[32px] font-black text-lg flex items-center justify-center hover:bg-black transition-all shadow-2xl group disabled:opacity-50"
          >
            <Save className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
            작업 완료 및 저장
          </button>
        </div>
      </div>
    </div>
  );
};

const DropArea: React.FC<{ onDrop: () => void, visible: boolean }> = ({ onDrop, visible }) => {
  const [isOver, setIsOver] = useState(false);

  if (!visible && !isOver) return <div className="h-4" />;

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsOver(false); onDrop(); }}
      className={`relative h-6 my-4 rounded-3xl transition-all flex items-center justify-center border-2 border-dashed ${
        isOver 
          ? 'bg-[#FF6B35]/5 border-[#FF6B35] h-32 opacity-100 z-10' 
          : 'border-transparent opacity-0 hover:opacity-100 hover:border-gray-100 hover:h-16'
      }`}
    >
      <div className={`flex flex-col items-center transition-transform ${isOver ? 'scale-110' : 'scale-90'}`}>
        <div className="bg-[#FF6B35] p-2 rounded-full shadow-lg mb-2">
          <Plus className="w-4 h-4 text-white" />
        </div>
        <span className="text-[10px] font-black text-[#FF6B35] uppercase tracking-widest">
          {isOver ? "Release to Insert Photo" : "Drop Photo Here"}
        </span>
      </div>
    </div>
  );
};
