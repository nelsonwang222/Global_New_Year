
export interface Language {
  code: string;
  name: string;
  native: string;
}

export interface GenerationParams {
  language: string;
  location: string;
  culturalElements?: string;
}

export interface GeneratedImage {
  url: string;
  base64: string;
}
