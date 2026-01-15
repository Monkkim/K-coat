import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  List,
  Minus,
  Type,
  ChevronDown
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editorRef.current && content && !isInitialized) {
      editorRef.current.innerHTML = content;
      setIsInitialized(true);
    }
  }, [content, isInitialized]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const applyFontSize = (size: number) => {
    setCurrentFontSize(size);
    setShowFontSizeDropdown(false);
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        try {
          range.surroundContents(span);
          handleInput();
        } catch (e) {
          execCommand('fontSize', '7');
          const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
          fontElements?.forEach(el => {
            (el as HTMLElement).removeAttribute('size');
            (el as HTMLElement).style.fontSize = `${size}px`;
          });
          handleInput();
        }
      }
    }
    editorRef.current?.focus();
  };

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag);
  };

  const insertHorizontalRule = () => {
    execCommand('insertHorizontalRule');
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
  }> = ({ onClick, active, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        active 
          ? 'bg-[#FF6B35] text-white shadow-md' 
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-gray-200 mx-1" />
  );

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <div className="bg-gray-50 border-b border-gray-100 p-3 flex flex-wrap items-center gap-1 sticky top-0 z-10">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all min-w-[80px]"
          >
            <Type className="w-4 h-4" />
            {currentFontSize}px
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFontSizeDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 min-w-[100px]">
              {fontSizes.map(size => (
                <button
                  key={size}
                  onClick={() => applyFontSize(size)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    currentFontSize === size ? 'bg-[#FF6B35]/10 text-[#FF6B35] font-bold' : 'text-gray-700'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => formatBlock('h1')}
          title="제목 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => formatBlock('h2')}
          title="제목 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => formatBlock('h3')}
          title="제목 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => execCommand('bold')}
          title="굵게"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand('italic')}
          title="기울임"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand('underline')}
          title="밑줄"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => execCommand('justifyLeft')}
          title="왼쪽 정렬"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand('justifyCenter')}
          title="가운데 정렬"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand('justifyRight')}
          title="오른쪽 정렬"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => execCommand('insertUnorderedList')}
          title="불릿 리스트"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={insertHorizontalRule}
          title="구분선"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="prose prose-lg max-w-none focus:outline-none min-h-[600px] p-8"
        style={{ 
          fontFamily: '"Malgun Gothic", "맑은 고딕", sans-serif',
          lineHeight: 1.8 
        }}
      />

      <style>{`
        [contenteditable] {
          outline: none;
        }
        [contenteditable] h1 {
          font-size: 32px;
          font-weight: 800;
          margin: 24px 0 16px 0;
          color: #1A1D2E;
        }
        [contenteditable] h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 20px 0 12px 0;
          color: #1A1D2E;
        }
        [contenteditable] h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 16px 0 8px 0;
          color: #1A1D2E;
        }
        [contenteditable] p, [contenteditable] div {
          margin: 12px 0;
          color: #374151;
        }
        [contenteditable] ul {
          list-style-type: disc;
          padding-left: 24px;
          margin: 16px 0;
        }
        [contenteditable] li {
          margin: 8px 0;
        }
        [contenteditable] hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 24px 0;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 16px 0;
          display: block;
        }
        [contenteditable] strong, [contenteditable] b {
          font-weight: 700;
        }
        [contenteditable] em, [contenteditable] i {
          font-style: italic;
        }
        [contenteditable] u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
