export interface Scene {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string;
}

export interface Style {
  id: string;
  name: string;
  prompt: string;
}

export interface Costume {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string;
}

export interface SimpleOption {
  id: string;
  name: string;
  prompt: string;
}

export type AspectRatio = '1:1' | '4:3' | '16:9' | '9:16';

export type Resolution = 'standard' | 'hd' | 'ultra_hd';

export type UploadedPerson = {
  file: File;
  base64: string;
};
