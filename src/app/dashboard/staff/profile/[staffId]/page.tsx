'use client';

import { Note, Staff } from '@prisma/client';
import StaffProfileTabs from '@/components/dashboard/staff/profile/StaffProfileTabs';
import { getStaffNotes } from '@/components/dashboard/staff/services/staffNotes';
import { redirect } from 'next/navigation';

import { CircleDashed } from 'lucide-react';
import {
  getStaff,
  getStaffById,
} from '@/components/dashboard/staff/services/staffCrud';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function StaffProfilePage() {
  const params = useParams();
  const { staffId } = params as { staffId: string };
  const [staff, setStaff] = useState<Staff | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const isAdmin = true;

  useEffect(() => {
    const fetchStaff = async () => {
      const staff = await getStaffById(staffId);
      const { notes } = isAdmin
        ? await getStaffNotes(staffId)
        : { notes: [] as Note[] };
      setStaff(staff);
      setNotes(notes);
    };
    fetchStaff();
  }, [staffId]);

  if (!staff)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircleDashed className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
      <div>
        <StaffProfileTabs staff={staff} isAdmin={isAdmin} />
      </div>
  );
}
