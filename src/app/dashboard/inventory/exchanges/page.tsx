import { getExchanges } from '@/components/dashboard/inventory/exchanges/services/exchangeCrud';
import ExchangeTable from '@/components/dashboard/inventory/exchanges/ExchangeTable';

async function ExchangesPage () {
  const { data, error } = await getExchanges();

  return (
    <div>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {error ? (
          <p className="text-red-500 text-center mt-10">{error}</p>
        ) : (
          <ExchangeTable exchanges={data} />
        )}
      </div>
    </div>
  );
}

export default ExchangesPage;
