"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getAllWarrantyClaims,
  updateWarrantyClaim,
} from "@/components/dashboard/warranty/services/warrantyCrud";
import { WarrantyClaimProps } from "@/components/dashboard/warranty/types/types";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

export default function WarrantyClaimsPage() {
  const [claims, setClaims] = useState<WarrantyClaimProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaimProps | null>(
    null
  );
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [claimStatus, setClaimStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const filterStatus = statusFilter !== "all" ? statusFilter : undefined;
      const data = await getAllWarrantyClaims(filterStatus);
      setClaims(data);
    } catch (error) {
      console.error("Failed to fetch warranty claims:", error);
      toast({
        title: "Error",
        description: "Failed to load warranty claims. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClaimStatus = async () => {
    if (!selectedClaim) return;

    try {
      await updateWarrantyClaim(selectedClaim.id, {
        status: claimStatus,
        resolution: resolution,
      });
      toast({
        title: "Success",
        description: `Claim ${claimStatus.toLowerCase()} successfully`,
      });
      fetchClaims();
      setIsDetailsDialogOpen(false);
    } catch (error) {
      console.error("Failed to update claim status:", error);
      toast({
        title: "Error",
        description: "Failed to update claim status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredClaims = claims.filter(
    (claim) =>
      claim.customer?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      claim.customer?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.issueType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClaimStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100">
            Approved
          </Badge>
        );
      case "denied":
        return <Badge variant="destructive">Denied</Badge>;
      case "in review":
        return (
          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
            In Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warranty Claims</h1>
          <p className="text-muted-foreground">
            Manage and respond to customer warranty claims
          </p>
        </div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setStatusFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="In Review">In Review</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Denied">Denied</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search claims..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading warranty claims...</p>
            </div>
          ) : (
            <>
              {claims.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">
                    No warranty claims found
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {statusFilter !== "all"
                      ? `There are no ${statusFilter.toLowerCase()} claims at this time.`
                      : "Customers can submit warranty claims for their purchased products."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Issue Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Warranty Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No claims found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell>
                            {format(new Date(claim.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {claim.customer
                              ? `${claim.customer.firstName} ${claim.customer.lastName}`
                              : "Unknown Customer"}
                          </TableCell>
                          <TableCell>
                            {claim.warranty?.inventoryItem?.name ||
                              "Unknown Product"}
                          </TableCell>
                          <TableCell>{claim.issueType}</TableCell>
                          <TableCell>
                            {getClaimStatusBadge(claim.status)}
                          </TableCell>
                          <TableCell>
                            {claim.warranty?.warrantyType.name || "Standard"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setResolution(claim.resolution || "");
                                setClaimStatus(claim.status);
                                setIsDetailsDialogOpen(true);
                              }}
                              className="flex items-center gap-1"
                            >
                              {claim.status.toLowerCase() === "pending" ? (
                                <>
                                  <Clock className="h-4 w-4" />
                                  <span>Respond</span>
                                </>
                              ) : (
                                <>
                                  <FileText className="h-4 w-4" />
                                  <span>View</span>
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Claim details/response dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-lg h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedClaim?.status.toLowerCase() === "pending"
                ? "Respond to Warranty Claim"
                : "Warranty Claim Details"}
            </DialogTitle>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Customer
                  </Label>
                  <p className="font-medium">
                    {selectedClaim.customer
                      ? `${selectedClaim.customer.firstName} ${selectedClaim.customer.lastName}`
                      : "Unknown Customer"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Submitted On
                  </Label>
                  <p className="font-medium">
                    {format(new Date(selectedClaim.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Issue Type
                </Label>
                <p className="font-medium">{selectedClaim.issueType}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Description
                </Label>
                <p className="bg-muted p-3 rounded-md text-sm mt-1">
                  {selectedClaim.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={claimStatus}
                  onValueChange={setClaimStatus}
                  // disabled={selectedClaim.status.toLowerCase() !== "pending"}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Denied">Denied</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution / Notes</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResolution(e.target.value)}
                  placeholder="Enter resolution details or notes about this claim..."
                  rows={4}
                />
              </div>

              {selectedClaim.status.toLowerCase() !== "pending" &&
                selectedClaim.resolution && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Resolution Notes
                    </Label>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      {selectedClaim.resolution}
                    </div>
                  </div>
                )}

              {selectedClaim.warranty && (
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Warranty Information
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Type
                      </Label>
                      <p className="font-medium">
                        {selectedClaim.warranty.warrantyType.name}
                      </p>
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/warranty/${selectedClaim.warranty.id}`}
                      >
                        <Button size={"sm"} variant={"outline"}>View Warranty</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <>
              <Button
                variant="outline"
                onClick={() => setIsDetailsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateClaimStatus}>Submit Response</Button>
            </>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
