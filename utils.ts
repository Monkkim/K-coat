
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 각 파일마다 완전히 독립적인 FileReader 인스턴스 생성
    const reader = new FileReader();

    // 이벤트 핸들러를 명확하게 설정
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        console.log(`✅ 파일 변환 완료: ${file.name} (크기: ${result.length})`);
        resolve(result);
      } else {
        reject(new Error('FileReader result is not a string'));
      }
    };

    reader.onerror = (error) => {
      console.error(`❌ 파일 변환 실패: ${file.name}`, error);
      reject(error);
    };

    // 파일 읽기 시작
    console.log(`🔄 파일 변환 시작: ${file.name}`);
    reader.readAsDataURL(file);
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
