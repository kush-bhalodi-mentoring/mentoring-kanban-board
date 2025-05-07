"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { DB_TABLE_NAMES } from "@/constants/databaseTableNames";
import { TeamMemberRoles } from "@/types/supabaseTableData";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CreateTeamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  type: z.enum(["PUBLIC", "PRIVATE"], {
    errorMap: () => ({ message: "Select a team type" }),
  }),
});

type CreateTeamFormData = z.infer<typeof CreateTeamSchema>;

export default function CreateTeam() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CreateTeamFormData>({
    resolver: zodResolver(CreateTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "PUBLIC",
    },
  });

  const handleCreateTeam = async (data: CreateTeamFormData) => {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      toast.error("User not found");
      setLoading(false);
      return;
    }

    const userId = userData.user.id;

    const { data: team, error: teamError } = await supabase
      .from(DB_TABLE_NAMES.TEAMS)
      .insert([
        {
          name: data.name,
          description: data.description,
          type: data.type,
        },
      ])
      .select("id")
      .single();

    if (teamError || !team) {
      toast.error("Failed to create team");
      setLoading(false);
      return;
    }

    const teamId = team.id;

    const { error: userTeamError } = await supabase
      .from(DB_TABLE_NAMES.USER_TEAM)
      .insert([{ user_id: userId, team_id: teamId, role: TeamMemberRoles.ADMIN }]);

    if (userTeamError) {
      toast.error("Failed to associate user with team");
      setLoading(false);
      return;
    }

    toast.success("Team created successfully!");
    router.push(ROUTES.TEAM_ID(teamId));
  };

  return (
    <Card className="w-full max-w-xl text-left">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Create a Team</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateTeam)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Team Awesome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Short description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-0"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PUBLIC" id="public" />
                        <label htmlFor="public" className="cursor-pointer">
                          Public
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PRIVATE" id="private" />
                        <label htmlFor="private" className="cursor-pointer">
                          Private
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}