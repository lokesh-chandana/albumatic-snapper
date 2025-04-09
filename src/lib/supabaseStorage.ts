
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { Photo } from '@/types/index';

export const uploadPhotoToStorage = async (
  file: File,
  albumId: string,
  dimensions: { width: number; height: number }
): Promise<Photo | null> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${albumId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) throw new Error('Failed to get public URL');

    const newPhoto: Photo = {
      id: uuidv4(),
      albumId,
      file: null,
      src: urlData.publicUrl,
      name: file.name,
      width: dimensions.width,
      height: dimensions.height,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return newPhoto;
  } catch (error) {
    console.error('Error uploading photo:', error);
    return null;
  }
};

export const deletePhotoFromStorage = async (photoUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const url = new URL(photoUrl);
    const fullPath = url.pathname;
    
    // The path typically looks like /storage/v1/object/public/photos/path/to/file.jpg
    // We need to extract just the path/to/file.jpg part
    const pathParts = fullPath.split('photos/');
    if (pathParts.length < 2) return false;
    
    const filePath = pathParts[1];
    
    const { error } = await supabase.storage
      .from('photos')
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};
