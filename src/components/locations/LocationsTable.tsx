"use client";

import {
  AlertCircle,
  MapPin,
  Search,
  Trash2,
  Loader2,
  CreditCard,
  Filter,
} from "lucide-react";
import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { StoreLocation } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { CreateLocationDialog } from "./CreateLocationDialog";
import { EditLocationDialog } from "./EditLocationDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteStoreLocation } from "./services/storeLocationCrud";

type LocationsTableProps = {
  locations: StoreLocation[];
};

export default function LocationsTable({ locations }: LocationsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [locationToDelete, setLocationToDelete] = useState<number | null>(null);
  const [isMapLoading, setIsMapLoading] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearch(inputValue);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const filteredLocations = locations.filter((location) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      location.name.toLowerCase().includes(searchTerm) ||
      location.address?.toLowerCase().includes(searchTerm) ||
      location.streetAddress?.toLowerCase().includes(searchTerm) ||
      location.city?.toLowerCase().includes(searchTerm) ||
      location.state?.toLowerCase().includes(searchTerm) ||
      location.zip?.toLowerCase().includes(searchTerm) ||
      location.countryCode?.toLowerCase().includes(searchTerm) ||
      location.phone?.toLowerCase().includes(searchTerm) ||
      location.email?.toLowerCase().includes(searchTerm) ||
      location.squareLocationEnvKey?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && location.isActive) ||
      (statusFilter === "inactive" && !location.isActive);

    return matchesSearch && matchesStatus;
  });

  // Calculate counts for filter options
  const activeLocationsCount = locations.filter((location) => location.isActive).length;
  const inactiveLocationsCount = locations.filter((location) => !location.isActive).length;
  const totalLocationsCount = locations.length;

  const handleDeleteLocation = async (id: number) => {
    startTransition(async () => {
      try {
        const response = await deleteStoreLocation(id);

        toast({
          title: "Success",
          description: "Location deleted successfully",
        });
        window.location.reload();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete location",
          variant: "destructive",
        });
      } finally {
        setLocationToDelete(null);
      }
    });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Helper function to get Square location display
  const getSquareLocationDisplay = (location: StoreLocation) => {
    if (!location.squareLocationEnvKey) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Not configured</span>
        </div>
      );
    }

    const envValue =
      process.env[location.squareLocationEnvKey as keyof NodeJS.ProcessEnv];
    const friendlyNames: Record<string, string> = {
      SQUARE_WEST_SEATTLE_LOCATION_ID: "West Seattle",
      SQUARE_SEATTLE_LOCATION_ID: "Seattle",
      SQUARE_NORTH_SEATTLE_LOCATION_ID: "North Seattle",
      SQUARE_LOCATION_ID: "Default Location",
    };

    const friendlyName =
      friendlyNames[location.squareLocationEnvKey] ||
      location.squareLocationEnvKey;

    return (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-green-600" />
        <div>
          <p className="text-xs sm:text-sm font-medium">{friendlyName}</p>
          <p className="text-xs text-muted-foreground">
            {location.squareLocationEnvKey}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl px-2 mb-4">Store Locations</h1>
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 w-full sm:w-auto">
              <Search className="text-muted-foreground w-4 h-4 mr-3 flex-shrink-0" />
              <Input
                placeholder="Search locations by name, address, phone, email..."
                className="w-full border-none focus-visible:outline-none focus-visible:ring-0 text-sm sm:text-base bg-transparent placeholder:text-muted-foreground"
                value={search}
                onChange={handleInputChange}
                disabled={isPending}
              />
            </div>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
              <Filter className="text-muted-foreground w-4 h-4 mr-2 flex-shrink-0" />
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-full sm:w-[140px] border-none focus-visible:outline-none focus-visible:ring-0 text-sm sm:text-base bg-transparent">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All ({totalLocationsCount})
                  </SelectItem>
                  <SelectItem value="active">
                    Active ({activeLocationsCount})
                  </SelectItem>
                  <SelectItem value="inactive">
                    Inactive ({inactiveLocationsCount})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreateLocationDialog onSuccess={handleRefresh} />
          </div>
        </div>
      </Card>
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Name</TableHead>
                <TableHead className="text-xs sm:text-sm">Address</TableHead>
                <TableHead className="text-xs sm:text-sm">Contact</TableHead>
                <TableHead className="text-xs sm:text-sm">Square Integration</TableHead>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-xs sm:text-sm">Created</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-medium">No locations found</p>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                          {locations.length === 0
                            ? "Start by adding your first location"
                            : "No results matching your search and filters"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location) => (
                  <TableRow key={location.id} className={!location.isActive ? "opacity-75 bg-muted/30" : ""}>
                    <TableCell className="text-xs sm:text-sm font-medium">{location.name}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {location.streetAddress ? (
                        <>
                          <p>{location.streetAddress}</p>
                          <p className="text-xs text-muted-foreground">
                            {location.city}
                            {location.state ? `, ${location.state}` : ""}{" "}
                            {location.zip}
                            {location.countryCode && ` (${location.countryCode})`}
                          </p>
                        </>
                      ) : (
                        location.address
                      )}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <div>
                        <p>{location.phone}</p>
                        <p className="text-xs text-muted-foreground">
                          {location.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getSquareLocationDisplay(location)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={location.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {location.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(location.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2 sm:gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setIsMapLoading(location.id.toString());
                            window.open(
                              `https://maps.google.com/maps?q=${encodeURIComponent(
                                location.address!
                              )}`,
                              "_blank"
                            );
                            setTimeout(() => setIsMapLoading(null), 1000);
                          }}
                          disabled={isMapLoading === location.id.toString()}
                          className="h-8 w-8 sm:h-10 sm:w-10 min-h-[44px] min-w-[44px]"
                        >
                          {isMapLoading === location.id.toString() ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          ) : (
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </Button>
                        <EditLocationDialog
                          location={location}
                          onSuccess={handleRefresh}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLocationToDelete(location.id)}
                          disabled={isPending}
                          className="h-8 w-8 sm:h-10 sm:w-10 min-h-[44px] min-w-[44px]"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog
        open={!!locationToDelete}
        onOpenChange={() => setLocationToDelete(null)}
      >
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the
              location and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isPending} className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                locationToDelete && handleDeleteLocation(locationToDelete)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
