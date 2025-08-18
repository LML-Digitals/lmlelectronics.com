'use client';

import { useState } from 'react';
import { TaxCategory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { calculateTaxes } from '../services/taxService';

const calculatorSchema = z
  .object({
    startDate: z.date({
      error: 'A start date is required.',
    }),
    endDate: z.date({
      error: 'An end date is required.',
    }),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type CalculatorFormValues = z.infer<typeof calculatorSchema>;

export default function TaxCalculator ({
  onCalculationComplete,
}: {
  onCalculationComplete?: () => void;
}) {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  // Function to handle calculation complete
  const handleCalculationComplete = () => {
    if (onCalculationComplete) {
      onCalculationComplete();
    }
  };

  const onSubmit = async (data: CalculatorFormValues) => {
    setIsCalculating(true);
    try {
      const result = await calculateTaxes(data.startDate, data.endDate);

      if (result.success) {
        toast({
          title: 'Tax calculation complete',
          description:
            result.message || 'Tax records have been successfully generated.',
        });
        handleCalculationComplete();
      } else {
        toast({
          title: 'Calculation error',
          description: result.error || 'There was an error calculating taxes.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Calculation error',
        description: 'There was an error calculating taxes.',
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Calculate Taxes</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Generate tax records for a specific date range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm sm:text-base">From Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal text-xs sm:text-sm',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm sm:text-base">To Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal text-xs sm:text-sm',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormDescription className="text-xs sm:text-sm">
              This will calculate tax records for all sales in the selected date
              range using the active tax rates. Existing tax records won't be
              duplicated.
            </FormDescription>
            <Button type="submit" className="w-full" disabled={isCalculating}>
              {isCalculating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Calculating...</span>
                  <span className="sm:hidden">Calculating</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Calculate Taxes</span>
                  <span className="sm:hidden">Calculate</span>
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
