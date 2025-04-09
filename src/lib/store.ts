
import { create } from 'zustand';
import { Album, Photo } from '@/types';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { deletePhotoFromStorage } from './supabaseStorage';

interface AlbumState {
  albums: Album[];
  photos: Photo[];
  createAlbum: (name: string, description?: string) => void;
  updateAlbum: (id: string, updates: Partial<Album>) => void;
  deleteAlbum: (id: string) => void;
  getAlbum: (id: string) => Album | undefined;
  addPhoto: (photo: Photo) => void;
  deletePhoto: (photoId: string) => void;
  getPhotosForAlbum: (albumId: string) => Photo[];
  clearUserData: () => void;
}

export const useAlbumStore = create<AlbumState>()(
  persist(
    (set, get) => ({
      albums: [],
      photos: [],
      
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
      
      updateAlbum: (id, updates) => {
        set((state) => ({
          albums: state.albums.map((album) => 
            album.id === id
              ? { ...album, ...updates, updatedAt: new Date() }
              : album
          ),
        }));
      },
      
      deleteAlbum: (id) => {
        // First delete all photos in the album from storage
        const photosToDelete = get().getPhotosForAlbum(id);
        photosToDelete.forEach(photo => {
          if (photo.src) {
            deletePhotoFromStorage(photo.src).catch(console.error);
          }
        });
        
        set((state) => ({
          albums: state.albums.filter((album) => album.id !== id),
          photos: state.photos.filter((photo) => photo.albumId !== id),
        }));
      },
      
      getAlbum: (id) => {
        return get().albums.find((album) => album.id === id);
      },
      
      addPhoto: (photo) => {
        set((state) => ({
          photos: [...state.photos, photo],
        }));
        
        // Update album cover if it's the first photo
        const albumPhotos = get().getPhotosForAlbum(photo.albumId);
        if (albumPhotos.length === 1) {
          get().updateAlbum(photo.albumId, { coverImage: photo.src });
        }
      },
      
      deletePhoto: (photoId) => {
        const photoToDelete = get().photos.find(photo => photo.id === photoId);
        
        if (photoToDelete?.src) {
          deletePhotoFromStorage(photoToDelete.src).catch(console.error);
        }
        
        set((state) => ({
          photos: state.photos.filter((photo) => photo.id !== photoId),
        }));
        
        // If photo was album cover, update with another photo if available
        if (photoToDelete) {
          const album = get().getAlbum(photoToDelete.albumId);
          if (album?.coverImage === photoToDelete.src) {
            const remainingPhotos = get().getPhotosForAlbum(photoToDelete.albumId);
            if (remainingPhotos.length > 0) {
              get().updateAlbum(photoToDelete.albumId, { coverImage: remainingPhotos[0].src });
            } else {
              get().updateAlbum(photoToDelete.albumId, { coverImage: undefined });
            }
          }
        }
      },
      
      getPhotosForAlbum: (albumId) => {
        return get().photos.filter((photo) => photo.albumId === albumId);
      },
      
      clearUserData: () => {
        set({ albums: [], photos: [] });
      },
    }),
    {
      name: 'album-storage',
    }
  )
);
