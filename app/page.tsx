import KoanApp from "@/components/KoanApp";
import { Landing } from "@/components/Landing";
import { currentUser } from "@/lib/server/auth";

export default async function Page() {
  const user = await currentUser();
  if (user) return <KoanApp user={user.username} />;
  return <Landing />;
}
