import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/utils/supabase/client"
import { UserIcon } from "lucide-react"
import { useEffect, useState } from "react"

type TaskType = "Bug" | "Feature" | "Story"

type Props = {
  task: {
    id: string
    title: string
    description: string | null
    type: TaskType
    assigned_to: string | null
    due_date?: string | null
    position: number
    estimation?: number
    created_by: string
    created_by_email?: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  teamId: string
}

async function fetchUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("team_members_with_email")
    .select("email")
    .eq("user_id", userId)
    .limit(1)

  if (error || !data || data.length === 0) return null
  return data[0].email
}



type TaskCardProps = Props & {
  children?: React.ReactNode
}

export default function TaskCard({
  task,
  onSuccess,
  onOpenChange,
  children,
}: TaskCardProps) {
  const [createdByEmail, setCreatedByEmail] = useState<string | null>(null)
  const typeStyleMap: Record<TaskType, string> = {
    Bug: "bg-red-100 text-red-600 border-red-200",
    Feature: "bg-green-100 text-green-700 border-green-200",
    Story: "bg-blue-100 text-blue-700 border-blue-200",
  }

  useEffect(() => {
    async function getEmail() {
      if (!task.created_by) return
      const email = await fetchUserEmail(task.created_by)
      setCreatedByEmail(email)
    }
    getEmail()
  }, [task.created_by])

  const handleClick = () => {
    onSuccess?.()
    onOpenChange?.(true)
  }

  return (
    <div
      className={cn(
        "rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition cursor-pointer relative",
        "flex flex-col gap-2"
      )}
      onClick={handleClick}
    >
      {children && <div className="absolute top-2 right-2">{children}</div>}

      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span className="text-foreground line-clamp-2">{task.title}</span>
        {task.estimation !== null && (
          <div className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
            {task.estimation}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-2 py-0.5 rounded-full border",
            typeStyleMap[task.type]
          )}
        >
          {task.type}
        </Badge>
      </div>

      <div className="flex justify-end">
        {createdByEmail && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-full bg-muted p-1">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Created by: {createdByEmail}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
