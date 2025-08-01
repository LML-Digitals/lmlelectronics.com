"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

export function OrdersPagination({
  currentPage,
  totalPages,
  total,
  limit,
}: OrdersPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/dashboard/pos/orders?${params.toString()}`);
  };

  const updateLimit = (newLimit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit);
    params.set("page", "1"); // Reset to first page when changing limit
    router.push(`/dashboard/pos/orders?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Showing {total} of {total} orders
        </p>
      </div>
    );
  }

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Showing {startItem}-{endItem} of {total} orders
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Show:</span>
          <Select value={limit.toString()} onValueChange={updateLimit}>
            <SelectTrigger className="w-16 sm:w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-2 sm:px-3"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {/* Show page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => updatePage(pageNumber)}
                className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 px-2 sm:px-3"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}
