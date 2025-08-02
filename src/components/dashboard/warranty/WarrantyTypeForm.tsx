"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  createWarrantyType,
  updateWarrantyType,
} from "./services/warrantyTypeService";
import { WarrantyTypeProps, WarrantyCoverage } from "./types/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

interface WarrantyTypeFormProps {
  warrantyType?: WarrantyTypeProps;
  onSuccess?: () => void;
}

const COVERAGE_OPTIONS = [
  { id: "defects", label: "Manufacturing Defects" },
  { id: "parts", label: "Replacement Parts" },
  { id: "labor", label: "Labor" },
  { id: "accidental", label: "Accidental Damage" },
  { id: "water", label: "Water/Liquid Damage" },
  { id: "priority", label: "Priority Support" },
  { id: "replacements", label: "Full Replacements" },
];

const DEFAULT_COVERAGE: WarrantyCoverage = {
  defects: true,
  parts: true,
  labor: true,
  accidental: false,
  water: false,
  priority: false,
  replacements: false,
};

export function WarrantyTypeForm({
  warrantyType,
  onSuccess,
}: WarrantyTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse the coverage from the warranty type if it exists
  const initialCoverage = (): WarrantyCoverage => {
    if (warrantyType?.coverage) {
      // If the coverage is a JSON string, parse it
      if (typeof warrantyType.coverage === "string") {
        try {
          return JSON.parse(warrantyType.coverage);
        } catch (e) {
          console.error("Error parsing coverage JSON:", e);
          return DEFAULT_COVERAGE;
        }
      }

      // If it's already an object but might be missing fields, ensure all fields exist
      const coverage = warrantyType.coverage as any;
      return {
        defects: !!coverage.defects,
        parts: !!coverage.parts,
        labor: !!coverage.labor,
        accidental: !!coverage.accidental,
        water: !!coverage.water,
        priority: !!coverage.priority,
        replacements: !!coverage.replacements,
      };
    }

    return DEFAULT_COVERAGE;
  };

  const [formData, setFormData] = useState({
    name: warrantyType?.name || "",
    description: warrantyType?.description || "",
    duration: warrantyType?.duration !== undefined ? warrantyType.duration : 12, // Default to 12 months
    coverage: initialCoverage(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }

      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }

      if (formData.duration < 0) {
        throw new Error(
          "Duration must be a positive number or zero for lifetime warranties"
        );
      }

      // Ensure we have a valid coverage object with all options explicitly set
      const coverage: WarrantyCoverage = {
        defects: !!formData.coverage.defects,
        parts: !!formData.coverage.parts,
        labor: !!formData.coverage.labor,
        accidental: !!formData.coverage.accidental,
        water: !!formData.coverage.water,
        priority: !!formData.coverage.priority,
        replacements: !!formData.coverage.replacements,
      };

      // Prepare the data to send to the API
      const warrantyTypeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        duration: formData.duration,
        coverage: coverage,
      };

      console.log(
        "Submitting data:",
        JSON.stringify(warrantyTypeData, null, 2)
      );

      // Create or update the warranty type
      if (warrantyType) {
        await updateWarrantyType(warrantyType.id, warrantyTypeData);
        toast({
          title: "Success",
          description: "Warranty type updated successfully",
        });
      } else {
        await createWarrantyType(warrantyTypeData);
        toast({
          title: "Success",
          description: "Warranty type created successfully",
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving warranty type:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save warranty type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Convert duration to number
    if (name === "duration") {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCoverageChange = (id: string, checked: boolean) => {
    setFormData({
      ...formData,
      coverage: {
        ...formData.coverage,
        [id]: checked,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Standard Warranty, Premium Warranty"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe what this warranty covers and any terms"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="duration">
            Duration (months) - Use 0 for Lifetime
          </Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="0"
            placeholder="12"
            value={formData.duration}
            onChange={handleInputChange}
            required
          />
          <p className="text-sm text-muted-foreground">
            {formData.duration === 0
              ? "Lifetime warranty with no expiration"
              : formData.duration === 1
              ? "1 month duration"
              : formData.duration < 12
              ? `${formData.duration} months duration`
              : formData.duration === 12
              ? "1 year duration"
              : formData.duration % 12 === 0
              ? `${formData.duration / 12} years duration`
              : `${Math.floor(formData.duration / 12)} years and ${
                  formData.duration % 12
                } months duration`}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="coverage">
            <AccordionTrigger>Coverage Details</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {COVERAGE_OPTIONS.map((option) => (
                  <div className="flex items-center space-x-2" key={option.id}>
                    <Checkbox
                      id={option.id}
                      checked={
                        formData.coverage[
                          option.id as keyof WarrantyCoverage
                        ] ?? false
                      }
                      onCheckedChange={(checked) =>
                        handleCoverageChange(option.id, checked === true)
                      }
                    />
                    <Label
                      htmlFor={option.id}
                      className="text-sm font-medium leading-none"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Coverage details will be displayed on the warranty certificate
                  and when customers create warranty claims.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
              {warrantyType ? "Updating..." : "Creating..."}
            </>
          ) : warrantyType ? (
            "Update Warranty Type"
          ) : (
            "Create Warranty Type"
          )}
        </Button>
      </div>
    </form>
  );
}
