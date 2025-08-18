import { Globe } from 'lucide-react';
import { SocialMediaLink } from './types/types';
import Image from 'next/image';

interface SocialMediaIconsProps {
  links: SocialMediaLink[];
  iconSize?: number;
  className?: string;
}

export default function SocialMediaIcons ({
  links,
  iconSize = 20,
  className = '',
}: SocialMediaIconsProps) {
  return (
    <div className={`flex gap-4 ${className}`}>
      {links.map((social, index) => (
        <a
          key={index}
          href={social.link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-yellow-500/5 rounded-full hover:bg-yellow-500/10 transition-colors"
        >
          <div className="relative w-6 h-6">
            <Image
              src={social.icon || '/logo.png'}
              alt={social.platform}
              fill
              className="object-cover rounded-full"
            />
          </div>
        </a>
      ))}
    </div>
  );
}
