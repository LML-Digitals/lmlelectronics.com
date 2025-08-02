"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Search,
  Calculator,
  TrendingUp,
  Clock,
  Copy,
  CheckCircle,
} from "lucide-react";
import { PriceItem } from "@/components/price/types/priceTypes";
import { useToast } from "@/components/ui/use-toast";
import { PriceSearchGlobal } from "@/components/price/price-components/PriceSearchGlobal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDeviceHierarchy } from "@/components/booking/services/bookingCrud";

export default function PriceCheckerPage() {
  const { toast } = useToast();
  const [allDeviceData, setAllDeviceData] = useState<any[]>([]);
  const [isLoadingAllData, setIsLoadingAllData] = useState(true);

  // State for selections
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);

  // Fetch all device hierarchy data on mount
  useEffect(() => {
    async function fetchAllData() {
      setIsLoadingAllData(true);
      try {
        const hierarchy = await getDeviceHierarchy();
        setAllDeviceData(hierarchy);
      } catch (error) {
        console.error("Error fetching device hierarchy:", error);
        toast({
          title: "Error",
          description: "Failed to load device options. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAllData(false);
      }
    }
    fetchAllData();
  }, [toast]);

  // Derived lists based on selections and allDeviceData
  const derivedDeviceTypes = useMemo(() => allDeviceData, [allDeviceData]);

  const derivedBrands = useMemo(() => {
    if (!selectedDeviceType || !allDeviceData) return [];
    const selectedType = allDeviceData.find(
      (dt: any) => dt.id === selectedDeviceType
    );
    return selectedType?.brands || [];
  }, [selectedDeviceType, allDeviceData]);

  const derivedSeries = useMemo(() => {
    if (!selectedBrand || derivedBrands.length === 0) return [];
    const selectedBrandObj = derivedBrands.find(
      (b: any) => b.id === selectedBrand
    );
    return selectedBrandObj?.series || [];
  }, [selectedBrand, derivedBrands]);

  const derivedModels = useMemo(() => {
    if (!selectedSeries || derivedSeries.length === 0) return [];
    const selectedSeriesObj = derivedSeries.find(
      (s: any) => s.id === selectedSeries
    );
    return selectedSeriesObj?.models || [];
  }, [selectedSeries, derivedSeries]);

  const derivedRepairOptions = useMemo(() => {
    if (!selectedModel || derivedModels.length === 0) return [];
    const selectedModelObj = derivedModels.find(
      (m: any) => m.id === selectedModel
    );
    return selectedModelObj?.repairOptions || [];
  }, [selectedModel, derivedModels]);

  // Handlers
  const handleDeviceTypeSelect = (deviceTypeId: string) => {
    setSelectedDeviceType(deviceTypeId);
    setSelectedBrand(null);
    setSelectedSeries(null);
    setSelectedModel(null);
  };

  const handleBrandSelect = (brandIdString: string) => {
    const brandId = parseInt(brandIdString, 10);
    setSelectedBrand(brandId);
    setSelectedSeries(null);
    setSelectedModel(null);
  };

  const handleSeriesSelect = (seriesIdString: string) => {
    const seriesId = parseInt(seriesIdString, 10);
    setSelectedSeries(seriesId);
    setSelectedModel(null);
  };

  const handleModelSelect = (modelIdString: string) => {
    const modelId = parseInt(modelIdString, 10);
    setSelectedModel(modelId);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto mb-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Repair Price Checker
      </h1>
      <p className="text-muted-foreground mb-4">
        Find repair prices by selecting device type, brand, series, and model.
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Device Type</label>
          <select
            className="w-full border rounded p-2"
            value={selectedDeviceType}
            onChange={(e) => handleDeviceTypeSelect(e.target.value)}
            disabled={isLoadingAllData || derivedDeviceTypes.length === 0}
          >
            <option value="">Select Device Type</option>
            {derivedDeviceTypes.map((dt: any) => (
              <option key={dt.id} value={dt.id}>
                {dt.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select
            className="w-full border rounded p-2"
            value={selectedBrand?.toString() || ""}
            onChange={(e) => handleBrandSelect(e.target.value)}
            disabled={!derivedBrands.length}
          >
            <option value="">Select Brand</option>
            {derivedBrands.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Series</label>
          <select
            className="w-full border rounded p-2"
            value={selectedSeries?.toString() || ""}
            onChange={(e) => handleSeriesSelect(e.target.value)}
            disabled={!derivedSeries.length}
          >
            <option value="">Select Series</option>
            {derivedSeries.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            className="w-full border rounded p-2"
            value={selectedModel?.toString() || ""}
            onChange={(e) => handleModelSelect(e.target.value)}
            disabled={!derivedModels.length}
          >
            <option value="">Select Model</option>
            {derivedModels.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {derivedRepairOptions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Repair Options & Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">
                      Repair
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {derivedRepairOptions.map((opt: any, idx: number) => (
                    <tr
                      key={opt.id}
                      className={`transition-colors ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"} hover:bg-yellow-50 dark:hover:bg-yellow-900`}
                    >
                      <td className="py-3 px-4 text-black dark:text-gray-100">
                        {opt.name}
                      </td>
                      <td className="py-3 px-4 font-bold text-black dark:text-gray-100">
                        $
                        {opt.price
                          ? opt.price.toFixed(2)
                          : opt.variation?.price
                            ? opt.variation.price.toFixed(2)
                            : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
