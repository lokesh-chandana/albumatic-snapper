
import { Album } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Image } from 'lucide-react';
import { useAlbumStore } from '@/lib/store';

interface AlbumCardProps {
  album: Album;
}

const AlbumCard = ({ album }: AlbumCardProps) => {
  const navigate = useNavigate();
  const { getAlbumPhotos } = useAlbumStore();
  const photos = getAlbumPhotos(album.id);
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={album.name}
            className="h-full w-full object-cover transition-all duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <Image className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 z-10 rounded-full bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold tracking-tight">{album.name}</h3>
        {album.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {album.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full group"
          onClick={() => navigate(`/album/${album.id}`)}
        >
          <FolderOpen className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
          <span>Open Album</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AlbumCard;
