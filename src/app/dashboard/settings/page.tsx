'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllSettings } from '@/components/dashboard/settings/services/settingsCrud';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

import Security from '../../../components/dashboard/settings/components/Securty';
import InventorySettings from '../../../components/dashboard/settings/components/InventorySettings';

// Category configurations
const CATEGORIES = [
  {
    value: 'inventory',
    label: 'Inventory',
    component: InventorySettings,
  },
  {
    value: 'security',
    label: 'Security',
    component: Security,
    activeTab: 'security',
  },
];

export default function SettingsPage () {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabParam && CATEGORIES.some((c) => c.value === tabParam)
    ? tabParam
    : 'branding');
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, any>>({});

  // Load settings on mount
  useEffect(() => {
    async function loadSettings () {
      try {
        setIsLoading(true);
        const allSettings = await getAllSettings();

        // Create a map of settings by key for easy access
        const settingsMap: Record<string, any> = {};

        allSettings.forEach((setting) => {
          settingsMap[setting.key] = setting.value;
        });

        setSettings(settingsMap);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam && CATEGORIES.some((c) => c.value === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div>
      <div className="w-full py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure application settings and preferences
          </p>
        </div>

        <Separator className="my-4 sm:my-6" />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            <span className="ml-2 text-sm sm:text-base">Loading settings...</span>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4 sm:space-y-6"
          >
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12 gap-1 sm:gap-2 h-auto bg-muted p-1 sm:p-1.5 rounded-lg w-full shadow-sm overflow-x-auto">
              {CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all h-auto flex items-center justify-center min-h-[44px] sm:min-h-0 whitespace-nowrap"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((category) => {
              const SettingsComponent = category.component;

              return (
                <TabsContent
                  key={category.value}
                  value={category.value}
                  className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">{category.label} Settings</CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Configure {category.label.toLowerCase()} settings and
                        preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <SettingsComponent />
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}
