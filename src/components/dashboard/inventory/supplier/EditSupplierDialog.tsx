'use client';

import { Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog';
import { useTransition, useState, startTransition } from 'react';
import { SupplierForm } from './SupplierForm';
import { SupplierProps } from './services/types';

export function EditSupplierDialog ({ supplier }: { supplier: SupplierProps }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="hover:opacity-80">
          <Edit
            size={18}
            className="text-blue-500 cursor-pointer"
            onClick={() => setOpen(true)}
          />
        </button>
      </DialogTrigger>
      {supplier && (
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm supplier={supplier} onSuccess={() => setOpen(false)} />
        </DialogContent>
      )}
    </Dialog>
  );
}
