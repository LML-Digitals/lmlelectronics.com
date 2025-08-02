"use client";

import React from "react";
import WarrantyTable from "@/components/dashboard/warranty/WarrantyTable";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function WarrantyPage() {
  return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <WarrantyTable />
      </div>
  );
}
