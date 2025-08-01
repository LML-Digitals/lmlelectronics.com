"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, RefreshCw, DollarSign } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ShippingRate = {
  id: string;
  state: string;
  stateName: string;
  rate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ShippingRateForm = {
  state: string;
  stateName: string;
  rate: number;
  isActive: boolean;
};

export function ShippingManagement() {
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    rate: ShippingRate | null;
  }>({ open: false, rate: null });

  const [formData, setFormData] = useState<ShippingRateForm>({
    state: "",
    stateName: "",
    rate: 5.99,
    isActive: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // Fetch shipping rates
  const fetchShippingRates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterActive !== null)
        params.append("isActive", filterActive.toString());

      const response = await fetch(`/api/shipping?${params}`);
      const data = await response.json();

      if (data.success) {
        setShippingRates(data.shippingRates);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch shipping rates",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shipping rates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize default shipping rates
  const initializeDefaultRates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/shipping?action=initialize");
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Default shipping rates initialized",
        });
        fetchShippingRates();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to initialize default rates",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize default rates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingRate ? "PUT" : "POST";
      const body = editingRate ? { ...formData, id: editingRate.id } : formData;

      const response = await fetch("/api/shipping", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description:
          editingRate
            ? "Shipping rate updated successfully"
            : "Shipping rate created successfully"
        });
        setShowForm(false);
        setEditingRate(null);
        resetForm();
        fetchShippingRates();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save shipping rate",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save shipping rate",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (rate: ShippingRate) => {
    try {
      const response = await fetch(`/api/shipping?id=${rate.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Shipping rate deleted successfully",
        });
        fetchShippingRates();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete shipping rate",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shipping rate",
        variant: "destructive",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      state: "",
      stateName: "",
      rate: 5.99,
      isActive: true,
    });
  };

  // Handle edit
  const handleEdit = (rate: ShippingRate) => {
    setEditingRate(rate);
    setFormData({
      state: rate.state,
      stateName: rate.stateName,
      rate: rate.rate,
      isActive: rate.isActive,
    });
    setShowForm(true);
  };

  // Handle form close
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRate(null);
    resetForm();
  };

  // Filter shipping rates
  const filteredRates = shippingRates.filter((rate) => {
    const matchesSearch =
      searchTerm === "" ||
      rate.stateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === null || rate.isActive === filterActive;

    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const stats = {
    total: shippingRates.length,
    active: shippingRates.filter((rate) => rate.isActive).length,
    inactive: shippingRates.filter((rate) => !rate.isActive).length,
    averageRate:
      shippingRates.length > 0
        ? (
            shippingRates.reduce((sum, rate) => sum + rate.rate, 0) /
            shippingRates.length
          ).toFixed(2)
        : "0.00",
  };

  useEffect(() => {
    fetchShippingRates();
  }, [filterActive]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rates</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rates</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Rates
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.averageRate}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by state name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterActive === null ? "default" : "outline"}
                onClick={() => setFilterActive(null)}
              >
                All
              </Button>
              <Button
                variant={filterActive === true ? "default" : "outline"}
                onClick={() => setFilterActive(true)}
              >
                Active
              </Button>
              <Button
                variant={filterActive === false ? "default" : "outline"}
                onClick={() => setFilterActive(false)}
              >
                Inactive
              </Button>
            </div>
            <Button onClick={() => setShowForm(true)} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Rate
            </Button>
            <Button
              onClick={initializeDefaultRates}
              variant="outline"
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Initialize Default
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No shipping rates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">
                        {rate.stateName}
                      </TableCell>
                      <TableCell>{rate.state}</TableCell>
                      <TableCell>${rate.rate.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={rate.isActive ? "default" : "secondary"}
                        >
                          {rate.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(rate.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(rate)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({ open: true, rate })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRate ? "Edit Shipping Rate" : "Add Shipping Rate"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State Code</Label>
                <Input
                  id="state"
                  placeholder="e.g., CA"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      state: e.target.value.toUpperCase(),
                    })
                  }
                  required
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="stateName">State Name</Label>
                <Input
                  id="stateName"
                  placeholder="e.g., California"
                  value={formData.stateName}
                  onChange={(e) =>
                    setFormData({ ...formData, stateName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="rate">Shipping Rate ($)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="5.99"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rate: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit">{editingRate ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, rate: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the shipping rate for{" "}
              <strong>{deleteDialog.rate?.stateName}</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.rate) {
                  handleDelete(deleteDialog.rate);
                  setDeleteDialog({ open: false, rate: null });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
