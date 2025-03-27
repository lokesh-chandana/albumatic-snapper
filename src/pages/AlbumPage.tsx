
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { useAlbumStore } from '@/lib/store';
import PhotoCard from '@/components/PhotoCard';
import UploadButton from '@/components/UploadButton';
import { toast } from 'sonner';

const AlbumPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { albums, getAlbumPhotos, addPhoto, setActiveAlbum } = useAlbumStore();
  
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
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center mb-6">
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
      
      <div className="mb-8">
        <UploadButton onImageUpload={handleImageUpload} albumId={albumId} />
      </div>
      
      {photos.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No photos in this album</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload some photos to get started.
          </p>
          <div className="relative mt-4 inline-block">
            <Button
              onClick={() => {
                document.querySelector('input[type="file"]')?.click();
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Photos
            </Button>
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
