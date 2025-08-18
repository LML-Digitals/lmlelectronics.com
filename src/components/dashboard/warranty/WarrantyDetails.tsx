'use client';
import React, { useState, useEffect } from 'react';
import {
  getWarrantyById,
  createWarrantyClaim,
  updateWarrantyClaim,
  deleteWarrantyClaim,
} from './services/warrantyCrud';
import {
  WarrantyProps,
  WarrantyClaimProps,
  WarrantyClaimInput,
} from './types/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  FilePlus,
  FileText,
  Trash2,
  Edit,
  User,
  Package,
  AlertTriangle,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Separator } from '@/components/ui/separator';
import { WarrantyForm } from './WarrantyForm';
import { WarrantyClaimForm } from './WarrantyClaimForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WarrantyClaim } from '@prisma/client';
import { cn } from '@/lib/utils';

interface WarrantyDetailsProps {
  warrantyId: string;
  isCustomer: boolean;
}

export default function WarrantyDetails ({
  warrantyId,
  isCustomer,
}: WarrantyDetailsProps) {
  const [warranty, setWarranty] = useState<WarrantyProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [isResolutionDialogOpen, setIsResolutionDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [claimStatus, setClaimStatus] = useState('Approved');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchWarrantyDetails();
  }, [warrantyId]);

  const fetchWarrantyDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getWarrantyById(warrantyId);

      setWarranty(data);
    } catch (error) {
      console.error('Failed to fetch warranty details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load warranty details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClaimStatus = async () => {
    if (!selectedClaim) { return; }

    try {
      await updateWarrantyClaim(selectedClaim.id, {
        status: claimStatus,
        resolution: resolution,
      });
      toast({
        title: 'Success',
        description: `Claim ${claimStatus.toLowerCase()} successfully`,
      });
      fetchWarrantyDetails();
      setIsResolutionDialogOpen(false);
    } catch (error) {
      console.error('Failed to update claim status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update claim status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClaim = async () => {
    if (!selectedClaim) { return; }

    try {
      await deleteWarrantyClaim(selectedClaim.id);
      toast({
        title: 'Success',
        description: 'Warranty claim deleted successfully',
      });
      fetchWarrantyDetails();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete warranty claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete warranty claim. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isWarrantyActive = () => {
    if (!warranty) { return false; }

    return warranty.endDate ? new Date(warranty.endDate) > new Date() : true; // Lifetime warranty is always active
  };

  // Coverage display helpers
  const coverageLabels = {
    defects: 'Manufacturing Defects',
    parts: 'Replacement Parts',
    labor: 'Labor',
    accidental: 'Accidental Damage',
    water: 'Water/Liquid Damage',
    priority: 'Priority Support',
    replacements: 'Full Replacements',
  };

  const renderCoverageDetails = (coverage: any) => {
    if (!coverage || Object.keys(coverage).length === 0) {
      return (
        <p className="text-muted-foreground italic">
          No coverage details available
        </p>
      );
    }

    // Parse the coverage if it's a string
    let coverageObj = coverage;

    if (typeof coverage === 'string') {
      try {
        coverageObj = JSON.parse(coverage);
      } catch (e) {
        console.error('Error parsing coverage:', e);

        return (
          <p className="text-muted-foreground italic">
            Coverage data format error
          </p>
        );
      }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(coverageObj).map(([key, value]) => (
          <div key={key} className="flex items-center">
            {value ? (
              <Check className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <X className="h-4 w-4 text-red-500 mr-2" />
            )}
            <span className={cn(!value && 'text-muted-foreground')}>
              {coverageLabels[key as keyof typeof coverageLabels] || key}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading warranty details...</p>
      </div>
    );
  }

  if (!warranty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Warranty not found or has been deleted.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Warranties
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const getClaimStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
    case 'approved':
      return (
        <Badge variant="outline" className="bg-green-100 dark:bg-green-800">
            Approved
        </Badge>
      );
    case 'denied':
      return <Badge variant="destructive">Denied</Badge>;
    case 'in review':
      return (
        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-800">
            In Review
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-800">
            Pending
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Warranties
        </Button>
        <Badge
          variant={isWarrantyActive() ? 'outline' : 'destructive'}
          className={isWarrantyActive() ? 'bg-green-100 dark:bg-green-800' : ''}
        >
          {isWarrantyActive() ? 'Active' : 'Expired'}
        </Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">
              {warranty.warrantyType?.name || 'Standard'} Warranty
            </CardTitle>
            <CardDescription>
              {warranty.inventoryItem?.name
                || warranty.inventoryVariation?.name
                || 'Unknown Product'}
            </CardDescription>
          </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Warranty</DialogTitle>
              </DialogHeader>
              <WarrantyForm
                warranty={warranty}
                onSuccess={() => {
                  fetchWarrantyDetails();
                  setIsEditDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Customer Information
              </h3>
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="flex space-x-3 items-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {warranty.customer?.firstName} {warranty.customer?.lastName}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>{warranty.customer?.email}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Product Information
              </h3>
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="flex space-x-3 items-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {warranty.inventoryItem?.name
                      || warranty.inventoryVariation?.name
                      || 'Unknown Product'}
                  </span>
                </div>
                {warranty.inventoryVariation?.sku && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    SKU: {warranty.inventoryVariation.sku}
                  </p>
                )}
                {warranty.inventoryItem?.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {warranty.inventoryItem.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Add coverage section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Coverage Details
            </h3>
            {renderCoverageDetails(warranty.warrantyType?.coverage)}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Start Date
              </h3>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {format(new Date(warranty.startDate), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                End Date
              </h3>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {warranty.endDate
                    ? format(new Date(warranty.endDate), 'MMM d, yyyy')
                    : 'Lifetime Warranty'}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Warranty Type
              </h3>
              <span>{warranty.warrantyType?.name || 'Standard'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="claims">
        <TabsList className="mb-4">
          <TabsTrigger value="claims">
            Claims ({warranty.warrantyClaims?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claims">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Warranty Claims</CardTitle>
              <Dialog
                open={isClaimDialogOpen}
                onOpenChange={setIsClaimDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={!isWarrantyActive()}
                    className="flex items-center gap-1"
                  >
                    <FilePlus className="h-4 w-4" /> New Claim
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Submit Warranty Claim</DialogTitle>
                    <DialogDescription>
                      Submit a new warranty claim for this product.
                      {warranty.warrantyType?.name === 'Lifetime Warranty' && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Defect claims on Lifetime warranties are automatically
                          approved.
                        </div>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <WarrantyClaimForm
                    warrantyId={warrantyId}
                    customerId={warranty.customerId}
                    onSuccess={() => {
                      fetchWarrantyDetails();
                      setIsClaimDialogOpen(false);
                    }}
                    isLifetimeWarranty={
                      warranty.warrantyType?.name === 'Lifetime Warranty'
                    }
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {warranty.warrantyClaims && warranty.warrantyClaims.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Issue Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warranty.warrantyClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell>
                          {format(new Date(claim.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{claim.issueType}</TableCell>
                        <TableCell>
                          {getClaimStatusBadge(claim.status)}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {claim.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setResolution(claim.resolution || '');
                                setClaimStatus(claim.status);
                                setIsResolutionDialogOpen(true);
                              }}
                            >
                              {claim.status.toLowerCase() === 'pending' ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </Button>
                            {((claim.status.toLowerCase() === 'pending'
                              && isCustomer)
                              || !isCustomer) && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No claims yet</p>
                  <p className="text-muted-foreground mt-1">
                    {isWarrantyActive()
                      ? 'Submit a new claim using the button above'
                      : 'This warranty has expired and no longer accepts claims'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resolution dialog for responding to claims */}
      <Dialog
        open={isResolutionDialogOpen}
        onOpenChange={setIsResolutionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedClaim?.status.toLowerCase() === 'pending'
                ? 'Respond to Warranty Claim'
                : 'Warranty Claim Details'}
            </DialogTitle>
            <DialogDescription>
              Claim submitted on{' '}
              {selectedClaim
                && format(new Date(selectedClaim.createdAt), 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="font-medium">Issue Type</Label>
              <p className="mt-1">{selectedClaim?.issueType}</p>
            </div>

            <div>
              <Label className="font-medium">Customer Description</Label>
              <p className="mt-1 text-sm bg-muted p-3 rounded-md">
                {selectedClaim?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={claimStatus}
                onValueChange={setClaimStatus}
                disabled={isCustomer}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Denied">Denied</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution / Notes</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter resolution details or notes about this claim..."
                disabled={isCustomer}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <>
              {!isCustomer ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsResolutionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateClaimStatus}>
                    Submit Response
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsResolutionDialogOpen(false)}
                >
                  Close
                </Button>
              )}
            </>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete claim confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this warranty claim. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteClaim}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
