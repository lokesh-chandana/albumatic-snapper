
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlus, Image } from 'lucide-react';
import AlbumCard from '@/components/AlbumCard';
import CreateAlbumDialog from '@/components/CreateAlbumDialog';
import { useAlbumStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const { albums } = useAlbumStore();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="mt-2 text-lg text-muted-foreground">
              Organize and manage your photo collections
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="transition-all hover:shadow-md"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            New Album
          </Button>
        </div>
      </header>

      {albums.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center">
          <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No albums yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first album to start organizing your photos.
          </p>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="mt-4"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Album
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}

      <CreateAlbumDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};

export default HomePage;
