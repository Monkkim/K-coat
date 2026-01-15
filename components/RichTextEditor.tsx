import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
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
  const [showFontSizeDropdown, setShowFontSizeDropdown] = React.useState(false);
  const [currentFontSize, setCurrentFontSize] = React.useState(16);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          HTMLAttributes: {
            style: 'list-style-type: disc; padding-left: 24px; margin: 16px 0;',
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            style: 'border: none; border-top: 2px solid #e5e7eb; margin: 24px 0;',
          },
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[600px] p-8',
        style: 'font-family: "Malgun Gothic", "맑은 고딕", sans-serif;',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const applyFontSize = (size: number) => {
    setCurrentFontSize(size);
    setShowFontSizeDropdown(false);
    
    const { from, to } = editor.state.selection;
    editor.chain().focus().command(({ tr }) => {
      tr.addMark(from, to, editor.schema.marks.textStyle?.create({ fontSize: `${size}px` }) || null);
      return true;
    }).run();
    
    const element = document.querySelector('.ProseMirror');
    if (element) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        try {
          range.surroundContents(span);
          onChange(editor.getHTML());
        } catch (e) {
          console.log('Font size applied via editor styles');
        }
      }
    }
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
      <div className="bg-gray-50 border-b border-gray-100 p-3 flex flex-wrap items-center gap-1">
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="제목 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="제목 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="제목 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="굵게"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="기울임"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="밑줄"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="왼쪽 정렬"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="가운데 정렬"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="오른쪽 정렬"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="불릿 리스트"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <style>{`
        .ProseMirror {
          min-height: 600px;
          padding: 32px;
          font-size: 16px;
          line-height: 1.8;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror h1 {
          font-size: 32px;
          font-weight: 800;
          margin: 24px 0 16px 0;
          color: #1A1D2E;
        }
        .ProseMirror h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 20px 0 12px 0;
          color: #1A1D2E;
        }
        .ProseMirror h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 16px 0 8px 0;
          color: #1A1D2E;
        }
        .ProseMirror p {
          margin: 12px 0;
          color: #374151;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 24px;
          margin: 16px 0;
        }
        .ProseMirror li {
          margin: 8px 0;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 24px 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 16px 0;
        }
        .ProseMirror strong {
          font-weight: 700;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
