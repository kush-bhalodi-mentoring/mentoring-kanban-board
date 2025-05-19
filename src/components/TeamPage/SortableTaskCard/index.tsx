import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import TaskCard from "@/components/TeamPage/TaskCard"
import type { TaskProps } from "../TeamColumnManager"

type SortableTaskCardProps = {
  task: TaskProps
  teamId: string
  open: boolean
  onOpenChange: () => void
  onSuccess: () => void
}

export default function SortableTaskCard({
  task,
  teamId,
  open,
  onOpenChange,
  onSuccess,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        teamId={teamId}
        open={open}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    </div>
  )
}
