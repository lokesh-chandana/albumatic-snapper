
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Trash2 
} from 'lucide-react';
import { useAlbumStore } from '@/lib/store';
import PhotoCard from '@/components/PhotoCard';
import UploadButton from '@/components/UploadButton';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AlbumPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { albums, getAlbumPhotos, addPhoto, setActiveAlbum, deleteAlbum } = useAlbumStore();
  
  const albumId = id || '';
  const album = albums.find((a) => a.id === albumId);
  const photos = getAlbumPhotos(albumId);
  
  useEffect(() => {
    if (!album) {
      toast.error('Album not found');
      navigate('/');
      return;
    }
    
    setActiveAlbum(albumId);
    
    return () => {
      setActiveAlbum(null);
    };
  }, [album, albumId, navigate, setActiveAlbum]);
  
  if (!album) return null;
  
  const handleImageUpload = (file: File, dimensions: { width: number; height: number }) => {
    addPhoto(albumId, file, dimensions);
  };

  const handleDeleteAlbum = () => {
    deleteAlbum(albumId);
    navigate('/');
    toast.success(`Album "${album.name}" deleted successfully`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{album.name}</h1>
            {album.description && (
              <p className="mt-1 text-lg text-muted-foreground">
                {album.description}
              </p>
            )}
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Album
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                album "{album.name}" and all photos within it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAlbum}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="mb-8 flex justify-start">
        <UploadButton onImageUpload={handleImageUpload} albumId={albumId} />
      </div>
      
      {photos.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center">
          <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium">No photos in this album</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload some photos to get started.
          </p>
          <div className="mt-4 inline-block">
            <UploadButton onImageUpload={handleImageUpload} albumId={albumId} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fade-in">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumPage;
