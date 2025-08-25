import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  reputation: number;
  trust_balance: string;
  created_at: string;
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      if (data.session?.access_token) {
        await fetch("/api/create-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
        }).catch(console.error);
      }
    })();

    fetchLeaderboard();
    const channel = supabase
      .channel("public:profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.access_token) {
        fetch("/api/create-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }).catch(console.error);
      }
    });

    return () => {
      channel.unsubscribe();
      sub?.subscription.unsubscribe();
    };
  }, []);

  async function fetchLeaderboard() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, reputation, trust_balance, created_at")
      .order("reputation", { ascending: false })
      .limit(100);
    if (!error && data) setLeaderboard(data as Profile[]);
    setLoading(false);
  }

  async function signInWith(provider: "discord" | "twitter") {
    await supabase.auth.signInWithOAuth({ provider });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>iTRuST</h1>
      <p>Sign in (Discord or Twitter) to claim your profile and vouch for others.</p>

      {!user ? (
        <div>
          <button onClick={() => signInWith("discord")} style={{ marginRight: 8 }}>
            Sign in with Discord
          </button>
          <button onClick={() => signInWith("twitter")}>Sign in with Twitter</button>
        </div>
      ) : (
        <div>
          Signed in as {user.email ?? user.user_metadata?.full_name ?? user.id}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => (window.location.href = "/me")}>My Profile</button>
            <button onClick={() => (window.location.href = "/leaderboard")} style={{ marginLeft: 8 }}>
              Leaderboard
            </button>
            <button onClick={signOut} style={{ marginLeft: 8 }}>
              Sign out
            </button>
          </div>
        </div>
      )}

      <hr style={{ marginTop: 20, marginBottom: 20 }} />

      <section>
        <h2>Top 100 Leaderboard</h2>
        {loading ? (
          <p>Loading...</p>
        ) : leaderboard.length === 0 ? (
          <p>No users yet</p>
        ) : (
          <ol>
            {leaderboard.map((p) => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                <img src={p.avatar_url ?? "/default-avatar.png"} alt="avatar" width={32} height={32} style={{ borderRadius: 16, verticalAlign: "middle", marginRight: 8 }} />
                <strong>{p.display_name ?? p.id.substring(0, 8)}</strong>
                {" — "}Reputation: {p.reputation ?? 0} {" • "}TRUST: {(Number(p.trust_balance) || 0).toFixed(2)}
                {" "}
                <Link href={`/profile/${p.id}`}><a style={{ marginLeft: 8 }}>View</a></Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer style={{ marginTop: 40, color: "#666", fontSize: 13 }}>
        Notes: First 400 signups receive TRUST (300 → 50). Vouch cost: 0.2 TRUST. Leaderboard updates live.
      </footer>
    </div>
  );
}
