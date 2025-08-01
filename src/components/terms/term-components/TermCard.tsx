import Link from 'next/link';

interface TermCardProps {
  term: {
    termId: number;
    title: string;
    slug: string;
    content: string;
    effectiveAt: Date;
    lastUpdated: Date;
  };
  className?: string;
}

const TermCard: React.FC<TermCardProps> = ({ term, className }) => {
  function cn(...classes: (string | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
  }
  return (
    <div className={cn('border rounded-xl max-w-7xl mx-auto flex my-5 flex-col bg-card shadow-sm', className)}>
      <Link href={`/terms/${term.slug}`} >
        <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:border-secondary hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
          <h2 className="text-2xl font-bold mb-2 text-primary">{term.title}</h2>
          <div className="flex gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <span>Effective:</span>
              <time dateTime={term.effectiveAt.toISOString()}>
                {term.effectiveAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <span>Last Updated:</span>
              <time dateTime={term.lastUpdated.toISOString()}>
                {term.lastUpdated.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{term.content.substring(0, 200)}...</p>
        </div>
      </Link>
    </div>
  );
};

export default TermCard;