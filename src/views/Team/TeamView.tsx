"use client";

import InviteUserDialog from "@/components/InviteUserDialog";
import TeamBoardManager from "@/components/TeamBoardManager";

export default function TeamView() {
  return (
    <div className="space-y-6 mt-12 ml-8">
      <h1 className="text-2xl font-bold">Team Dashboard</h1>

      <div className="flex items-center space-x-4">
        <InviteUserDialog />
        {/* future: other admin actions */}
      </div>

      <TeamBoardManager />

      {/* future: columns, invitations list, etc */}
    </div>
  );
}