"use client";
import { z } from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateHashKey } from "../services/staffCrud";
import { useRouter } from "next/navigation";
import { createStaff } from "../services/staffCrud";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/common/top-dialog/TopDialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleDashed } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().min(1, "Staff email is required"),
  role: z.string().min(1, "Staff role is required"),
});

type FormData = z.infer<typeof schema>;

export default function GenerateHashKey() {
  const router = useRouter();
  // const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await generateHashKey({
          email: formData.email,
          role: formData.role,
        });
        setOpenDialog(false);
        toast({
          variant: "default",
          title: "Hash key generated successfully",
          description: "Hash key generated successfully",
        });
        router.refresh();
      } catch (error) {
        console.error("An error occurred:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while generating hash key",
        });
      }
    });
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild onClick={() => setOpenDialog(true)}>
        <Button variant="default">Generate Key</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Hash Key</DialogTitle>
        </DialogHeader>

        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  {errors.email && <p>{errors.email.message}</p>}
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-max">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles:</SelectLabel>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="receptionist">
                            Receptionist
                          </SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="marketer">Marketer</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {errors.role && <p>{errors.role.message}</p>}
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" variant="default">
                {isPending ? (
                  <CircleDashed className="animate-spin transition-all" />
                ) : (
                  "Generate Key"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
