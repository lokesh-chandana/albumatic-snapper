
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Plus, Crop } from 'lucide-react';
import { toast } from 'sonner';
import ImageCropper from './ImageCropper';
import { uploadPhotoToStorage } from '@/lib/supabaseStorage';

interface UploadButtonProps {
  onImageUpload: (file: File, dimensions: { width: number; height: number }) => void;
  albumId: string;
}

const UploadButton = ({ onImageUpload, albumId }: UploadButtonProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    
    // Get image dimensions
    const img = document.createElement('img');
    img.onload = async () => {
      const imageDimensions = { width: img.width, height: img.height };
      setDimensions(imageDimensions);
      
      // Upload directly to Supabase
      setIsUploading(true);
      try {
        // Call original onImageUpload to update local state for immediate feedback
        onImageUpload(file, imageDimensions);
        
        // Upload to Supabase
        await uploadPhotoToStorage(file, albumId, imageDimensions);
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
      } finally {
        setIsUploading(false);
        // Clean up URL
        URL.revokeObjectURL(imageUrl);
        setSelectedFile(null);
        setPreviewImage(null);
      }
    };
    img.src = imageUrl;
  }, [onImageUpload, albumId]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    disabled: isUploading
  });

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!dimensions) return;
    
    // Convert blob to file
    const file = new File([croppedBlob], selectedFile?.name || 'cropped-image.jpg', {
      type: 'image/jpeg',
    });
    
    // Get dimensions of cropped image
    const img = document.createElement('img');
    const imageUrl = URL.createObjectURL(croppedBlob);
    
    img.onload = async () => {
      const newDimensions = { width: img.width, height: img.height };
      
      setIsUploading(true);
      try {
        // Call original onImageUpload to update local state
        onImageUpload(file, newDimensions);
        
        // Upload to Supabase
        await uploadPhotoToStorage(file, albumId, newDimensions);
        toast.success('Image cropped and uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload cropped image');
      } finally {
        setIsUploading(false);
        // Clean up URLs
        URL.revokeObjectURL(imageUrl);
        if (previewImage) URL.revokeObjectURL(previewImage);
        
        setSelectedFile(null);
        setPreviewImage(null);
        setDimensions(null);
      }
    };
    
    img.src = imageUrl;
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    return () => {
      // Clean up any object URLs when component unmounts
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  return (
    <>
      <div {...getRootProps()}>
        <input 
          {...getInputProps()} 
          ref={fileInputRef}
        />
        <Button 
          onClick={handleButtonClick} 
          className="group"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Images
            </>
          )}
        </Button>
      </div>

      {previewImage && selectedFile && isCropperOpen && (
        <ImageCropper
          open={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setSelectedFile(null);
            setPreviewImage(null);
          }}
          image={previewImage}
          onCropComplete={handleCropComplete}
          aspectRatio={16 / 9}
        />
      )}
    </>
  );
};

export default UploadButton;
