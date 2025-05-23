import TeamView from "@/views/TeamView";
import { JSX } from "react";

type PageProps = {
  params: Promise<{ teamId: string }>;
};

export default async function TeamPage(props: PageProps): Promise<JSX.Element> {
  const pageParams = await props.params;

  return <TeamView teamId={pageParams.teamId} />;
}