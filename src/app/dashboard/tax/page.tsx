import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/config/authOptions';
import { TaxCategory } from '@prisma/client';
import prisma from '@/lib/prisma';
import TaxRateManager from '@/components/dashboard/tax/components/TaxRateManager';
import TaxCalculator from '@/components/dashboard/tax/components/TaxCalculator';
import TaxReports from '@/components/dashboard/tax/components/TaxReports';
import TaxSummary from '@/components/dashboard/tax/components/TaxSummary';
import { getTaxDueOverview } from '@/components/dashboard/tax/services/taxService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

async function getTaxData () {
  try {
    // Get all tax rates
    const taxRates = await prisma.taxRate.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Get tax due overview
    const taxDueOverview = await getTaxDueOverview();

    return {
      taxRates,
      taxDueOverview: taxDueOverview.success
        ? taxDueOverview
        : {
          monthly: 0,
          quarterly: 0,
          yearly: 0,
        },
    };
  } catch (error) {
    console.error('Error fetching tax data:', error);

    return {
      taxRates: [],
      taxDueOverview: {
        monthly: 0,
        quarterly: 0,
        yearly: 0,
      },
    };
  }
}

export default async function TaxPage () {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { taxRates, taxDueOverview } = await getTaxData();

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Tax Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
            Calculate, track, and manage tax liabilities for accurate reporting
            and compliance
        </p>
      </div>

      {/* Tax Overview Cards - Outside of tabs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-950 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-muted-foreground">
              Monthly Tax Due
          </h3>
          <p className="text-xl sm:text-2xl font-bold mt-2">
              ${taxDueOverview.monthly.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
              Current month taxes
          </p>
        </div>
        <div className="bg-white dark:bg-gray-950 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-muted-foreground">
              Quarterly Tax Due
          </h3>
          <p className="text-xl sm:text-2xl font-bold mt-2">
              ${taxDueOverview.quarterly.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
              Current quarter taxes
          </p>
        </div>
        <div className="bg-white dark:bg-gray-950 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 sm:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-medium text-muted-foreground">
              Yearly Tax Due
          </h3>
          <p className="text-xl sm:text-2xl font-bold mt-2">
              ${taxDueOverview.yearly.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
              Current year taxes
          </p>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="tax-summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 h-auto min-h-[40px] sm:min-h-[36px] p-1">
          <TabsTrigger value="tax-summary" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-2 sm:py-1">Tax Summary</TabsTrigger>
          <TabsTrigger value="tax-rate" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-2 sm:py-1">Tax Rate</TabsTrigger>
          <TabsTrigger value="tax-record" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-2 sm:py-1">Tax Record</TabsTrigger>
          <TabsTrigger value="calculate-rate" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-2 sm:py-1">Calculate Rate</TabsTrigger>
        </TabsList>

        <TabsContent value="tax-summary" className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            <TaxSummary />
          </div>
        </TabsContent>

        <TabsContent value="tax-rate" className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            <TaxRateManager taxRates={taxRates} />
          </div>
        </TabsContent>

        <TabsContent value="tax-record" className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            <TaxReports />
          </div>
        </TabsContent>

        <TabsContent value="calculate-rate" className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            <TaxCalculator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
