'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateStaff } from '../services/staffCrud';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/top-dialog/TopDialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const staffSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email format'),
  jobTitle: z.string().min(1, 'Job title is required'),
  role: z.string().min(1, 'Role is required'),
  paymentType: z.enum(['HOURLY', 'SALARY', 'COMMISSION']),
  baseSalary: z.number().min(0, 'Base salary must be non-negative'),
  commissionRate: z.number().min(0).max(100).optional(),
});

type FormData = z.infer<typeof staffSchema>;

interface EditStaffProps {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  jobTitle: string;
  role: string;
  paymentType: string;
  baseSalary?: number;
  commissionRate?: number;
}

const EditStaff = ({
  id,
  firstName,
  lastName,
  phone,
  email,
  jobTitle,
  role,
  paymentType,
  baseSalary,
  commissionRate,
}: EditStaffProps) => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const methods = useForm<FormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      firstName,
      lastName,
      phone,
      email,
      jobTitle,
      role,
      paymentType: paymentType as 'HOURLY' | 'SALARY' | 'COMMISSION',
      baseSalary: baseSalary || 0,
      commissionRate: commissionRate || 10,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      await updateStaff(id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        role: formData.role,
        jobTitle: formData.jobTitle,
        paymentType: formData.paymentType,
        baseSalary: formData.baseSalary,
        commissionRate: formData.commissionRate,
      });

      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Email already exists. Try again with a different email.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-blue-50 h-8 w-8 sm:h-10 sm:w-10 min-h-[44px] min-w-[44px]">
          <Pencil size={18} className="text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Edit Staff Profile
          </DialogTitle>
          <p className="text-sm sm:text-base text-muted-foreground">
            Update {firstName} {lastName}'s information and credentials below.
          </p>
        </DialogHeader>

        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6">
              <div className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50">
                <h3 className="font-medium text-sm sm:text-base">Personal Information</h3>
                <FormField
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white text-sm sm:text-base min-h-[44px]"
                          placeholder="Enter first name"
                          {...field}
                        />
                      </FormControl>
                      {errors.firstName && (
                        <p className="text-red-600 text-xs sm:text-sm">
                          {errors.firstName.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white text-sm sm:text-base min-h-[44px]"
                          placeholder="Enter last name"
                          {...field}
                        />
                      </FormControl>
                      {errors.lastName && (
                        <p className="text-red-600 text-xs sm:text-sm">
                          {errors.lastName.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          className="bg-white text-sm sm:text-base min-h-[44px]"
                          placeholder="Enter email address"
                          {...field}
                        />
                      </FormControl>
                      {errors.email && (
                        <p className="text-red-600 text-xs sm:text-sm">
                          {errors.email.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white text-sm sm:text-base min-h-[44px]"
                          placeholder="Enter phone number"
                          {...field}
                        />
                      </FormControl>
                      {errors.phone && (
                        <p className="text-red-600 text-xs sm:text-sm">
                          {errors.phone.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50">
                <h3 className="font-medium text-sm sm:text-base">Role & Compensation</h3>
                <FormField
                  control={control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">
                        Job Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white text-sm sm:text-base min-h-[44px]"
                          placeholder="Enter job title"
                          {...field}
                        />
                      </FormControl>
                      {errors.jobTitle && (
                        <p className="text-red-600 text-xs sm:text-sm">
                          {errors.jobTitle.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">
                        Role
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white text-sm sm:text-base min-h-[44px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="receptionist">Receptionist</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-red-600 text-xs sm:text-sm">
                          {errors.role.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">
                        Payment Type
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white text-sm sm:text-base min-h-[44px]">
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HOURLY">Hourly</SelectItem>
                          <SelectItem value="SALARY">Salary</SelectItem>
                          <SelectItem value="COMMISSION">Commission</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.paymentType && (
                        <p className="text-red-600 text-xs sm:text-sm">
                          {errors.paymentType.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="baseSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">
                        Base Salary
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-white text-sm sm:text-base min-h-[44px]"
                          placeholder="Enter base salary"
                          {...field}
                        />
                      </FormControl>
                      {errors.baseSalary && (
                        <p className="text-red-600 text-xs sm:text-sm">
                          {errors.baseSalary.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">
                        Commission Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-white text-sm sm:text-base min-h-[44px]"
                          placeholder="Enter commission rate"
                          {...field}
                        />
                      </FormControl>
                      {errors.commissionRate && (
                        <p className="text-red-600 text-xs sm:text-sm">
                          {errors.commissionRate.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
                className="min-h-[44px] w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="min-h-[44px] w-full sm:w-auto">
                {loading ? (
                  <>
                    <div className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  'Update Staff'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStaff;
