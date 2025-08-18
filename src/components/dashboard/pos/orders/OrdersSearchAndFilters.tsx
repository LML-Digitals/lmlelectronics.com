'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function OrdersSearchAndFilters () {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [paymentMethod, setPaymentMethod] = useState(searchParams.get('paymentMethod') || 'all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(searchParams.get('dateFrom')
    ? new Date(searchParams.get('dateFrom')!)
    : undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(searchParams.get('dateTo')
    ? new Date(searchParams.get('dateTo')!)
    : undefined);

  const updateURL = () => {
    const params = new URLSearchParams();

    if (search) { params.set('search', search); }
    if (status && status !== 'all') { params.set('status', status); }
    if (paymentMethod && paymentMethod !== 'all') { params.set('paymentMethod', paymentMethod); }
    if (dateFrom) { params.set('dateFrom', format(dateFrom, 'yyyy-MM-dd')); }
    if (dateTo) { params.set('dateTo', format(dateTo, 'yyyy-MM-dd')); }

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`/dashboard/pos/orders?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setPaymentMethod('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    router.push('/dashboard/pos/orders');
  };

  const hasActiveFilters
    = search
    || (status && status !== 'all')
    || (paymentMethod && paymentMethod !== 'all')
    || dateFrom
    || dateTo;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, email, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateURL()}
            className="pl-10"
          />
        </div>

        {/* Apply Filters Button */}
        <Button onClick={updateURL} className="shrink-0 w-full sm:w-auto">
          Apply Filters
        </Button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="shrink-0 w-full sm:w-auto">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Status Filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="INVOICED">Invoiced</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
            <SelectItem value="PARTIALLY_REFUNDED">
              Partially Refunded
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Payment Method Filter */}
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue placeholder="All Payment Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Methods</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Debit Card">Debit Card</SelectItem>
            <SelectItem value="Check">Check</SelectItem>
            <SelectItem value="Invoice">Invoice</SelectItem>
          </SelectContent>
        </Select>

        {/* Date From Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal w-full',
                !dateFrom && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, 'PPP') : 'From date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal w-full',
                !dateTo && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, 'PPP') : 'To date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
