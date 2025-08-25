import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "discord" });
  };

  const signOut = async () => {
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
