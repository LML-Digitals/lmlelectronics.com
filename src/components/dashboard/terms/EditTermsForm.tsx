'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  updateTerm,
  addTermVersion,
  getTermVersions,
} from '@/components/terms/services/termsCrud';
import { useToast } from '@/components/ui/use-toast';
import { TermWithVersions } from '@/lib/types';
import { TermVersion } from '@prisma/client';
import dynamic from 'next/dynamic';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

import 'easymde/dist/easymde.min.css';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  major: z.number().min(0, 'Major version must be 0 or greater'),
  minor: z.number().min(0, 'Minor version must be 0 or greater'),
  patch: z.number().min(0, 'Patch version must be 0 or greater'),
  newContent: z.string().min(1, 'Content is required'),
  newEffectiveAt: z.string().min(1, 'Effective date is required'),
});

interface EditTermsFormProps {
  term: TermWithVersions;
}

export function EditTermsForm ({ term }: EditTermsFormProps) {
  const { toast } = useToast();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [allVersions, setAllVersions] = useState<TermVersion[]>(term.versions);
  const [versionConflict, setVersionConflict] = useState<string | null>(null);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLatestVersion = () => {
    if (allVersions.length === 0) { return null; }

    return allVersions.reduce((latest, version) => new Date(version.effectiveAt) > new Date(latest.effectiveAt)
      ? version
      : latest);
  };

  const getHighestVersion = () => {
    if (allVersions.length === 0) { return null; }

    return allVersions.reduce((highest, version) => {
      const [major, minor, patch] = version.version.split('.').map(Number);
      const [highestMajor, highestMinor, highestPatch] = highest.version
        .split('.')
        .map(Number);

      if (major > highestMajor) { return version; }
      if (minor > highestMinor) { return version; }
      if (patch > highestPatch) { return version; }

      return highest;
    });
  };

  const initialVersion = getLatestVersion();
  const [major, minor, patch] = initialVersion?.version
    .split('.')
    .map(Number) || [0, 0, 0];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: term.title,
      major,
      minor,
      patch,
      newContent: initialVersion?.content || '',
      newEffectiveAt:
        initialVersion?.effectiveAt.toISOString().split('T')[0] || '',
    },
  });

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const versions = await getTermVersions(term.id);

        setAllVersions(versions);
        const latest = getLatestVersion();

        if (latest) {
          setSelectedVersionId(latest.id.toString());
          form.setValue('major', parseInt(latest.version.split('.')[0], 10));
          form.setValue('minor', parseInt(latest.version.split('.')[1], 10));
          form.setValue('patch', parseInt(latest.version.split('.')[2], 10));
          form.setValue('newContent', latest.content);
          form.setValue(
            'newEffectiveAt',
            latest.effectiveAt.toISOString().split('T')[0],
          );
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch versions.',
        });
      }
    };

    fetchVersions();
  }, [term.id, form, toast]);

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersionId(versionId);
    const selectedVersion = allVersions.find((v) => v.id.toString() === versionId);

    if (selectedVersion) {
      form.setValue(
        'major',
        parseInt(selectedVersion.version.split('.')[0], 10),
      );
      form.setValue(
        'minor',
        parseInt(selectedVersion.version.split('.')[1], 10),
      );
      form.setValue(
        'patch',
        parseInt(selectedVersion.version.split('.')[2], 10),
      );
      form.setValue('newContent', selectedVersion.content);
      form.setValue(
        'newEffectiveAt',
        selectedVersion.effectiveAt.toISOString().split('T')[0],
      );
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const newVersion = `${values.major}.${values.minor}.${values.patch}`;

      // Check for version conflict
      const existingVersion = allVersions.find((v) => v.version === newVersion);

      if (existingVersion) {
        setVersionConflict(newVersion);
        setShowOverwriteDialog(true);

        return;
      }

      await performVersionUpdate({ ...values, newVersion });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update term',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const performVersionUpdate = async (values: z.infer<typeof formSchema> & { newVersion: string }) => {
    try {
      // Update main term title
      await updateTerm(term.id, { title: values.title });

      // Add new version
      await addTermVersion(term.id, {
        version: values.newVersion,
        content: values.newContent,
        effectiveAt: new Date(values.newEffectiveAt),
      });

      // Update local state with new versions
      const updatedVersions = await getTermVersions(term.id);

      const newVersionData = updatedVersions.find((v) => v.version === values.newVersion);

      if (newVersionData) {
        setSelectedVersionId(newVersionData.id.toString());
      }
      setAllVersions(updatedVersions);

      toast({
        title: 'Success',
        description: 'New version created successfully!',
      });

      // Reset form values to the updated data
      const [major, minor, patch] = values.newVersion.split('.').map(Number);

      form.reset({
        title: values.title,
        major,
        minor,
        patch,
        newContent: values.newContent,
        newEffectiveAt: values.newEffectiveAt,
      });
    } catch (error) {
      throw new Error('Failed to create new version. Please try again.');
    }
  };

  const handleOverwriteConfirm = async () => {
    if (!versionConflict) { return; }

    try {
      // Get the Highest version from allVersions
      const highestVersion = getHighestVersion();

      if (!highestVersion) { throw new Error('No latest version found.'); }

      // Parse the latest version
      let [major, minor, patch] = highestVersion.version.split('.').map(Number);

      // Increment patch version
      patch += 1;
      const newVersion = `${major}.${minor}.${patch}`;

      // Update form values
      form.setValue('major', major);
      form.setValue('minor', minor);
      form.setValue('patch', patch);

      // Proceed with creating the new version
      await performVersionUpdate({ ...form.getValues(), newVersion });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create new version.',
      });
    } finally {
      setShowOverwriteDialog(false);
      setVersionConflict(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Term Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Version Management</h3>

              <Select
                onValueChange={handleVersionSelect}
                value={selectedVersionId || ''}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select version to modify" />
                </SelectTrigger>
                <SelectContent>
                  {allVersions
                    .sort((a, b) => new Date(b.effectiveAt).getTime()
                        - new Date(a.effectiveAt).getTime())
                    .map((version) => (
                      <SelectItem
                        key={version.id}
                        value={version.id.toString()}
                      >
                        {version.version} (
                        {version.effectiveAt.toLocaleDateString()})
                        {version.isActive && ' ★'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={form.control}
              name="major"
              render={() => (
                <FormItem>
                  <FormLabel>New Version Number</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        {...form.register('major', {
                          valueAsNumber: true,
                        })}
                        onChange={(e) => form.setValue('major', parseInt(e.target.value, 10))
                        }
                        className="w-20"
                      />
                      <span className="text-gray-500">.</span>
                      <Input
                        type="number"
                        min={0}
                        {...form.register('minor', {
                          valueAsNumber: true,
                        })}
                        onChange={(e) => form.setValue('minor', parseInt(e.target.value, 10))
                        }
                        className="w-20"
                      />
                      <span className="text-gray-500">.</span>
                      <Input
                        type="number"
                        min={0}
                        {...form.register('patch', {
                          valueAsNumber: true,
                        })}
                        onChange={(e) => form.setValue('patch', parseInt(e.target.value, 10))
                        }
                        className="w-20"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newEffectiveAt"
              render={({ field }) => (
                <FormItem className="mt-4">
                  {' '}
                  {/* Add padding here */}
                  <FormLabel>Effective Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newContent"
              render={({ field }) => (
                <FormItem className="mt-4">
                  {' '}
                  {/* Add padding here */}
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Controller
                      name="newContent"
                      control={form.control}
                      render={({ field }) => (
                        <SimpleMDE
                          {...field}
                          onChange={field.onChange}
                          value={field.value}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create New Version'}
          </Button>
        </form>
      </Form>

      <AlertDialog
        open={showOverwriteDialog}
        onOpenChange={setShowOverwriteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Version Conflict Detected</AlertDialogTitle>
            <AlertDialogDescription>
              Version {versionConflict} already exists. Do you want to create a
              new version?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <Button
              onClick={() => handleOverwriteConfirm()}
              disabled={isSubmitting}
            >
              Yes, create new version
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
