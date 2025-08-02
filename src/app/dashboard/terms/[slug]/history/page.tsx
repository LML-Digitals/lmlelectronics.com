import VersionItem from '@/components/terms/term-components/VersionItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTermHistory } from '@/components/terms/services/termsCrud';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default async function TermHistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = await getTermHistory(slug);

  if (!term) return notFound();

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
      <div className="flex flex-col space-y-2">
        <nav className="flex flex-wrap space-x-2 text-xs sm:text-sm text-muted-foreground">
          <Link href="/dashboard/terms" className="hover:text-primary">
            Terms & Policies
          </Link>
          <span>/</span>
          <span className="text-primary">{term.title} History</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight pt-2">{term.title}</h1>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Document Versions</span>
            </CardTitle>
            <Badge variant="outline" className="border-primary text-primary text-xs sm:text-sm">
              {term.versions.filter((v) => v.isActive).length} Active Version
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6 sm:space-y-8">
            {term.versions.map((version, index) => (
              <VersionItem
                key={version.id}
                version={version}
                isLast={index === term.versions.length - 1}
                termId={term.id}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
