
export const COLORS = {
  primary: '#FF6B35',
  secondary: '#1A1D2E',
  background: '#FAF9F6',
  text: '#2D3436',
  success: '#00B894',
};

export const PRODUCT_OPTIONS = [
  { 
    value: "premium_zerostop", 
    label: "프리미엄 제로스탑 (친환경)",
    description: "내곰팡이성, 결로 예방 성능 인증"
  },
  { 
    value: "world_class", 
    label: "고급형 월드클래스",
    description: "내곰팡이성, 중금속 불검출 인증"
  },
  { 
    value: "premium_coat", 
    label: "프리미엄 코트",
    description: "고급 마감, 내구성 강화"
  }
];

export const COLOR_OPTIONS = [
  "라이트 그레이",
  "애쉬 그레이",
  "세미 크림",
  "백색",
  "아이보리",
  "기타 (직접 입력)"
];

export const ISSUE_TAGS = [
  "#곰팡이발생",
  "#균열발생/벽지",
  "#진동발생",
  "#벽_박리",
  "#구축인테리어",
  "#결로현상",
  "#도장면박리",
  "#벽면손상"
];

// n8n 로컬 웹훅 주소
export const WEBHOOK_URL = 'http://localhost:5678/webhook-test/send-email';
