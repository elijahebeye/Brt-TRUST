import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function LeaderboardPage() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    fetchList();
    const channel = supabase
      .channel("public:profiles-lb")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchList();
      })
      .subscribe();
    return () => channel.unsubscribe();
  }, []);

  async function fetchList() {
    const { data } = await supabase.from("profiles").select("id, display_name, avatar_url, reputation, trust_balance").order("reputation", { ascending: false }).limit(100);
    setList(data ?? []);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Leaderboard — Top 100</h1>
      <p><Link href="/"><a>Home</a></Link></p>
      <ol>
        {list.map((p) => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <img src={p.avatar_url ?? "/default-avatar.png"} width={28} height={28} style={{ borderRadius: 14, verticalAlign: "middle", marginRight: 8 }} />
            <strong>{p.display_name ?? p.id.substring(0, 8)}</strong> — Rep: {p.reputation ?? 0} — TRUST: {(Number(p.trust_balance) || 0).toFixed(2)}
            {" "}<Link href={`/profile/${p.id}`}><a style={{ marginLeft: 8 }}>View</a></Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
