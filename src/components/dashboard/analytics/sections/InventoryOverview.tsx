"use client";
import InventoryHeader from "@/components/dashboard/inventory/header/InventoryHeader";
import InventoryOverviewBody from "@/components/dashboard/inventory/overview/InventoryOverviewBody";
import { useSession } from "next-auth/react";
import { useRouter, redirect } from "next/navigation";
import { useEffect } from "react";

function InventoryOverview() {
  return (
    <div>
      <div className="flex flex-col gap-10">
        <InventoryHeader />
        <InventoryOverviewBody />
      </div>
    </div>
  );
}

export default InventoryOverview;
