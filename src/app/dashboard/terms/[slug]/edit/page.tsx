import { EditTermsForm } from '@/components/dashboard/terms/EditTermsForm';
import { getTermsBySlug } from '@/components/terms/services/termsCrud';

export default async function EditTermPage ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = await getTermsBySlug(slug);

  if (!term) {
    return <div>Term not found</div>;
  }

  return (
    <div className="p-3 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Edit Term</h2>
      <EditTermsForm term={term} />
    </div>
  );
}
