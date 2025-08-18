'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Scan, CircleDashed } from 'lucide-react';
import { useState, useRef } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { findItemByBarcode } from './services/barcodeService';
import { useToast } from '@/components/ui/use-toast';
import { InventoryItemWithRelations } from './types/ItemType';
import { useInventoryData } from './hooks/useInventoryData';
import { AddItemDialog } from './AddItemDialog';
import { ItemDetailsDialog } from './ItemDetailsDialog';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface ScannerDialogProps {
  onItemFound: (item: InventoryItemWithRelations, scanResult: string) => void;
  onRefresh: () => void;
}

export function ScannerDialog ({ onItemFound, onRefresh }: ScannerDialogProps) {
  const { toast } = useToast();
  const { categories, suppliers, locations } = useInventoryData();

  // Add a ref to track if we're currently processing a scan
  const isProcessingScan = useRef(false);
  // Add a ref to store the last scanned barcode to prevent duplicates
  const lastScannedBarcode = useRef<string | null>(null);

  // Core dialog states
  const [open, setOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  // View states - only one can be true at a time
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanType, setScanType] = useState<'sku' | 'barcode' | null>(null);

  // Item-related states
  const [foundItem, setFoundItem] = useState<InventoryItemWithRelations | null>(null);
  const [foundVariation, setFoundVariation] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  // Fix the handleScan function to prevent multiple processing
  const handleScan = (barcode: string) => {
    // Prevent duplicate scans or processing multiple scans simultaneously
    if (isProcessingScan.current || lastScannedBarcode.current === barcode) {
      return;
    }

    // Set processing flag
    isProcessingScan.current = true;
    lastScannedBarcode.current = barcode;

    // Stop scanning immediately
    setScannerActive(false);
    setIsLoading(true);

    // Use promise chaining instead of async/await
    findItemByBarcode(barcode)
      .then((item) => {
        if (item) {
          // Find which variation matched the barcode
          const matchingVariation = item.variations.find((v) => v.sku === barcode || v.barcode === barcode);

          // Determine if we matched by SKU or barcode
          if (matchingVariation) {
            setScanType(matchingVariation.sku === barcode ? 'sku' : 'barcode');
            setFoundVariation(matchingVariation);
          }

          // Found the item
          setFoundItem(item as InventoryItemWithRelations);
          setIsDetailsOpen(true);
          setOpen(false);
          resetScanner();

          // Only show toast if the dialog is being closed after finding item
          toast({
            title: 'Success',
            description: `Found item: ${item.name} - ${
              matchingVariation?.name || ''
            }`,
          });

          // Call the onItemFound callback with the scan result
          // Comment out to prevent duplicate item details opening
          // onItemFound(item as InventoryItemWithRelations, barcode);
        } else {
          // No item found for this barcode
          setScanResult(barcode);
          setScanType(null);
        }
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to look up barcode',
        });

        // Only resume scanning on error if the dialog is still open
        if (open) {
          setScannerActive(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
        isProcessingScan.current = false;
      });
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanType(null);
    lastScannedBarcode.current = null;
    setScannerActive(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setScannerActive(false);
    setScanResult(null);
    setScanType(null);
    setIsLoading(false);
    lastScannedBarcode.current = null;
    isProcessingScan.current = false;
  };

  const handleAddItemSuccess = () => {
    setShowAddItem(false);
    setOpen(false);
    onRefresh();
    toast({
      title: 'Success',
      description: 'Item added successfully',
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) { handleDialogClose(); } else {
            // Reset scan state when opening dialog
            lastScannedBarcode.current = null;
            isProcessingScan.current = false;
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Scan className="mr-2 h-4 w-4" />
            Scan Item
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isLoading ? 'Looking up item...' : 'Scan Barcode'}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            // Loading state
            <div className="flex justify-center items-center p-8">
              <CircleDashed className="h-8 w-8 animate-spin" />
            </div>
          ) : scanResult ? (
            // Result state - no item found
            <div className="space-y-6">
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Scanned Code:</Label>
                    <p className="font-mono bg-slate-100 p-2 rounded">
                      {scanResult}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    No item found with this code. Would you like to add it as a
                    new item or scan again?
                  </p>
                </div>
              </Card>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={resetScanner}>
                  Scan Again
                </Button>
                {/*
                <Button
                  variant="default"
                  onClick={() => {
                    setShowAddItem(true);
                    setOpen(false);
                    resetScanner();
                  }}
                >
                  Add New Item
                </Button>
                */}
              </div>
            </div>
          ) : (
            // Scanner state - add a key to force remount when resetting
            <BarcodeScanner
              key={`scanner-${lastScannedBarcode.current || 'initial'}`}
              onScanSuccess={handleScan}
              onScanError={(error) => toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to initialize scanner',
              })
              }
              isStarted={scannerActive}
              onStart={() => setScannerActive(true)}
              onStop={() => setScannerActive(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      {showAddItem && (
        <AddItemDialog
          onRefresh={handleAddItemSuccess}
          categories={categories}
          suppliers={suppliers}
          locations={locations}
          isLoading={isLoading}
          initialSku={scanResult}
          initialBarcode={scanType === null ? scanResult : undefined}
          open={showAddItem}
          onOpenChange={setShowAddItem}
        />
      )}

      {/* Item Details Dialog */}
      {foundItem && (
        <ItemDetailsDialog
          item={foundItem}
          selectedVariation={foundVariation}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onRefresh={onRefresh}
          categories={categories}
          suppliers={suppliers}
          locations={locations}
        />
      )}
    </>
  );
}
