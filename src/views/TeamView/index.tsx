"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames";
import TeamToolbar from "@/components/TeamPage/TeamToolbar";
import { TeamSwitcher } from "@/components/TeamPage/TeamSwitch/TeamSwitcher";
import TeamBoardManager from "@/components/TeamBoardManager";
import { toast } from "sonner";
import { KanbanSquare } from "lucide-react";
import { ROUTES } from "@/constants/routes";

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
  const [boardName, setBoardName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Unable to find user session.");
        router.replace(ROUTES.HOME);
        return;
      }

      const { data: userTeam, error: userTeamError } = await supabase
        .from("user_team")
        .select("status")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (userTeamError || !userTeam || userTeam.status !== "ACTIVE") {
        toast.error("No access to this team.");
        router.replace(ROUTES.HOME);
        return;
      }

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

      const { data: boardData, error: boardError } = await supabase
        .from("boards")
        .select("name")
        .eq("team_id", teamId)
        .single();

      if (!boardError) {
        setBoardName(boardData?.name || null);
      }

      setLoading(false);
    };

    fetchData();
  }, [teamId, router]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!team) return <div className="p-6">Team not found.</div>;

  return (
    <div>
      <div className="flex flex-col gap-2 bg-secondary text-secondary-foreground py-2 px-4 border-b w-full">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.HOME}
            className="text-primary hover:opacity-80 transition"
          >
            <KanbanSquare className="w-8 h-8" />
          </Link>

          <div className="flex items-center gap-2 text-foreground text-xl font-semibold">
            <span>{team.name}</span>
            {boardName && (
              <>
                <span className="text-muted-foreground">&gt;</span>
                <span className="text-muted-foreground">{boardName}</span>
              </>
            )}
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <TeamSwitcher currentTeamId={teamId} />
            <TeamToolbar
              teamId={teamId}
              initialName={team.name}
              initialDescription={team.description}
              onTeamUpdate={(newName, newDescription) =>
                setTeam((prev) =>
                  prev ? { ...prev, name: newName, description: newDescription } : prev
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <TeamBoardManager setBoardName={setBoardName} />
      </div>
    </div>
  );
}