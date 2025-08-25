import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;

async function getUserFromToken(token: string) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) return null;
  return await r.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing token" });

    const user = await getUserFromToken(token);
    if (!user || !user.id) return res.status(401).json({ error: "Invalid token" });
    const userId = user.id;

    const { data: existing } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single();
    if (existing) return res.status(200).json({ profile: existing });

    const { count } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true });
    const signupOrder = (typeof count === "number") ? count + 1 : 1;

    let trust = 0;
    if (signupOrder <= 400) {
      const max = 300;
      const min = 50;
      const positions = 400;
      const t = max - ((signupOrder - 1) * (max - min) / (positions - 1));
      trust = Math.round(t * 100) / 100;
    }

    const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;
    const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

    const insertPayload = {
      id: userId,
      display_name: displayName,
      avatar_url: avatarUrl,
      reputation: 0,
      trust_balance: trust,
      created_at: new Date().toISOString(),
      signup_order: signupOrder
    };

    const { data, error } = await supabaseAdmin.from("profiles").insert(insertPayload).select().single();
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ profile: data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
}
