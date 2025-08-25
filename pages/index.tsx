import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabaseClient";

export default function Home() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const signIn = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signInWithOAuth({ provider: "discord" });
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to iTRuST</h1>
      {!session ? (
        <button onClick={signIn}>Login with Discord</button>
      ) : (
        <div>
          <p>Logged in as {session.user.email}</p>
          <button onClick={signOut}>Logout</button>
        </div>
      )}
      <a href="/leaderboard">View Leaderboard</a>
    </div>
  );
}
