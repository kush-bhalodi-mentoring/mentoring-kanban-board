"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const params = useParams<{ teamId: string }>();
  const teamId = params.teamId;

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: InviteFormValues) => {
    const { email } = data;

    // Querying users_with_email view now
    const { data: user, error: userError } = await supabase
      .from("users_with_email")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      toast.error("User not found in the database.");
      return;
    }

    const inviteLink = `${window.location.origin}/api/accept-invite?teamId=${teamId}&userId=${user.id}`;

    const { error: emailError } = await supabase.functions.invoke("send-invite-email", {
      body: {
        email,
        link: inviteLink,
        teamId,
      },
    });

    if (emailError) {
      toast.error("Failed to send invitation email.");
      return;
    }

    toast.success("Invitation sent successfully!");
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Invite User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Send Invite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}