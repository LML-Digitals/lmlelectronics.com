'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

import { getSettingsByCategory } from '../services/settingsCrud';
import {
  updateInventoryRates,
  getInventorySettings,
} from '../services/inventorySettings';
import { SettingCategory } from '../services/settingsTypes';

// Define the setting keys as constants
const DEFAULT_SHIPPING_RATE = 'default_shipping_rate';
const DEFAULT_TAX_RATE = 'default_tax_rate';

// Form schema
const inventorySettingsSchema = z.object({
  shippingRate: z.string().min(1, 'Shipping rate is required'),
  taxRate: z.string().min(1, 'Tax rate is required'),
});

// Type for form values
type InventorySettingsFormValues = z.infer<typeof inventorySettingsSchema>;

export default function InventorySettings () {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Setup form with default values
  const form = useForm<InventorySettingsFormValues>({
    resolver: zodResolver(inventorySettingsSchema),
    defaultValues: {
      shippingRate: '0.00',
      taxRate: '0.00',
    },
  });

  // Load inventory settings
  useEffect(() => {
    async function loadSettings () {
      try {
        setIsLoading(true);
        // Use the new function that automatically initializes settings if they don't exist
        const settings = await getInventorySettings();

        // Update form values
        const shippingRate
          = settings.find((s) => s.key === DEFAULT_SHIPPING_RATE)?.value
          || '0.00';
        const taxRate
          = settings.find((s) => s.key === DEFAULT_TAX_RATE)?.value || '0.00';

        form.reset({
          shippingRate: String(shippingRate),
          taxRate: String(taxRate),
        });
      } catch (error) {
        console.error('Failed to load inventory settings:', error);
        toast({
          title: 'Failed to load settings',
          description: 'Please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [form]);

  // Save settings
  async function onSubmit (formData: FormData) {
    try {
      setIsSaving(true);

      // Save using server action
      const result = await updateInventoryRates(formData);

      if (result.success) {
        toast({
          title: 'Inventory settings updated successfully',
          description: 'Your inventory settings have been updated',
        });
      } else {
        toast({
          title: 'Failed to update settings',
          description: 'Please try again later',
        });
      }
    } catch (error) {
      console.error('Error saving inventory settings:', error);
      toast({
        title: 'Failed to update settings',
        description: 'Please try again later',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading inventory settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Inventory Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure default shipping and tax rates for inventory items
        </p>
      </div>

      <Separator />

      <form action={onSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Default Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="shippingRate">Default Shipping Rate ($)</Label>
                <Input
                  id="shippingRate"
                  name="shippingRate"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={form.watch('shippingRate')}
                  placeholder="0.00"
                />
                {form.formState.errors.shippingRate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.shippingRate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue={form.watch('taxRate')}
                  placeholder="0.00"
                />
                {form.formState.errors.taxRate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.taxRate.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto mt-4"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
