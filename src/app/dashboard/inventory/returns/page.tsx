import ItemReturnTable from '@/components/dashboard/inventory/returns/ItemReturnTable';
import { fetchReturnedItems } from '@/components/dashboard/inventory/returns/utils/fetchReturnedItems';

async function ReturnsPage () {
  const { returnedItems, error } = await fetchReturnedItems();

  return (
    <div>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {error ? (
          <p className="text-red-500 text-center mt-10">{error}</p>
        ) : (
          <ItemReturnTable returnedItems={returnedItems} />
        )}
      </div>
    </div>
  );
}

export default ReturnsPage;
