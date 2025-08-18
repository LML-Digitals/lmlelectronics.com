'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { SearchIcon, X } from 'lucide-react';
import TermCard from './TermCard';
import { TermVersion } from '@prisma/client';
import { cn } from '@/lib/utils';

export default function SearchableTerms ({ initialTerms }: {
  initialTerms: (TermVersion & { terms: { id: number; title: string; slug: string } })[];
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTerms = useMemo(() => {
    if (!searchQuery) {
      return initialTerms;
    }

    const query = searchQuery.toLowerCase();

    return initialTerms.filter((term) => term.terms.title.toLowerCase().includes(query)
        || term.content.toLowerCase().includes(query)
        || term.version.toLowerCase().includes(query));
  }, [initialTerms, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 mt-10 mb-64">
      {/* Search Bar */}
      <div className="relative mb-10 group max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon className="h-5 w-5 text-secondary" />
        </div>
        <Input
          type="text"
          placeholder="Search terms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-8 h-12 text-base rounded-lg border-2 focus-visible:ring-0 focus-visible:border-secondary shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="mb-6 text-muted-foreground text-sm">
          Found {filteredTerms.length} result{filteredTerms.length === 1 ? '' : 's'}
        </div>
      )}

      {/* Terms Grid */}
      <div className="grid gap-6">
        {filteredTerms.map((term) => (
          <TermCard
            key={term.id}
            term={{
              termId: term.terms.id,
              title: term.terms.title,
              slug: term.terms.slug,
              content: term.content,
              effectiveAt: term.effectiveAt,
              lastUpdated: term.lastUpdated,
            }}
            className={cn(
              'animate-fade-in transition-opacity',
              searchQuery ? 'opacity-100' : 'opacity-90 hover:opacity-100',
            )}
          />
        ))}

        {filteredTerms.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No terms found matching your search</p>
            <p className="text-sm mt-2">Try different keywords or check spelling</p>
          </div>
        )}
      </div>
    </div>
  );
}
