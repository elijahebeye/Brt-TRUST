import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Me() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      if (!user) {
        router.push("/");
        return;
      }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(prof);
      setDisplayName(prof?.display_name ?? "");
      setAvatarUrl(prof?.avatar_url ?? "");
      setLoading(false);
    })();
  }, [router]);

  async function updateProfile() {
    const { data, error } = await supabase.from("profiles").update({ display_name: displayName, avatar_url: avatarUrl }).eq("id", profile.id);
    if (error) return alert("Error: " + error.message);
    alert("Profile updated");
    setProfile(data?.[0] ?? profile);
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>My Profile</h1>
      <div>
        <label>Display name</label><br />
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Avatar URL</label><br />
        <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={updateProfile}>Save</button>
        <button onClick={() => (window.location.href = `/profile/${profile.id}`)} style={{ marginLeft: 8 }}>View public profile</button>
      </div>

      <div style={{ marginTop: 20 }}>
        Reputation: {profile.reputation ?? 0} — TRUST: {(Number(profile.trust_balance) || 0).toFixed(2)}
      </div>
    </div>
  );
}
