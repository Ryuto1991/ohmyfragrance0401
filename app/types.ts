export type LabelSize = 'large' | 'medium' | 'small' | 'square';

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
}

export interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
} 