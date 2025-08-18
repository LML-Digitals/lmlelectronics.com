'use client';
import { Staff } from '@prisma/client';
import StaffProfileTabs from '@/components/dashboard/staff/profile/StaffProfileTabs';
import { useSession } from 'next-auth/react';
import { CircleDashed } from 'lucide-react';
import { getStaff } from '@/components/dashboard/staff/services/staffCrud';
import { useEffect, useState } from 'react';

function Profile () {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<Staff | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      if (session?.user?.email && session.user.id) {
        const staffData = await getStaff(session.user.email);

        setUser(staffData);

        // Check if user is admin (you can implement your own admin check logic)
        setIsAdmin(session.user.role === 'ADMIN' || session.user.role === 'MANAGER');
      }
    };

    fetchStaff();
  }, [session]);

  if (status === 'loading' && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircleDashed className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <StaffProfileTabs staff={user} isAdmin={isAdmin} />
    </div>
  );
}

export default Profile;
