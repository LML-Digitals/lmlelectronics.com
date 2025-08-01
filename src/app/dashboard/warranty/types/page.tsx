"use client";

import React, { useState } from "react";
import WarrantyTypeTable from "@/components/dashboard/warranty/WarrantyTypeTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HelpCircle, Settings, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { seedWarrantyTypes } from "@/components/dashboard/warranty/services/warrantyTypeService";
import { toast } from "@/components/ui/use-toast";

export default function WarrantyTypesPage() {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedTypes = async () => {
    setIsSeeding(true);
    try {
      const result = await seedWarrantyTypes();
      if (result.success) {
        toast({
          title: result.wasSeeded ? "Success" : "Info",
          description: result.message,
        });
        // Refresh the page to show the new types
        if (result.wasSeeded) {
          window.location.reload();
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error seeding warranty types:", error);
      toast({
        title: "Error",
        description: "Failed to seed warranty types. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warranty Types</h1>
          <p className="text-muted-foreground">
            Manage warranty types that can be applied to products.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleSeedTypes}
            disabled={isSeeding}
            className="flex items-center gap-2"
          >
            {isSeeding ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                <span>Seeding...</span>
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                <span>Seed Default Types</span>
              </>
            )}
          </Button>

          <Link href="/dashboard/warranty">
            <Button>Back to Warranties</Button>
          </Link>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="warranty-types">
        <TabsList>
          <TabsTrigger value="warranty-types">Warranty Types</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>
        <TabsContent value="warranty-types" className="space-y-4">
          <WarrantyTypeTable />
        </TabsContent>
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5" />
                Help with Warranty Types
              </CardTitle>
              <CardDescription>
                Learn how to create and manage warranty types
              </CardDescription>
            </CardHeader>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">What are warranty types?</h3>
                  <p className="text-sm text-muted-foreground">
                    Warranty types define the different kinds of warranties your
                    business offers. Each type has a name, description, and a
                    duration in months. Setting up warranty types allows you to
                    easily apply consistent warranty terms to products.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Creating warranty types</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the &quot;Add Warranty Type&quot; button to create a
                    new warranty type. Specify a name, description, and
                    duration. For lifetime warranties, set the duration to 0.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Applying warranty types</h3>
                  <p className="text-sm text-muted-foreground">
                    When creating a warranty for a customer&apos;s product, you
                    can select one of these warranty types. The system will
                    automatically calculate the end date based on the warranty
                    type&apos;s duration.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">
                    Adding default warranty types
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    To quickly add a set of common warranty types, click the
                    &quot;Seed Default Types&quot; button. This will add
                    Standard (90 days), Extended (1 year), Premium (2 years),
                    and Lifetime warranty types if no types currently exist.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
