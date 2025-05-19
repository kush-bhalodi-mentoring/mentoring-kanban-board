"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { useParams } from "next/navigation"

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type InviteFormValues = z.infer<typeof inviteSchema>

type InviteUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function InviteUserDialog({
  open,
  onOpenChange,
}: InviteUserDialogProps) {
  const params = useParams<{ teamId: string }>()
  const teamId = params.teamId

  const [magicLink, setMagicLink] = useState<string | null>(null)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: InviteFormValues) => {
    const { email } = data

    try {
      const res = await fetch("/api/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, teamId }),
      })

      const result = await res.json()

      if (res.ok) {
        toast.success(result.message || "Invitation sent successfully!")
        form.reset()

        // If magic link is returned, show it
        if (result.magicLink) {
          setMagicLink(result.magicLink)
        } else {
          onOpenChange(false)
        }
      } else {
        toast.error(result.error || "Failed to invite user.")
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("Something went wrong while sending the invite.")
    }
  }

  const handleCopy = () => {
    if (magicLink) {
      navigator.clipboard.writeText(magicLink)
      toast.success("Magic link copied to clipboard!")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a User</DialogTitle>
        </DialogHeader>

        {magicLink ? (
          <div className="space-y-4">
            <p className="text-sm">Magic link generated for the user:</p>
            <Input
              value={magicLink}
              readOnly
              className="text-xs"
              onClick={() => navigator.clipboard.writeText(magicLink)}
            />
            <DialogFooter>
              <Button onClick={handleCopy}>Copy Link</Button>
              <Button variant="secondary" onClick={() => {
                setMagicLink(null)
                onOpenChange(false)
              }}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  )
}