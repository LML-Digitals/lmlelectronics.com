'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getTaxDueOverview } from '../services/taxService';

export default function TaxOverview () {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [taxData, setTaxData] = useState({
    monthly: 0,
    quarterly: 0,
    yearly: 0,
  });

  useEffect(() => {
    const loadTaxOverview = async () => {
      setIsLoading(true);
      try {
        const result = await getTaxDueOverview();

        if (result.success) {
          setTaxData({
            monthly: result.monthly,
            quarterly: result.quarterly,
            yearly: result.yearly,
          });
        }
      } catch (error) {
        console.error('Error loading tax overview:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tax data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTaxOverview();
  }, [toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Overview</CardTitle>
        <CardDescription>Summary of your tax obligations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col p-3 bg-background rounded-md border">
            <span className="text-sm text-muted-foreground">Monthly</span>
            <span className="text-2xl font-bold">
              {isLoading ? '$...' : formatCurrency(taxData.monthly)}
            </span>
          </div>
          <div className="flex flex-col p-3 bg-background rounded-md border">
            <span className="text-sm text-muted-foreground">Quarterly</span>
            <span className="text-2xl font-bold">
              {isLoading ? '$...' : formatCurrency(taxData.quarterly)}
            </span>
          </div>
          <div className="flex flex-col p-3 bg-background rounded-md border">
            <span className="text-sm text-muted-foreground">Yearly</span>
            <span className="text-2xl font-bold">
              {isLoading ? '$...' : formatCurrency(taxData.yearly)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
