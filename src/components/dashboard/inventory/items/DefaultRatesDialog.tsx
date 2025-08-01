"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, InfoIcon } from "lucide-react";
import {
  getDefaultShippingRate,
  getDefaultTaxRate,
} from "@/components/dashboard/settings/services/inventorySettings";

interface DefaultRatesDialogProps {
  trigger?: React.ReactNode;
}

export function DefaultRatesDialog({ trigger }: DefaultRatesDialogProps) {
  const [open, setOpen] = useState(false);

  // Add state for default rates
  const [taxRate, setTaxRate] = useState(0);
  const [shippingRate, setShippingRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch default rates directly from server functions
  useEffect(() => {
    const fetchDefaultRates = async () => {
      try {
        setIsLoading(true);
        // Call server functions directly
        const tax = await getDefaultTaxRate();
        const shipping = await getDefaultShippingRate();

        setTaxRate(tax || 0);
        setShippingRate(shipping || 0);
        setError(null);
      } catch (err) {
        console.error("Error fetching default rates:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load default rates"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchDefaultRates();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <InfoIcon className="h-4 w-4 mr-2" />
            View Default Rates
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Default Inventory Rates</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-4 rounded-md text-destructive">
              <p>Error loading default rates: {error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium mb-2">Default Tax Rate</h3>
                  <p className="text-2xl font-bold">{taxRate}%</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Applied to variations with &quot;Use Default Rates&quot;
                    enabled
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium mb-2">
                    Default Shipping Rate
                  </h3>
                  <p className="text-2xl font-bold">
                    ${shippingRate.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Applied to variations with &quot;Use Default Rates&quot;
                    enabled
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2">
                  Default Rates Information
                </h4>
                <p className="text-sm text-muted-foreground">
                  Default rates are used for price calculations when a variation
                  has the &quot;Use Default Rates&quot; toggle enabled. These
                  rates can be changed in the Settings &gt; Inventory page.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
