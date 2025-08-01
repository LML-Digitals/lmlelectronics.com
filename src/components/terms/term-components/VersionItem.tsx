'use client';

import { useState } from 'react';
import { CheckCircle, Clock, ChevronDown, ChevronUp, CircleDashed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import VersionActivation from '@/components/dashboard/terms/VersionActivation';
import { TermVersion } from '@prisma/client';
import { cn } from '@/lib/utils';

export default function VersionItem({ version, isLast, termId }: { 
  version: TermVersion; 
  isLast: boolean; 
  termId: number; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);

  return (
    <div className="relative pl-6 group">
      {/* Timeline indicator */}
      <div
        className={cn(
          "absolute left-0 top-4 h-[calc(100%-2rem)] w-px bg-gradient-to-b",
          version.isActive
            ? "from-primary to-primary/30"
            : "from-muted-foreground/20 to-transparent",
          isLast ? "h-8" : "h-full"
        )}
      >
        <div className="absolute -left-[3px] top-0 w-2 h-2 rounded-full bg-primary border-2 border-background" />
      </div>

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50">
          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-primary/10"
                >
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="bg-accent px-3 py-1 rounded-full text-sm">
                    v{version.version}
                  </span>
                  {version.isActive ? (
                    <span className="flex items-center gap-1 text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Active</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Inactive</span>
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">Effective Date:</span>
                <time
                  dateTime={version.effectiveAt.toISOString()}
                  className="font-mono text-sm"
                >
                  {version.effectiveAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Last Updated:</span>
                <time
                  dateTime={version.lastUpdated.toISOString()}
                  className="font-mono text-sm"
                >
                  {version.lastUpdated.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
            </div>
          </div>

          <div className="sm:w-40 flex sm:justify-end">
            <VersionActivation
              versionId={version.id}
              isActive={version.isActive}
              termId={termId}
              version={version.version}
            />
          </div>
        </div>

        {isOpen && (
          <div className="ml-4 mb-4 border-l-2 border-primary/20 pl-4">
            <div className="rounded-lg bg-background p-6 shadow-sm transition-opacity">
              {isContentLoading ? (
                <div className="space-y-3">
                  <CircleDashed className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <div className="prose max-w-none dark:prose-invert prose-sm">
                  <ReactMarkdown>{version.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}

        {!isLast && <Separator className="my-4 opacity-50" />}
      </div>
    </div>
  );
}