'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import {
  activateVersion,
  deactivateTermVersion,
} from '@/components/terms/services/termsCrud';
import { toast } from '@/components/ui/use-toast';

function VersionActivation ({
  versionId,
  isActive,
  termId,
  version,
}: {
  versionId: number;
  isActive: boolean;
  termId: number;
  version: string;
}) {
  const handleAction = async () => {
    if (isActive) {
      // Deactivate the version
      await deactivateTermVersion(termId, version);
      toast({
        title: 'Version deactivated',
        description: 'The version has been deactivated',
      });
      window.location.reload();
    } else {
      // Activate the version
      await activateVersion(versionId);
      toast({
        title: 'Version activated',
        description: 'The version has been activated',
      });
      window.location.reload();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAction();
      }}
    >
      <Button
        type="submit"
        variant="outline"
        className={`gap-2 transition-all cursor-pointer ${
          isActive
            ? 'bg-red-50 text-red-600'
            : 'bg-green-50 text-green-600'
        }`}
      >
        {isActive ? (
          <>
            <XCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Deactivate Version</span>
            <span className="sm:hidden">Deactivate</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Activate Version</span>
            <span className="sm:hidden">Activate</span>
          </>
        )}
      </Button>
    </form>
  );
}

export default VersionActivation;
