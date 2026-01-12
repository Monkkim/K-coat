
export type WorkType = 'remodeling' | 'new' | 'occupied';

export interface PhotoSet {
  id: string;
  before: string | null;
  after: string | null;
  beforeName?: string;
  afterName?: string;
}

export interface KCoatFormData {
  buildingName: string;
  workDate: string;
  workType: WorkType;
  detailedLocation: string;
  productType: string;
  productColor: string;
  workHours: number;
  issues: string[];
  useWatermark: boolean;
  photoSets: { before: string; after: string }[];
}

export type BlockType = 'text' | 'image';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string; // 텍스트 내용 또는 이미지 URL/Base64
}

export interface N8NResponse {
  success: boolean;
  html?: string;
  title?: string;
  images?: { url: string; base64: string }[];
  hashtags?: string;
}

export enum GenerationStep {
  PREPROCESS = 'preprocess',
  IMAGE_GEN = 'imageGen',
  WATERMARK = 'watermark',
  TEXT_GEN = 'textGen',
  ASSEMBLY = 'assembly'
}

export interface ProgressState {
  id: GenerationStep;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: string;
}
