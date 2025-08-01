"use client";

import { Staff } from "@prisma/client";
import { CircleDashed } from "lucide-react";
import {
  getStaff,
  getStaffById,
} from "@/components/dashboard/staff/services/staffCrud";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function Security() {
  const [user, setUser] = useState<Staff | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchStaff = async () => {
      if (session?.user?.id) {
        const staffData = await getStaffById(session.user.id);
        setUser(staffData);
      }
    };

    fetchStaff();
  }, [session?.user?.id]);

  return (
    <div>
      {/* <Setup2FA staff={user} settings={true} /> */}
    </div>
  );
}

export default Security;
