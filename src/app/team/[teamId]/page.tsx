//src/app/team/[teamId]/page.tsx
import TeamView from "@/views/Team/TeamView"

export default function TeamPage({ params }: { params: { teamId: string } }) {
  return <TeamView teamId={params.teamId} />
}
