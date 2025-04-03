declare module 'dom-to-image-more' {
  interface DomToImageOptions {
    filter?: (node: Node) => boolean;
    bgcolor?: string;
    width?: number;
    height?: number;
    style?: Record<string, string>;
    quality?: number;
    imagePlaceholder?: string;
    cacheBust?: boolean;
  }

  interface DomToImage {
    toSvg(node: Node, options?: DomToImageOptions): Promise<string>;
    toPng(node: Node, options?: DomToImageOptions): Promise<string>;
    toJpeg(node: Node, options?: DomToImageOptions): Promise<string>;
    toBlob(node: Node, options?: DomToImageOptions): Promise<Blob>;
    toPixelData(node: Node, options?: DomToImageOptions): Promise<Uint8ClampedArray>;
  }

  const domtoimage: DomToImage;
  export default domtoimage;
} 