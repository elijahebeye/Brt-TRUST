import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ProfileCard from "../components/ProfileCard";

export default function LeaderboardPage() {
  const [list, setList] = useState<any[]>([]);

  const fetchList = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("trust", { ascending: false })
      .limit(100);

    if (!error && data) setList(data);
  };

  useEffect(() => {
    fetchList();

    const channel = supabase
      .channel("public:users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => fetchList()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Leaderboard</h1>
      {list.map((u, idx) => (
        <ProfileCard key={u.id} user={u} rank={idx + 1} />
      ))}
    </div>
  );
}
