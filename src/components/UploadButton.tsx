
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Plus, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import ImageCropper from './ImageCropper';

interface UploadButtonProps {
  onImageUpload: (file: File, dimensions: { width: number; height: number }) => void;
  albumId: string;
}

const UploadButton = ({ onImageUpload, albumId }: UploadButtonProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
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
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setIsCropperOpen(true);
    };
    img.src = imageUrl;
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true
  });

  const handleCropComplete = (croppedBlob: Blob) => {
    if (!dimensions) return;
    
    // Convert blob to file
    const file = new File([croppedBlob], selectedFile?.name || 'cropped-image.jpg', {
      type: 'image/jpeg',
    });
    
    // Get dimensions of cropped image
    const img = document.createElement('img');
    const imageUrl = URL.createObjectURL(croppedBlob);
    
    img.onload = () => {
      const newDimensions = { width: img.width, height: img.height };
      onImageUpload(file, newDimensions);
      
      // Clean up URLs
      URL.revokeObjectURL(imageUrl);
      if (previewImage) URL.revokeObjectURL(previewImage);
      
      setSelectedFile(null);
      setPreviewImage(null);
      setDimensions(null);
      
      toast.success('Image uploaded successfully');
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
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Images
        </Button>
      </div>

      {previewImage && selectedFile && (
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
