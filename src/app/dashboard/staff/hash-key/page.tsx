import { getAllHashKey } from '@/components/dashboard/staff/services/staffCrud';
import { Session, getServerSession } from 'next-auth';
import { authOptions } from '@/lib/config/authOptions';
import { redirect } from 'next/navigation';
import HashKeyTable from '@/components/dashboard/staff/hash-key/HashKeyTable';

const StaffPage = async () => {
  const staffInSession: Session | null = await getServerSession(authOptions);

  if (!staffInSession) {
    redirect('/');
  }
  let staffs: any = [];
  let error = '';

  try {
    staffs = await getAllHashKey();
  } catch (err) {
    console.error('Error fetching staffs:', err);
    error = 'Check your internet connection.';
  }

  return (
    <div className="flex flex-col justify-center gap-8">
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <HashKeyTable staffs={staffs} />
      )}
    </div>
  );
};

export default StaffPage;
