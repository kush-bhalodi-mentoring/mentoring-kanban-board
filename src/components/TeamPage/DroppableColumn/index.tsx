"use client"
import { useDroppable } from "@dnd-kit/core"

type DroppableColumnProps = {
  columnId: string
  children: React.ReactNode
}

export default function DroppableColumn({ columnId, children }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id: columnId,
  })

  return (
    <div ref={setNodeRef} className="flex flex-col min-h-screen">
      {children}
    </div>
  )
}