
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * 네이버 블로그 스마트에디터에 최적화된 복사 함수
 * HTML과 일반 텍스트를 동시에 전달하여 에디터가 '리치 콘텐츠'로 인식하게 함
 */
export const copyRichTextToClipboard = async (html: string): Promise<boolean> => {
  try {
    // 네이버 에디터는 표준 HTML 구조를 선호함
    const fullHtml = `
      <html>
        <head><meta charset="utf-8"></head>
        <body>
          ${html}
        </body>
      </html>
    `;
    
    const blobHtml = new Blob([fullHtml], { type: 'text/html' });
    const blobText = new Blob([html.replace(/<[^>]*>?/gm, '')], { type: 'text/plain' });
    
    if (typeof ClipboardItem !== 'undefined') {
      const data = [new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText
      })];
      await navigator.clipboard.write(data);
      return true;
    } else {
      // 구형 브라우저 대응
      await navigator.clipboard.writeText(html);
      return true;
    }
  } catch (err) {
    console.error('복사 중 오류 발생:', err);
    return false;
  }
};
