
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, Image } from 'lucide-react';
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
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setIsCropperOpen(true);
    };
    img.src = imageUrl;
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    multiple: false
  });

  const handleCropComplete = (croppedBlob: Blob) => {
    if (!dimensions) return;
    
    // Convert blob to file
    const file = new File([croppedBlob], selectedFile?.name || 'cropped-image.jpg', {
      type: 'image/jpeg',
    });
    
    // Get dimensions of cropped image
    const img = new Image();
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

  useEffect(() => {
    return () => {
      // Clean up any object URLs when component unmounts
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  return (
    <>
      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5 animate-pulse'
            : 'border-border hover:border-primary/50 hover:bg-primary/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload
            className={`h-10 w-10 mb-4 ${
              isDragActive ? 'text-primary animate-bounce' : 'text-muted-foreground'
            }`}
          />
          <h3 className="text-lg font-medium">Drag &amp; drop an image</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            or click to browse files
          </p>
          <Button 
            variant="outline" 
            className="mt-4 group relative overflow-hidden"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <span className="relative z-10 flex items-center transition-transform group-hover:translate-x-1">
              <Image className="mr-2 h-4 w-4" />
              Choose File
            </span>
            <span className="absolute inset-0 bg-primary/10 translate-x-full transition-transform group-hover:translate-x-0"></span>
          </Button>
        </div>
      </div>

      {previewImage && (
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
