import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  // cookies() returns a ReadonlyRequestCookies in Next 15 and needs to be awaited
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <ul>
      {todos?.map((todo, idx) => (
        <li key={(todo as any)?.id ?? idx}>
          {typeof todo === "string" ? todo : JSON.stringify(todo)}
        </li>
      ))}
    </ul>
  );
}
