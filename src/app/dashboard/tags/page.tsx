import { Metadata } from "next";
import { Tag, Plus } from "lucide-react";
import TagTable from "@/components/dashboard/Tags/TagTable";
import { Button } from "@/components/ui/button";

export default function TagsPage() {
  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold">Tags Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Create and manage tags for organizing content across the system.
          </p>
        </div>

        <Button className="w-full sm:w-auto min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" /> Create Tag
        </Button>
      </div>

      <TagTable />
    </div>
  );
}
