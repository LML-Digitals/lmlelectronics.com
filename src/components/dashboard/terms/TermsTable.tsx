'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, History } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { deleteTerm } from '@/components/terms/services/termsCrud';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TermWithVersions } from '@/lib/types';

interface TermsTableProps {
  terms: TermWithVersions[];
}

export function TermsTable ({ terms }: TermsTableProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getDisplayVersion = (term: TermWithVersions) => {
    // Prioritize the active version
    const activeVersion = term.versions.find((v) => v.isActive);

    if (activeVersion) { return activeVersion; }

    // Otherwise, get the latest version by effective date
    return term.versions.reduce((latest, current) => new Date(current.effectiveAt) > new Date(latest.effectiveAt)
      ? current
      : latest);
  };

  const filteredTerms = terms.filter((term) => {
    const displayVersion = getDisplayVersion(term);

    return (
      term.title.toLowerCase().includes(searchTerm.toLowerCase())
      || displayVersion?.version.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = async () => {
    if (!selectedTermId) { return; }

    setIsDeleting(true);
    try {
      await deleteTerm(selectedTermId);
      toast({
        title: 'Success',
        description: 'Term deleted successfully!',
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete term.',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (terms.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <p className="text-sm sm:text-base text-muted-foreground text-center">
          No terms available. Create a new one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search terms..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:max-w-sm text-sm sm:text-base"
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Title</TableHead>
              <TableHead className="text-xs sm:text-sm">Version</TableHead>
              <TableHead className="text-xs sm:text-sm">Effective Date</TableHead>
              <TableHead className="text-xs sm:text-sm">Last Updated</TableHead>
              <TableHead className="text-xs sm:text-sm">Status</TableHead>
              <TableHead className="text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTerms.map((term) => {
              const displayVersion = getDisplayVersion(term);

              if (!displayVersion) { return null; }

              return (
                <TableRow key={term.id}>
                  <TableCell className="text-xs sm:text-sm">{term.title}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{displayVersion.version}</TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {displayVersion.effectiveAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {displayVersion.lastUpdated.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        displayVersion.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {displayVersion.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/dashboard/terms/${term.slug}/edit`}>
                        <Button variant="outline" size="sm" className="min-h-[44px]">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedTermId(term.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="min-h-[44px]"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Link href={`/dashboard/terms/${term.slug}/history`}>
                        <Button variant="outline" size="sm" className="min-h-[44px]">
                          <History className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md w-full mx-2 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the
              term and all its versions from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="min-h-[44px] text-sm sm:text-base">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 min-h-[44px] text-sm sm:text-base"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
