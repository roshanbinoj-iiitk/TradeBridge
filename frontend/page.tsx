import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  // cookies() returns a ReadonlyRequestCookies synchronously in Next 13/14 server components
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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
