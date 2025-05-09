// src/app/team/[teamId]/page.tsx

import TeamView from "@/views/Team/TeamView";
import { JSX } from "react";

type PageProps = {
  params: { teamId: string };
};

export default async function TeamPage(props: PageProps): Promise<JSX.Element> {
  const {
    params: { teamId },
  } = props;

  return <TeamView teamId={teamId} />;
}


