import { GripVertical } from "lucide-react"
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import TaskCard from "../TaskCard"

type Props = {
  task: any
  teamId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
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
      className="relative"
    >
      <TaskCard {...props}>
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute top-2 right-2 cursor-grab p-1 rounded bg-muted hover:bg-muted/70"
          )}
          onClick={(e) => e.stopPropagation()} // prevent opening dialog
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </TaskCard>
    </div>
  )
}