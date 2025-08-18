import FAQManagement from '@/components/dashboard/faqs/FAQManagement';
import AIEnhancedFAQSubmissions from '@/components/dashboard/faqs/AIEnhancedFAQSubmissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FAQAdminPage () {
  return (
    <div className="p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">FAQ Management</h1>

      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faqs" className="text-xs sm:text-sm">FAQ Entries</TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs sm:text-sm">AI-Enhanced Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs">
          <FAQManagement />
        </TabsContent>

        <TabsContent value="submissions">
          <AIEnhancedFAQSubmissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
