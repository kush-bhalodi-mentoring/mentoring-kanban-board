"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"

type EditTeamDialogProps = {
  teamId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName: string
  initialDescription: string
  onSuccess?: (newName: string, newDescription: string) => void
}

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function EditTeamDialog({
  teamId,
  open,
  onOpenChange,
  initialName,
  initialDescription,
  onSuccess,
}: EditTeamDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialName,
      description: initialDescription,
    },
  })

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase
      .from(TABLE.TEAMS)
      .update(values)
      .eq("id", teamId)

    if (error) {
      toast.error("Failed to update team")
    } else {
      toast.success("Team updated successfully")
      onOpenChange(false)
      onSuccess?.(values.name, values.description ?? "")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) reset({ name: initialName, description: initialDescription })
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Configuration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="name">Team Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}