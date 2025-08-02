import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { SocialMediaLink } from './types/types';

interface SocialMediaManagerProps {
  links: SocialMediaLink[];
  onLinksChange: (links: SocialMediaLink[]) => void;
  onIconUpload: (file: File) => Promise<string>;
}

export default function SocialMediaManager({
  links,
  onLinksChange,
  onIconUpload,
}: SocialMediaManagerProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleIconUpload = async (index: number, file: File) => {
    setIsUploading(true);
    try {
      const iconUrl = await onIconUpload(file);
      const newLinks = [...links];
      newLinks[index] = { ...newLinks[index], icon: iconUrl };
      onLinksChange(newLinks);
    } catch (error) {
      console.error('Error uploading icon:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const addLink = () => {
    onLinksChange([
      ...links,
      { platform: '', link: '', icon: '/logo.png' },
    ]);
  };

  const removeLink = (index: number) => {
    onLinksChange(links.filter((_, i) => i !== index));
  };

  const updateLink = (
    index: number,
    field: keyof SocialMediaLink,
    value: string
  ) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onLinksChange(newLinks);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Social Media Links</h3>
      <div className="space-y-4">
        {links.map((link, index) => (
          <div key={index} className="flex items-center gap-4 group">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={link.icon || '/logo.png'}
                  alt={link.platform}
                  className="w-full h-full object-cover"
                />
                <Label
                  htmlFor={`social-icon-${index}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Upload className="w-4 h-4 text-white" />
                  )}
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  id={`social-icon-${index}`}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleIconUpload(index, file);
                  }}
                  disabled={isUploading}
                />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Input
                value={link.platform}
                onChange={(e) => updateLink(index, 'platform', e.target.value)}
                placeholder="Platform (e.g., Facebook, Instagram)"
              />
              <Input
                value={link.link}
                onChange={(e) => updateLink(index, 'link', e.target.value)}
                placeholder="Link (e.g., https://facebook.com/...)"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLink(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addLink}
        >
          Add Social Media Link
        </Button>
      </div>
    </div>
  );
}
