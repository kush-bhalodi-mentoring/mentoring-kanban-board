// src/app/team/[teamId]/page.tsx

import TeamView from "@/views/Team/TeamView"

type PageProps = {
    params: { teamId: string };
  };
  
  export default async function TeamPage(props: Promise<PageProps>) {
    const {
      params: { teamId },
    } = await props;
  
    return <TeamView teamId={teamId} />;
  }


