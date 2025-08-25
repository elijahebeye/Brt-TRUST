export default function ProfileCard({ user, rank }: { user: any; rank: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
      <span>{rank}. {user.username || "Anonymous"}</span>
      <span>{user.trust} TRUST</span>
    </div>
  );
}
