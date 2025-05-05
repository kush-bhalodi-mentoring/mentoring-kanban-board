import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    (await supabase).auth.exchangeCodeForSession(code);
  }

  console.log("success");
  return NextResponse.json("success");
}
