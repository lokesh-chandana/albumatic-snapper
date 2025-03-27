
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAlbumStore } from '@/lib/store';
import { FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateAlbumDialog = ({ open, onOpenChange }: CreateAlbumDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createAlbum } = useAlbumStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter an album name');
      return;
    }
    
    createAlbum(name, description);
    toast.success('Album created successfully');
    
    // Reset form
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FolderPlus className="mr-2 h-5 w-5" />
              Create New Album
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Album Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Amazing Album"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A collection of my favorite memories..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Album</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAlbumDialog;
