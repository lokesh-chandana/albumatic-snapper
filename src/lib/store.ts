
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Album, Photo } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AlbumState {
  albums: Album[];
  photos: Photo[];
  activeAlbumId: string | null;
  
  // Album actions
  createAlbum: (name: string, description?: string) => Album;
  updateAlbum: (id: string, data: Partial<Album>) => void;
  deleteAlbum: (id: string) => void;
  setActiveAlbum: (id: string | null) => void;
  
  // Photo actions
  addPhoto: (albumId: string, file: File, dimensions: { width: number, height: number }) => Photo;
  updatePhoto: (id: string, data: Partial<Photo>) => void;
  deletePhoto: (id: string) => void;
  getAlbumPhotos: (albumId: string) => Photo[];
}

export const useAlbumStore = create<AlbumState>()(
  persist(
    (set, get) => ({
      albums: [
        {
          id: 'default',
          name: 'My First Album',
          description: 'A collection of my favorite memories',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'travel',
          name: 'Travel Adventures',
          description: 'Exploring the world one photo at a time',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'family',
          name: 'Family',
          description: 'Precious moments with loved ones',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      photos: [],
      activeAlbumId: null,
      
      createAlbum: (name, description) => {
        const newAlbum: Album = {
          id: uuidv4(),
          name,
          description,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          albums: [...state.albums, newAlbum],
        }));
        
        return newAlbum;
      },
      
      updateAlbum: (id, data) => {
        set((state) => ({
          albums: state.albums.map((album) => 
            album.id === id 
              ? { ...album, ...data, updatedAt: new Date() } 
              : album
          ),
        }));
      },
      
      deleteAlbum: (id) => {
        set((state) => ({
          albums: state.albums.filter((album) => album.id !== id),
          photos: state.photos.filter((photo) => photo.albumId !== id),
          activeAlbumId: state.activeAlbumId === id ? null : state.activeAlbumId,
        }));
      },
      
      setActiveAlbum: (id) => {
        set({ activeAlbumId: id });
      },
      
      addPhoto: (albumId, file, dimensions) => {
        const newPhoto: Photo = {
          id: uuidv4(),
          albumId,
          file,
          src: URL.createObjectURL(file),
          name: file.name,
          width: dimensions.width,
          height: dimensions.height,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          photos: [...state.photos, newPhoto],
        }));
        
        // Update album cover if this is the first photo
        const albumPhotos = get().getAlbumPhotos(albumId);
        if (albumPhotos.length === 1) {
          get().updateAlbum(albumId, { coverImage: newPhoto.src });
        }
        
        return newPhoto;
      },
      
      updatePhoto: (id, data) => {
        set((state) => ({
          photos: state.photos.map((photo) => 
            photo.id === id 
              ? { ...photo, ...data, updatedAt: new Date() } 
              : photo
          ),
        }));
      },
      
      deletePhoto: (id) => {
        const photo = get().photos.find(p => p.id === id);
        
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        }));
        
        // Update album cover if needed
        if (photo) {
          const albumPhotos = get().getAlbumPhotos(photo.albumId);
          if (albumPhotos.length > 0) {
            const album = get().albums.find(a => a.id === photo.albumId);
            if (album && album.coverImage === photo.src) {
              get().updateAlbum(photo.albumId, { coverImage: albumPhotos[0].src });
            }
          } else {
            get().updateAlbum(photo.albumId, { coverImage: undefined });
          }
        }
      },
      
      getAlbumPhotos: (albumId) => {
        return get().photos.filter((photo) => photo.albumId === albumId);
      },
    }),
    {
      name: 'album-storage',
    }
  )
);
