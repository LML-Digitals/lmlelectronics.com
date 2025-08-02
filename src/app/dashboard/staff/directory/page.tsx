import { getStaffs } from "@/components/dashboard/staff/services/staffCrud";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/lib/config/authOptions";
import { redirect } from "next/navigation";
import StaffTable from "@/components/dashboard/staff/directory/StaffTable";

const StaffPage = async () => {
  const staffInSession: Session | null = await getServerSession(authOptions);
  if (!staffInSession) {
    redirect("/");
  }
  let staffs: any = [];
  let error = "";

  try {
    staffs = await getStaffs();
  } catch (err) {
    console.error("Error fetching staffs:", err);
    error = "Check your internet connection.";
  }
  return (
    <div className="flex flex-col justify-center gap-4 sm:gap-6 lg:gap-8">
      {error ? (
        <p className="text-red-500 text-center text-sm sm:text-base">{error}</p>
      ) : (
        <StaffTable staffs={staffs} />
      )}
    </div>
  );
};

export default StaffPage;
