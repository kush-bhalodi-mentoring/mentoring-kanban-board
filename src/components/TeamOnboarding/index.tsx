"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateTeam from "./CreateTeam";
import JoinTeam from "./JoinTeam";

export default function TeamOnboarding() {
  return (
    <div className="flex flex-col items-center justify-top min-h-screen p-8 bg-gray-50 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Team Onboarding</h1>
        <p className="text-muted-foreground">
          Create a new team or join an existing one to get started.
        </p>
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