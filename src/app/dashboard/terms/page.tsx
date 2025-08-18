import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { TermsTable } from '@/components/dashboard/terms/TermsTable';
import { getTerms } from '@/components/terms/services/termsCrud';
import { TermWithVersions } from '@/lib/types';

export default async function TermsPage () {
  let terms: TermWithVersions[] = [];
  let error = null;

  try {
    terms = await getTerms();
  } catch (err) {
    console.error(err);
    error = 'Check your internet connection.';
  }

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Terms & Policies
        </h2>
        <Link href="/dashboard/terms/create">
          <Button className="min-h-[44px] text-sm sm:text-base">
            <Plus className="mr-2 h-4 w-4" />
            Create New Terms
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <TermsTable terms={terms} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
