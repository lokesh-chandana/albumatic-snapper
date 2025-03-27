
import { useState, useCallback } from 'react';
import { Photo } from '@/types';
import { Card, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Maximize, Crop } from 'lucide-react';
import { useAlbumStore } from '@/lib/store';
import ImageCropper from './ImageCropper';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PhotoCardProps {
  photo: Photo;
}

const PhotoCard = ({ photo }: PhotoCardProps) => {
  const { deletePhoto, updatePhoto } = useAlbumStore();
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const handleCropComplete = useCallback(
    (croppedBlob: Blob) => {
      // Create a new object URL for the cropped image
      const newSrc = URL.createObjectURL(croppedBlob);
      
      // Get dimensions of cropped image
      const img = new Image();
      img.onload = () => {
        updatePhoto(photo.id, {
          src: newSrc,
          width: img.width,
          height: img.height,
        });
      };
      img.src = newSrc;
    },
    [photo.id, updatePhoto]
  );
  
  const handleDelete = useCallback(() => {
    deletePhoto(photo.id);
    setIsDeleteDialogOpen(false);
  }, [photo.id, deletePhoto]);
  
  return (
    <>
      <Card className="overflow-hidden group transition-all duration-300 hover:shadow-md">
        <div 
          className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer"
          onClick={() => setIsPreviewOpen(true)}
        >
          <img
            src={photo.src}
            alt={photo.name}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
            width={photo.width}
            height={photo.height}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <CardFooter className="p-2 gap-2 justify-between bg-card">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-2 w-full"
            onClick={() => setIsCropperOpen(true)}
          >
            <Crop className="h-3.5 w-3.5 mr-1" />
            Crop
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-2 w-full"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Maximize className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-2 w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      {/* Image Cropper Dialog */}
      <ImageCropper
        open={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        image={photo.src}
        onCropComplete={handleCropComplete}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              photo from your album.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{photo.name}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-10rem)] flex items-center justify-center">
            <img
              src={photo.src}
              alt={photo.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoCard;
