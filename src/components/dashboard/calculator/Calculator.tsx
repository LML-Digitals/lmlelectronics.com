"use client";
import { useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceSearchModal } from "@/components/price/price-components/PriceSearchModal";
import { PriceItem } from "@/components/price/types/priceTypes";
import { useToast } from "@/components/ui/use-toast";
import { decodeSlug, formatSlug } from "@/utils/formatSlug";

interface BaseItem {
  name?: string;
  option: "Repair" | "Services" | "Products";
  price?: number;
  cost?: number;
  profit: string; // Common field
}

interface RepairItem extends BaseItem {
  option: "Repair";
  raw: string;
  tax: string;
  shipping: string;
  labour: string;
}

interface ServiceItem extends BaseItem {
  option: "Services";
  raw: string; // Represents base service cost
  fee: string;
}

interface ProductItem extends BaseItem {
  option: "Products";
  raw: string;
  tax: string;
  shipping: string;
  markup: string;
}

type CalculatorItem = RepairItem | ServiceItem | ProductItem;

// Type for the currently edited item (can be partial)
type CurrentItemState = Partial<RepairItem> &
  Partial<ServiceItem> &
  Partial<ProductItem> & { name?: string; profit?: string };

// Type for errors, mapping fields to potential error messages
interface Errors {
  raw?: string;
  tax?: string;
  shipping?: string;
  fee?: string;
  markup?: string;
  labour?: string;
  profit?: string; // Added profit validation if needed
}

// Utility function to ensure proper URL formatting
const ensureProperCalculatorUrl = (
  pathname: string,
  itemName: string,
  itemParam: string
): string | null => {
  if (
    pathname &&
    pathname.startsWith("/dashboard/calculator/") &&
    pathname !== "/dashboard/calculator/"
  ) {
    return null;
  }

  if (
    (pathname === "/dashboard/calculator" ||
      pathname === "/dashboard/calculator/") &&
    itemName
  ) {
    const formattedSlug = formatSlug(itemName);
    return `/dashboard/calculator/${formattedSlug}?item=${itemParam}`;
  }

  return null;
};

const Calculator: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<
    "Repair" | "Services" | "Products"
  >("Repair");
  const [items, setItems] = useState<CalculatorItem[]>([]);
  const initialItemState: CurrentItemState = {
    name: "",
    raw: "",
    tax: "",
    shipping: "",
    fee: "",
    markup: "",
    labour: "",
    profit: "",
  };
  const [currentItem, setCurrentItem] =
    useState<CurrentItemState>(initialItemState);
  const [errors, setErrors] = useState<Errors>({});

  // Define calculation functions first
  const calculateCost = (item: CurrentItemState): number => {
    // Use selectedOption to determine the calculation logic
    if (selectedOption === "Services") {
      // ServiceItem uses 'raw' for base service cost
      return parseFloat(item.raw || "0") || 0;
    } else {
      // RepairItem and ProductItem have raw, tax, shipping
      const raw = parseFloat(item.raw || "0") || 0;
      const tax = parseFloat(item.tax || "0") || 0;
      const shipping = parseFloat(item.shipping || "0") || 0;
      return raw + raw * (tax / 100) + shipping;
    }
  };

  const calculatePrice = (item: CurrentItemState): number => {
    const cost = calculateCost(item);
    const profit = parseFloat(item.profit || "0") || 0;

    switch (selectedOption) {
      case "Services":
        // ServiceItem uses fee
        const fee = parseFloat(item.fee || "0") || 0;
        return cost + fee + profit;
      case "Products":
        // ProductItem uses markup
        const markup = parseFloat(item.markup || "0") || 0;
        return cost + (cost * markup) / 100 + profit;
      case "Repair":
        // RepairItem uses labour
        const labour = parseFloat(item.labour || "0") || 0;
        return cost + labour + profit;
      default:
        return 0; // Should not happen with defined types
    }
  };

  // Check for items passed via URL
  useEffect(() => {
    if (!searchParams) return;

    const itemParam = searchParams.get("item");
    if (itemParam) {
      try {
        const parsedItem = JSON.parse(decodeURIComponent(itemParam));
        let itemName = parsedItem.name || "";

        const redirectUrl = ensureProperCalculatorUrl(
          pathname || "",
          itemName,
          itemParam
        );
        if (redirectUrl) {
          router.replace(redirectUrl);
          return;
        }

        if (
          pathname &&
          pathname.startsWith("/dashboard/calculator/") &&
          pathname !== "/dashboard/calculator/"
        ) {
          const slug = pathname.split("/").pop();
          if (slug) {
            itemName = decodeSlug(slug, true);
            parsedItem.name = itemName;
          }
        }

        // Determine the item type and set the selected option
        let itemType: "Repair" | "Services" | "Products" = "Repair"; // Default
        if (parsedItem.type === "repair") {
          itemType = "Repair";
        } else if (parsedItem.type === "product") {
          itemType = "Products";
        } else if (parsedItem.type === "service") {
          itemType = "Services";
        }
        setSelectedOption(itemType);

        // Create a partial item state for calculation
        const partialItem: CurrentItemState = {
          name: itemName,
          raw: parsedItem.raw?.toString() || "0",
          tax: parsedItem.tax?.toString() || "0",
          shipping: parsedItem.shipping?.toString() || "0",
          fee: parsedItem.fee?.toString() || "0",
          markup: parsedItem.markup?.toString() || "0",
          labour: parsedItem.labour?.toString() || "0",
          profit: parsedItem.profit?.toString() || "0",
        };

        // Calculate cost and price based on the determined type
        const calculatedCost = calculateCost(partialItem);
        let calculatedPrice;
        if (parsedItem.price) {
          calculatedPrice = parsedItem.price;
        } else {
          calculatedPrice = calculatePrice(partialItem);
        }

        // Construct the final typed item
        let newItem: CalculatorItem;
        const baseData = {
          name: itemName,
          cost: calculatedCost,
          price: calculatedPrice,
          profit: partialItem.profit || "0",
        };

        switch (itemType) {
          case "Repair":
            newItem = {
              ...baseData,
              option: "Repair",
              raw: partialItem.raw || "0",
              tax: partialItem.tax || "0",
              shipping: partialItem.shipping || "0",
              labour: partialItem.labour || "0",
            };
            break;
          case "Products":
            newItem = {
              ...baseData,
              option: "Products",
              raw: partialItem.raw || "0",
              tax: partialItem.tax || "0",
              shipping: partialItem.shipping || "0",
              markup: partialItem.markup || "0",
            };
            break;
          case "Services":
            newItem = {
              ...baseData,
              option: "Services",
              raw: partialItem.raw || "0", // Base service cost
              fee: partialItem.fee || "0",
            };
            break;
          default: // Should not be reachable
            console.error("Invalid item type detected from URL param");
            throw new Error("Invalid item type");
        }

        setItems((prevItems) => [...prevItems, newItem]);

        toast({
          title: "Item added to calculator",
          description: `${parsedItem.name} has been added to your calculation.`,
          duration: 3000,
        });

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("item");

        if (itemParam) {
          window.history.replaceState({}, "", currentUrl.toString());
        }
      } catch (error) {
        console.error("Error parsing item from URL:", error);
        toast({
          title: "Error adding item",
          description: "Could not add the item to the calculator.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  }, [searchParams, toast, pathname, router, calculateCost, calculatePrice]);

  const validateInputs = (): boolean => {
    const newErrors: Errors = {};
    const { raw, tax, shipping, fee, markup, labour, profit } = currentItem;

    // Common validation (optional, e.g., check if profit is a valid number if entered)
    if (profit && isNaN(parseFloat(profit))) {
      newErrors.profit = "Profit must be a valid number.";
    }

    switch (selectedOption) {
      case "Repair":
        if (!raw) newErrors.raw = "Raw material cost is required.";
        if (raw && isNaN(parseFloat(raw)))
          newErrors.raw = "Raw cost must be a number.";
        if (!tax) newErrors.tax = "Tax percentage is required.";
        if (tax && isNaN(parseFloat(tax)))
          newErrors.tax = "Tax must be a number.";
        if (!shipping) newErrors.shipping = "Shipping cost is required.";
        if (shipping && isNaN(parseFloat(shipping)))
          newErrors.shipping = "Shipping must be a number.";
        if (!labour) newErrors.labour = "Labour cost is required.";
        if (labour && isNaN(parseFloat(labour)))
          newErrors.labour = "Labour must be a number.";
        break;
      case "Products":
        if (!raw) newErrors.raw = "Raw material cost is required.";
        if (raw && isNaN(parseFloat(raw)))
          newErrors.raw = "Raw cost must be a number.";
        if (!tax) newErrors.tax = "Tax percentage is required.";
        if (tax && isNaN(parseFloat(tax)))
          newErrors.tax = "Tax must be a number.";
        if (!shipping) newErrors.shipping = "Shipping cost is required.";
        if (shipping && isNaN(parseFloat(shipping)))
          newErrors.shipping = "Shipping must be a number.";
        if (!markup) newErrors.markup = "Markup percentage is required.";
        if (markup && isNaN(parseFloat(markup)))
          newErrors.markup = "Markup must be a number.";
        break;
      case "Services":
        if (!raw) newErrors.raw = "Base service cost is required."; // Label updated
        if (raw && isNaN(parseFloat(raw)))
          newErrors.raw = "Service cost must be a number.";
        if (!fee) newErrors.fee = "Service fee is required.";
        if (fee && isNaN(parseFloat(fee)))
          newErrors.fee = "Fee must be a number.";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = (): void => {
    if (!validateInputs()) return;

    const cost = calculateCost(currentItem as CurrentItemState);
    const price = calculatePrice(currentItem as CurrentItemState);

    let newItemToAdd: CalculatorItem;

    const baseData = {
      name: currentItem.name || undefined,
      profit: currentItem.profit || "0",
      cost: cost,
      price: price,
    };

    switch (selectedOption) {
      case "Repair":
        newItemToAdd = {
          ...baseData,
          option: "Repair",
          raw: currentItem.raw || "0",
          tax: currentItem.tax || "0",
          shipping: currentItem.shipping || "0",
          labour: currentItem.labour || "0",
        };
        break;
      case "Services":
        newItemToAdd = {
          ...baseData,
          option: "Services",
          raw: currentItem.raw || "0", // Base service cost
          fee: currentItem.fee || "0",
        };
        break;
      case "Products":
        newItemToAdd = {
          ...baseData,
          option: "Products",
          raw: currentItem.raw || "0",
          tax: currentItem.tax || "0",
          shipping: currentItem.shipping || "0",
          markup: currentItem.markup || "0",
        };
        break;
      default: // Should not happen
        console.error("Invalid selected option in addItem");
        return;
    }

    setItems([...items, newItemToAdd]);
    setCurrentItem(initialItemState);
    setErrors({});
  };

  const clearItems = (): void => {
    setItems([]);
  };

  const removeItem = (index: number): void => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const runningTotal = items.reduce((acc, item) => acc + (item.price || 0), 0);

  const handlePriceSelect = (priceItem: PriceItem) => {
    let newItemToAdd: CalculatorItem;
    let itemType: "Repair" | "Services" | "Products";

    const baseData = {
      name: priceItem.name,
      profit: "0", // Default profit to 0, can be adjusted later
      price: priceItem.finalPrice, // Directly use finalPrice from modal
      cost: priceItem.basePrice || 0, // Use basePrice as initial cost estimate
    };

    if (priceItem.type === "repair") {
      itemType = "Repair";
      const raw = priceItem.basePrice?.toString() || "0";
      const tax = "0"; // Assume 0 tax initially
      const shipping = "0"; // Assume 0 shipping initially
      const cost =
        parseFloat(raw) +
        (parseFloat(raw) * parseFloat(tax)) / 100 +
        parseFloat(shipping);
      const labour = Math.max(0, priceItem.finalPrice - cost).toString();

      newItemToAdd = {
        ...baseData,
        option: "Repair",
        raw: raw,
        tax: tax,
        shipping: shipping,
        labour: labour,
        cost: cost, // Recalculate cost based on components
      };
    } else if (priceItem.type === "product") {
      itemType = "Products";
      const raw = priceItem.basePrice?.toString() || "0";
      const tax = priceItem.tax?.toString() || "0"; // Assume 0 tax initially
      const shipping = priceItem.shipping?.toString() || "0"; // Assume 0 shipping initially
      const cost =
        parseFloat(raw) +
        (parseFloat(raw) * parseFloat(tax)) / 100 +
        parseFloat(shipping);
      let markup = "0";
      if (priceItem.basePrice && priceItem.finalPrice > priceItem.basePrice) {
        const markupAmount = priceItem.finalPrice - cost;
        if (cost > 0) {
          markup = ((markupAmount / cost) * 100).toFixed(2);
        } else {
          markup = "0"; // Avoid division by zero
        }
      } else if (priceItem.markup) {
        markup = priceItem.markup.toString();
      }

      newItemToAdd = {
        ...baseData,
        option: "Products",
        raw: raw,
        tax: tax,
        shipping: shipping,
        markup: markup,
        cost: cost, // Recalculate cost based on components
      };
    } else {
      // service
      itemType = "Services";
      const raw = priceItem.basePrice?.toString() || "0"; // Service base cost
      const fee = Math.max(
        0,
        priceItem.finalPrice - (priceItem.basePrice || 0)
      ).toString();
      const cost = parseFloat(raw);

      newItemToAdd = {
        ...baseData,
        option: "Services",
        raw: raw,
        fee: fee,
        cost: cost, // Recalculate cost
      };
    }

    // Set the selected option based on the item type
    setSelectedOption(itemType);

    // Add the item to the list
    setItems([...items, newItemToAdd]);

    // Optional: Toast notification
    toast({
      title: "Item added from Price Search",
      description: `${priceItem.name} (${itemType}) has been added.`,
      duration: 3000,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Price Calculator</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Calculate prices for repairs, services, and products
          </p>
        </div>
        <PriceSearchModal
          onSelectPrice={handlePriceSelect}
          buttonLabel="Search Price"
          buttonVariant="outline"
        />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
          {["Repair", "Services", "Products"].map((option) => (
            <Button
              key={option}
              onClick={() => {
                setSelectedOption(option as "Repair" | "Services" | "Products");
                setCurrentItem(initialItemState);
                setErrors({});
              }}
              variant={selectedOption === option ? "default" : "outline"}
              className="flex-1 min-h-[44px] text-sm sm:text-base"
            >
              {option}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 sm:gap-6 p-4 sm:p-6 border rounded-lg bg-card">
          <div className="grid gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm sm:text-base">Item Name</Label>
                <Input
                  id="name"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                  placeholder="Enter item name"
                  className="mt-1.5 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                  Optional: Add a name to identify this item
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="raw" className="text-sm sm:text-base">
                    {selectedOption === "Services" ? "Base Service Cost" : "Raw Material Cost"}
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">$</span>
                    <Input
                      id="raw"
                      type="number"
                      value={currentItem.raw}
                      onChange={(e) =>
                        setCurrentItem({ ...currentItem, raw: e.target.value })
                      }
                      placeholder="0.00"
                      className={`pl-7 text-sm sm:text-base ${errors.raw ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.raw && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1.5">{errors.raw}</p>
                  )}
                </div>

                {selectedOption !== "Services" && (
                  <>
                    <div>
                      <Label htmlFor="tax" className="text-sm sm:text-base">Tax Percentage</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="tax"
                          type="number"
                          value={currentItem.tax}
                          onChange={(e) =>
                            setCurrentItem({ ...currentItem, tax: e.target.value })
                          }
                          placeholder="0"
                          className={`pr-7 text-sm sm:text-base ${errors.tax ? "border-red-500" : ""}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">%</span>
                      </div>
                      {errors.tax && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1.5">{errors.tax}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="shipping" className="text-sm sm:text-base">Shipping Cost</Label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">$</span>
                        <Input
                          id="shipping"
                          type="number"
                          value={currentItem.shipping}
                          onChange={(e) =>
                            setCurrentItem({ ...currentItem, shipping: e.target.value })
                          }
                          placeholder="0.00"
                          className={`pl-7 text-sm sm:text-base ${errors.shipping ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.shipping && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1.5">{errors.shipping}</p>
                      )}
                    </div>
                  </>
                )}

                {selectedOption === "Services" && (
                  <div>
                    <Label htmlFor="fee" className="text-sm sm:text-base">Service Fee</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">$</span>
                      <Input
                        id="fee"
                        type="number"
                        value={currentItem.fee}
                        onChange={(e) =>
                          setCurrentItem({ ...currentItem, fee: e.target.value })
                        }
                        placeholder="0.00"
                        className={`pl-7 text-sm sm:text-base ${errors.fee ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.fee && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1.5">{errors.fee}</p>
                    )}
                  </div>
                )}

                {selectedOption === "Products" && (
                  <div>
                    <Label htmlFor="markup" className="text-sm sm:text-base">Markup Percentage</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="markup"
                        type="number"
                        value={currentItem.markup}
                        onChange={(e) =>
                          setCurrentItem({ ...currentItem, markup: e.target.value })
                        }
                        placeholder="0"
                        className={`pr-7 text-sm sm:text-base ${errors.markup ? "border-red-500" : ""}`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">%</span>
                    </div>
                    {errors.markup && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1.5">{errors.markup}</p>
                    )}
                  </div>
                )}

                {selectedOption === "Repair" && (
                  <div>
                    <Label htmlFor="labour" className="text-sm sm:text-base">Labour Cost</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">$</span>
                      <Input
                        id="labour"
                        type="number"
                        value={currentItem.labour}
                        onChange={(e) =>
                          setCurrentItem({ ...currentItem, labour: e.target.value })
                        }
                        placeholder="0.00"
                        className={`pl-7 text-sm sm:text-base ${errors.labour ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.labour && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1.5">{errors.labour}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="profit" className="text-sm sm:text-base">Additional Profit</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">$</span>
                    <Input
                      id="profit"
                      type="number"
                      value={currentItem.profit}
                      onChange={(e) =>
                        setCurrentItem({ ...currentItem, profit: e.target.value })
                      }
                      placeholder="0.00"
                      className="pl-7 text-sm sm:text-base"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                    Optional: Add any additional profit amount
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Button onClick={addItem} className="w-full min-h-[44px] text-sm sm:text-base">
                Add Item
              </Button>
              <Button
                onClick={clearItems}
                variant="destructive"
                className="w-full min-h-[44px] text-sm sm:text-base"
              >
                Clear All Items
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Items</h2>
            {items.length > 0 && (
              <span className="text-xs sm:text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'} added
              </span>
            )}
          </div>
          {items.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col p-4 sm:p-5 border rounded-lg bg-card hover:bg-accent/50 transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-semibold text-base sm:text-lg truncate">
                        {item.name || `Item ${index + 1}`}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary flex-shrink-0">
                        {item.option}
                      </span>
                    </div>
                    <Button
                      onClick={() => removeItem(index)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground min-h-[44px] min-w-[44px] flex-shrink-0"
                    >
                      ×
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    {/* Service Item Details */}
                    {item.option === "Services" && (
                      <>
                        {((item) => (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Base Cost</span>
                              <span className="font-medium">${Number.parseFloat((item as ServiceItem).raw).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Fee</span>
                              <span className="font-medium">${Number.parseFloat((item as ServiceItem).fee).toFixed(2)}</span>
                            </div>
                            {Number.parseFloat(item.profit) > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Profit</span>
                                <span className="font-medium">${Number.parseFloat(item.profit).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-2 mt-2 border-t">
                              <span className="font-semibold text-foreground">Final Price</span>
                              <span className="font-bold text-lg text-primary">${item.price?.toFixed(2)}</span>
                            </div>
                          </div>
                        ))(item)}
                      </>
                    )}

                    {/* Product Item Details */}
                    {item.option === "Products" && (
                      <>
                        {((item) => (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Raw Cost</span>
                              <span className="font-medium">${Number.parseFloat((item as ProductItem).raw).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Tax</span>
                              <span className="font-medium">
                                ${((Number.parseFloat((item as ProductItem).raw) * Number.parseFloat((item as ProductItem).tax)) / 100).toFixed(2)}
                                <span className="text-xs ml-1 text-muted-foreground">({(item as ProductItem).tax}%)</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Shipping</span>
                              <span className="font-medium">${Number.parseFloat((item as ProductItem).shipping).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-2 border-t">
                              <span className="text-muted-foreground">Subtotal (Cost)</span>
                              <span className="font-medium">${item.cost?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Markup</span>
                              <span className="font-medium">
                                ${((Number.parseFloat((item as ProductItem).raw) * Number.parseFloat((item as ProductItem).markup)) / 100).toFixed(2)}
                                <span className="text-xs ml-1 text-muted-foreground">({(item as ProductItem).markup}%)</span>
                              </span>
                            </div>
                            {Number.parseFloat(item.profit) > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Profit</span>
                                <span className="font-medium">${Number.parseFloat(item.profit).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-2 mt-2 border-t">
                              <span className="font-semibold text-foreground">Final Price</span>
                              <span className="font-bold text-lg text-primary">${item.price?.toFixed(2)}</span>
                            </div>
                          </div>
                        ))(item)}
                      </>
                    )}

                    {/* Repair Item Details */}
                    {item.option === "Repair" && (
                      <>
                        {((item) => (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Raw Cost</span>
                              <span className="font-medium">${Number.parseFloat((item as RepairItem).raw).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Tax</span>
                              <span className="font-medium">
                                ${((Number.parseFloat((item as RepairItem).raw) * Number.parseFloat((item as RepairItem).tax)) / 100).toFixed(2)}
                                <span className="text-xs ml-1 text-muted-foreground">({(item as RepairItem).tax}%)</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Shipping</span>
                              <span className="font-medium">${Number.parseFloat((item as RepairItem).shipping).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-2 border-t">
                              <span className="text-muted-foreground">Subtotal (Cost)</span>
                              <span className="font-medium">${item.cost?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Labour</span>
                              <span className="font-medium">${Number.parseFloat((item as RepairItem).labour).toFixed(2)}</span>
                            </div>
                            {Number.parseFloat(item.profit) > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Profit</span>
                                <span className="font-medium">${Number.parseFloat(item.profit).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-2 mt-2 border-t">
                              <span className="font-semibold text-foreground">Final Price</span>
                              <span className="font-bold text-lg text-primary">${item.price?.toFixed(2)}</span>
                            </div>
                          </div>
                        ))(item)}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4 border rounded-lg bg-muted/50">
              <p className="text-sm sm:text-base text-muted-foreground">No items added yet.</p>
              <p className="text-xs sm:text-sm mt-2 text-muted-foreground/80">
                Add items using the form above or search for existing prices.
              </p>
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-6 p-4 sm:p-6 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-primary">
                  Running Total
                </h2>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  ${runningTotal.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Calculator;
