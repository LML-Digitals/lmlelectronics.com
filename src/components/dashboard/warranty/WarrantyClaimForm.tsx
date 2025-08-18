'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createWarrantyClaim } from './services/warrantyCrud';
import { WarrantyClaimInput } from './types/types';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle } from 'lucide-react';

interface WarrantyClaimFormProps {
  warrantyId: string;
  customerId: string;
  onSuccess?: () => void;
  isLifetimeWarranty?: boolean;
}

export function WarrantyClaimForm ({
  warrantyId,
  customerId,
  onSuccess,
  isLifetimeWarranty = false,
}: WarrantyClaimFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState<WarrantyClaimInput>({
    description: '',
    issueType: 'Defect',
    warrantyId,
    customerId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createWarrantyClaim(formData);
      toast({
        title: 'Success',
        description: 'Warranty claim submitted successfully',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting warranty claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit warranty claim. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="issueType">Issue Type</Label>
        <Select
          name="issueType"
          value={formData.issueType}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, issueType: value }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select issue type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Defect">
              Manufacturing Defect {isLifetimeWarranty && '- Auto-approved'}
            </SelectItem>
            <SelectItem value="Malfunction">Malfunction</SelectItem>
            <SelectItem value="Performance">Performance Issue</SelectItem>
            <SelectItem value="Wear">Normal Wear and Tear</SelectItem>
            <SelectItem value="Damage">Accidental Damage</SelectItem>
          </SelectContent>
        </Select>

        {isLifetimeWarranty && formData.issueType === 'Defect' && (
          <div className="mt-1 text-sm text-green-600 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            This claim will be automatically approved
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          placeholder="Please describe the issue in detail..."
          required
        />
      </div>

      <div className="flex items-center space-x-2 mt-6">
        <Switch
          id="termsAccepted"
          checked={termsAccepted}
          onCheckedChange={setTermsAccepted}
          required
        />
        <Label htmlFor="termsAccepted" className="text-sm">
          I agree to the{' '}
          <a
            href={`${
              process.env.NEXT_PUBLIC_APP_URL || 'https://lmlrepair.com'
            }/terms/warranty-terms`}
            className="text-primary underline hover:text-primary/80"
            target="_blank"
          >
            warranty terms
          </a>
        </Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting || !termsAccepted}>
          {isSubmitting ? 'Submitting...' : 'Submit Claim'}
        </Button>
      </div>
    </form>
  );
}
