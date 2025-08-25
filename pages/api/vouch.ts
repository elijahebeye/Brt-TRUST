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
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const auth = (req.headers.authorization || "").replace("Bearer ", "");
    if (!auth) return res.status(401).json({ error: "Missing token" });

    const user = await getUserFromToken(auth);
    if (!user || !user.id) return res.status(401).json({ error: "Invalid token" });
    const voucherId = user.id;

    const { vouchee_id } = req.body;
    if (!vouchee_id) return res.status(400).json({ error: "Missing vouchee_id" });
    if (vouchee_id === voucherId) return res.status(400).json({ error: "Cannot vouch for yourself" });

    const { data: voucherData, error: vErr } = await supabaseAdmin.from("profiles").select("id, trust_balance").eq("id", voucherId).single();
    if (vErr || !voucherData) return res.status(400).json({ error: "Voucher profile not found" });

    const voucherTrust = Number(voucherData.trust_balance) || 0;
    const amount = 0.2;
    if (voucherTrust < amount) return res.status(400).json({ error: "Insufficient TRUST" });

    const { data: voucheeData, error: vuErr } = await supabaseAdmin.from("profiles").select("id, trust_balance, reputation").eq("id", vouchee_id).single();
    if (vuErr || !voucheeData) return res.status(400).json({ error: "Vouchee profile not found" });

    const newVoucherTrust = Math.round((voucherTrust - amount) * 100) / 100;
    const newVoucheeTrust = Math.round((Number(voucheeData.trust_balance) + amount) * 100) / 100;
    const newReputation = (Number(voucheeData.reputation) || 0) + 1;

    const updates = await supabaseAdmin.from("profiles").update({ trust_balance: newVoucherTrust }).eq("id", voucherId);
    if (updates.error) return res.status(500).json({ error: updates.error.message });

    const updates2 = await supabaseAdmin.from("profiles").update({ trust_balance: newVoucheeTrust, reputation: newReputation }).eq("id", vouchee_id);
    if (updates2.error) return res.status(500).json({ error: updates2.error.message });

    const { error: insErr } = await supabaseAdmin.from("vouches").insert({
      voucher_id: voucherId,
      vouchee_id,
      amount,
      created_at: new Date().toISOString()
    });

    if (insErr) return res.status(500).json({ error: insErr.message });

    return res.status(200).json({ success: true, newVoucherTrust, newVoucheeTrust, newReputation });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
}
