"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames";
import InviteUserDialog from "@/components/InviteUserDialog";
import TeamBoardManager from "@/components/TeamBoardManager";
import TeamToolbar from "@/components/TeamPage/TeamToolbar";
import { TeamSwitcher } from "@/components/TeamPage/TeamSwitch/TeamSwitcher";

type TeamViewProps = {
  teamId: string;
};

type Team = {
  id: string;
  name: string;
  description: string;
};

export default function TeamView({ teamId }: TeamViewProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data, error } = await supabase
        .from(TABLE.TEAMS)
        .select("*")
        .eq("id", teamId)
        .single();

      if (error) {
        console.error("Failed to fetch team", error);
      } else {
        setTeam(data);
      }

      setLoading(false);
    };

    fetchTeam();
  }, [teamId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!team) return <div className="p-6">Team not found.</div>;

  return (
    <div className="space-y-6 mt-12 ml-8">
      <h1 className="text-2xl font-bold">Team Dashboard</h1>

      {/* Left section: Team Name + Description */}
      <div className="flex flex-col w-full py-1">
        <h1 className="text-xl font-semibold text-foreground">{team.name}</h1>
        <p className="text-sm text-muted-foreground">{team.description}</p>
      </div>

      <div className="flex items-center space-x-4">
        <InviteUserDialog />
        {/* future: other admin actions */}
      </div>

      <div className="flex justify-between items-center bg-secondary text-secondary-foreground py-1 px-4 border-b w-full">
        <div className="flex items-end space-x-2 py-1">
          <TeamSwitcher currentTeamId={teamId} />
          <TeamToolbar
            teamId={teamId}
            initialName={team.name}
            initialDescription={team.description}
            onTeamUpdate={(newName, newDescription) =>
              setTeam((prev) => prev && { ...prev, name: newName, description: newDescription })
            }
          />
        </div>
      </div>

      <TeamBoardManager />
      {/* future: columns, invitations list, etc */}
    </div>
  );
}