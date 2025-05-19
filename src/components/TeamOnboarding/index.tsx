"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateTeam from "./CreateTeam";
import JoinTeam from "./JoinTeam";
import Link from "next/link";
import { KanbanSquare } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function TeamOnboarding() {
  return (
    <div className="flex flex-col items-center justify-top min-h-screen p-8 bg-gray-50 space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href={ROUTES.HOME} className="text-primary hover:opacity-80 transition">
            <KanbanSquare className="h-12 w-12" />
          </Link>
          <h1 className="text-3xl font-bold">Team Onboarding</h1>
          <p className="text-muted-foreground">
            Create a new team or join an existing one to get started.
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="w-full max-w-xl">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="create">Create Team</TabsTrigger>
          <TabsTrigger value="join">Join Team</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <CreateTeam />
        </TabsContent>

        <TabsContent value="join">
          <JoinTeam />
        </TabsContent>
      </Tabs>
    </div>
  );
}