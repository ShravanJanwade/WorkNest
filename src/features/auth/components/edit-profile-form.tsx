"use client";

import { z } from "zod";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ImageIcon,
  Loader,
  User,
  MapPin,
  Briefcase,
  Building2,
  UserCog,
  Calendar,
  Shield,
  KeyRound,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useUpdateUser } from "../api/use-update-user";
import { useChangePassword } from "../api/use-change-password";
import { useUpdateMfa } from "../api/use-update-mfa";
import { useResendVerification } from "../api/use-resend-verification";
import { updateProfileSchema, changePasswordSchema } from "../schemas";
import { Switch } from "@/components/ui/switch";
import { Models } from "node-appwrite";
import { ChangePasswordModal } from "./change-password-modal";

interface EditProfileFormProps {
  initialValues: Models.User<Models.Preferences>;
  onCancel?: () => void;
}

export const EditProfileForm = ({ initialValues, onCancel }: EditProfileFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateUser();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutate: updateMfa, isPending: isUpdatingMfa } = useUpdateMfa();
  const resendVerification = useResendVerification();
  const inputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialValues.name || "",
      image: initialValues.prefs?.imageUrl || "",
      password: "",
      dob: initialValues.prefs?.dob || "",
      address: initialValues.prefs?.address || "",
      profession: initialValues.prefs?.profession || "",
      company: initialValues.prefs?.company || "",
      reportingManager: initialValues.prefs?.reportingManager || "",
    },
  });

  useEffect(() => {
    if (initialValues.prefs?.imageUrl) {
      setImagePreview(initialValues.prefs.imageUrl);
    }
  }, [initialValues.prefs?.imageUrl]);

  const onSubmit = (values: z.infer<typeof updateProfileSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    };

    mutate(
      { form: finalValues },
      {
        onSuccess: () => {
          setImagePreview(null);
        },
      },
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    form.setValue("image", "");
    setImagePreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handlePasswordChange = (values: z.infer<typeof changePasswordSchema>) => {
    changePassword(
      { json: values },
      {
        onSuccess: () => {
          setIsPasswordModalOpen(false);
        },
      },
    );
  };

  const avatarFallback = initialValues.name
    ? initialValues.name.charAt(0).toUpperCase()
    : (initialValues.email?.charAt(0).toUpperCase() ?? "U");

  const currentImage = imagePreview || initialValues.prefs?.imageUrl;

  return (
    <>
      <Card className="w-full h-full border-none shadow-none bg-gradient-to-br from-background via-background to-muted/20">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={onCancel ? onCancel : () => router.push("/")}
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Profile
          </CardTitle>
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {}
              {!initialValues.emailVerification && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-md">
                  <div className="flex items-start justify-between">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Shield className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-amber-700">
                          Your email address is not verified.
                          <span className="block mt-1">
                            Please check your inbox for the verification link. Verify to enable
                            security features like MFA.
                          </span>
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800 ml-4 whitespace-nowrap"
                      disabled={resendVerification.isPending}
                      onClick={() => resendVerification.mutate()}
                    >
                      {resendVerification.isPending && (
                        <Loader className="h-3 w-3 mr-2 animate-spin" />
                      )}
                      Resend Email
                    </Button>
                  </div>
                </div>
              )}

              {}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="size-24 border-4 border-background shadow-xl ring-2 ring-primary/20">
                      {currentImage && <AvatarImage src={currentImage} alt={initialValues.name} />}
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white text-2xl font-bold">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="size-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{initialValues.name}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <User className="size-4" />
                      {initialValues.email}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <input
                        className="hidden"
                        type="file"
                        accept=".jpg, .png, .jpeg, .svg"
                        ref={inputRef}
                        onChange={handleImageChange}
                        disabled={isPending}
                      />

                      {currentImage && form.watch("image") ? (
                        <Button
                          type="button"
                          disabled={isPending}
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                        >
                          Remove Image
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={isPending}
                          variant="outline"
                          size="sm"
                          onClick={() => inputRef.current?.click()}
                          className="bg-background/50 backdrop-blur-sm hover:bg-background"
                        >
                          <ImageIcon className="size-4 mr-2" />
                          Upload New Photo
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG, or JPEG, max 1MB</p>
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="size-5 text-primary" />
                  <h3 className="text-xl font-bold">Personal Information</h3>
                </div>
                <div className="space-y-4 bg-card/50 backdrop-blur-sm rounded-lg p-6 border">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="size-4" />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your full name"
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            Date of Birth
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="date" className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="size-4" />
                            Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="123 Main St, City"
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="size-5 text-primary" />
                  <h3 className="text-xl font-bold">Professional Information</h3>
                </div>
                <div className="space-y-4 bg-card/50 backdrop-blur-sm rounded-lg p-6 border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Briefcase className="size-4" />
                            Profession / Role
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Software Engineer"
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="size-4" />
                            Company Name
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Acme Inc." className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reportingManager"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-2">
                            <UserCog className="size-4" />
                            Reporting Manager
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Jane Doe" className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="size-5 text-primary" />
                  <h3 className="text-xl font-bold">Security</h3>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border space-y-6">
                  {}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <KeyRound className="size-4" />
                        Password
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Change your password to keep your account secure
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="bg-background hover:bg-primary/10"
                    >
                      <KeyRound className="size-4 mr-2" />
                      Change Password
                    </Button>
                  </div>

                  <DottedSeparator />

                  {}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Shield className="size-4" />
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Require a 6-digit email OTP when logging in for extra security
                      </p>
                      {!initialValues.emailVerification && (
                        <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                          Verify your email to enable this feature
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={initialValues.prefs?.mfaEnabled || false}
                      onCheckedChange={(checked) =>
                        updateMfa({ enabled: checked }, { onSuccess: () => router.refresh() })
                      }
                      disabled={isUpdatingMfa || !initialValues.emailVerification}
                    />
                  </div>
                </div>
              </div>

              {}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isPending}
                  className={cn(!onCancel && "invisible")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isPending ? (
                    <>
                      <Loader className="size-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        onSubmit={handlePasswordChange}
        isPending={isChangingPassword}
      />
    </>
  );
};
