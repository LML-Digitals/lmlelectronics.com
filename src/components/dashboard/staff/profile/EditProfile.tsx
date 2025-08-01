"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateStaff } from "../services/staffCrud";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Edit, Pencil, Camera, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/common/top-dialog/TopDialog";
import bcrypt from "bcryptjs";
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
import { Staff } from "@prisma/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { User, Briefcase } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { UploadResponse } from "@/lib/types/upload";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Mobile phone is required"),
  email: z.string().min(1, "Staff email is required").email("Invalid email"),
  title: z.string().min(1, "Staff title is required"),
  role: z.string().min(1, "Staff role is required"),
});

type FormData = z.infer<typeof schema>;

interface EditStaffProps {
  Staff: Staff | null;
}

const EditProfile = ({ Staff }: EditStaffProps) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null | string>(null);
  const [preview, setPreview] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (Staff) {
      methods.reset({
        firstName: Staff?.firstName || "",
        lastName: Staff?.lastName || "",
        phone: Staff?.phone || "",
        email: Staff?.email || "",
        title: Staff?.jobTitle || "",
        role: Staff?.role || "",
      });
    }
  }, [Staff, methods]);

  // console.log(Staff);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    let imageUrl: string | null = null;
    try {
      if (image && image instanceof File) {
        const response = await fetch(`/api/upload?filename=${image.name}`, {
          method: "POST",
          body: image,
        });
        if (!response.ok) {
          throw new Error("Failed to upload file.");
        }
        const newBlob = (await response.json()) as UploadResponse;
        imageUrl = newBlob.url;
      }
      if (!Staff) {
        throw new Error("Staff not found");
      }
      await updateStaff(Staff?.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        jobTitle: formData.title,
        profileImage: imageUrl,
        // profileImage: formData.profileImage,
      });

      router.refresh();
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
      setDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Email already exists. Try again with a different email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file instanceof File) {
      // Add your image upload logic here
      setImage(file);
      //Todo: Create a preview URL for the selected image
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
          <DialogDescription className="text-gray-500">
            Make changes to your profile information below
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto px-1">
          {/* Profile Picture Section */}
          <Card className="p-6 mb-6 bg-gray-50/50">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Profile Picture
            </h2>
            <div className="flex items-center gap-8">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={Staff?.profileImage || "/default-avatar.png"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-900 text-2xl">
                    {Staff?.firstName?.[0] || <User size={32} />}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="profile-picture"
                    className="cursor-pointer inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 transition-colors px-4 py-2 rounded-md text-black font-medium"
                  >
                    <Camera className="w-4 h-4" />
                    Upload new photo
                  </Label>
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended: Square JPG or PNG, max 2MB
                  </p>
                </div>
                {preview && (
                  <div className="relative inline-block">
                    <Image
                      src={preview}
                      width={80}
                      height={80}
                      alt="Preview"
                      className="rounded-full border-2 border-gray-200 shadow-md"
                    />
                    <button
                      onClick={() => {
                        setPreview(null);
                        setImage(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Form Wrapper */}
          <Form {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information Section */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="firstName"
                    defaultValue={Staff?.firstName || ""}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            {...field}
                            className="transition-all focus:ring-2 focus:ring-black"
                          />
                        </FormControl>
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="lastName"
                    defaultValue={Staff?.lastName || ""}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            {...field}
                            className="transition-all focus:ring-2 focus:ring-black"
                          />
                        </FormControl>
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="email"
                    defaultValue={Staff?.email || ""}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            className="transition-all focus:ring-2 focus:ring-black"
                          />
                        </FormControl>
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="phone"
                    defaultValue={Staff?.phone || ""}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your phone number"
                            {...field}
                            className="transition-all focus:ring-2 focus:ring-black"
                          />
                        </FormControl>
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Job Information Section */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  Job Information
                </h2>
                <div className="max-w-md">
                  <FormField
                    control={control}
                    name="title"
                    defaultValue={Staff?.jobTitle || ""}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Job Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your job title"
                            {...field}
                            className="transition-all focus:ring-2 focus:ring-black"
                          />
                        </FormControl>
                        {errors.title && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.title.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Save Button */}
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-black hover:bg-gray-800 text-white font-medium px-8 py-2 rounded-md transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
