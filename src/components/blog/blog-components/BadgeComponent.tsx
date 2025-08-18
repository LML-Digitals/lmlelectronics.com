import { Badge } from '@/components/ui/badge';
import { Glasses, HandHelping, Wrench } from 'lucide-react';
import { BlogCategory } from '@prisma/client';
import Link from 'next/link';
import { JSX } from 'react';

type BadgeComponentProps = {
  categoryName: string;
};

function capitalizeFirstLetter (word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function BadgeComponent ({ categoryName }: BadgeComponentProps) {
  const tagIcons: Record<string, JSX.Element> = {
    Repair: <Wrench size={14} />,
    Service: <HandHelping size={14} />,
    Tech: <Glasses size={14} />,
  };

  const formattedName = capitalizeFirstLetter(categoryName);

  return (
    <div className="flex flex-wrap gap-2">

      <Link
        href={`/blogs/categories/${encodeURIComponent(categoryName.toLowerCase().replace(/ /g, '-'))}`}
      >
        <Badge
          key={formattedName}
          className={`flex items-center gap-1 px-2 py-1 ${
            formattedName === 'Repairs'
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : formattedName === 'Services'
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : formattedName === 'Products'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
        >
          {tagIcons[formattedName] || null}
          <span className="text-sm whitespace-nowrap">{formattedName}</span>
        </Badge>
      </Link>

    </div>
  );
}

export default BadgeComponent;
