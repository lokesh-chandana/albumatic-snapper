
export interface Album {
  id: string;
  name: string;
  coverImage?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id: string;
  albumId: string;
  file: File | null;
  src: string;
  thumbnail?: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
