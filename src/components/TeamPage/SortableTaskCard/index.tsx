import { GripVertical } from "lucide-react"
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import TaskCard from "../TaskCard"
import type { TaskProps } from "../TeamColumnManager"

type Props = {
  task: TaskProps
  teamId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  dragging?: boolean
}

export default function SortableTaskCard(props: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("your-card-styles", props.dragging && "opacity-50 scale-105 z-50")}
    >
      <TaskCard {...props}>
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute top-2 right-2 cursor-grab p-1 rounded bg-muted hover:bg-muted/70"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </TaskCard>
    </div>
  )
}