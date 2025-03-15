"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import LocalSearch from "@/app/(root)/users/[id]/Input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUser } from "@/context/UserContext";

// Define the form schema
const bioFormSchema = z.object({
  bio: z.string().max(200, {
    message: "Bio must be at most 200 characters long",
  }),
});

type BioFormValues = z.infer<typeof bioFormSchema>;

export default function Bio() {
  const { user, setUser } = useUser();

  // Initialize react-hook-form
  const form = useForm<BioFormValues>({
    resolver: zodResolver(bioFormSchema),
    defaultValues: {
      bio: user?.bio || "",
    },
  });

  // Update form default values when user data loads
  React.useEffect(() => {
    if (user) {
      form.reset({ bio: user.bio || "" });
    }
  }, [user, form]);

  // Handle form submission
  const onSubmit = async (values: BioFormValues) => {
    if (!user) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: values.bio }),
      });

      if (!res.ok) throw new Error("Failed to update bio");

      const updatedUser = await res.json();

      // Update user in context
      setUser((prevUser) =>
        prevUser ? { ...prevUser, bio: updatedUser.user.bio } : null,
      );

      alert("Bio updated successfully!");
    } catch (error) {
      console.error("Error updating bio:", error);
      alert("Failed to update bio");
    }
  };

  if (!user) return null;

  // Determine the button and label text based on whether a bio exists
  const hasBio = !!user.bio;
  const buttonText = form.formState.isSubmitting
    ? "Updating..."
    : hasBio
      ? "Update Bio"
      : "Add Bio";
  const labelText = hasBio ? "Edit Your Bio" : "Add a Bio";

  return (
    <div className="mt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block font-semibold">
                  {labelText}
                </FormLabel>
                <FormControl>
                  <LocalSearch
                    placeholder={
                      hasBio ? "Modify your bio..." : "Add your bio here..."
                    }
                    value={field.value}
                    onChange={field.onChange}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={form.formState.isSubmitting}
          >
            {buttonText}
          </Button>
        </form>
      </Form>
    </div>
  );
}
