import { Card, CardContent } from "@/components/ui/card"

export default function JoinTeamPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-2">Create/Join a team</h1>
          <p className="text-muted-foreground">
            Please create or join a team to continue to the board.
          </p>
        </CardContent>
      </Card>
    </div>
 )
}