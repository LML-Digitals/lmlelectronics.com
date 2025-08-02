import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTermsForm } from '@/components/dashboard/terms/CreateTermsForm';

export default function CreateTermsPage() {
  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Create New Terms</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Enter Terms Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTermsForm />
        </CardContent>
      </Card>
    </div>
  );
}