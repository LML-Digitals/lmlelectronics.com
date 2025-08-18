'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TermComponentProps {
  term: {
    id: number;
    title: string;
    content: string;
    effectiveAt: Date;
    lastUpdated: Date;
  };
}

const TermComponent: React.FC<TermComponentProps> = ({ term }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card className="shadow-md print:shadow-none">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <h1 className='text-3xl font-bold text-secondary tracking-tight'>
              {term.title}
            </h1>
            <Button
              variant="outline"
              size="sm"
              className="print:hidden flex items-center gap-1"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Effective:</span>
              <time
                dateTime={term.effectiveAt.toISOString()}
                className='tabular-nums'
              >
                {term.effectiveAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            <div className="hidden sm:block text-slate-300 dark:text-slate-600">
              |
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Last Updated:</span>
              <time
                dateTime={term.lastUpdated.toISOString()}
                className='tabular-nums'
              >
                {term.lastUpdated.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="terms-content prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown>{term.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermComponent;
