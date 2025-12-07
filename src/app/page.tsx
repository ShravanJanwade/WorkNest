import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import HomePage from "./home/home";

export default async function Page() {
  const user = await getCurrent();

  if (user) {
    if (user.prefs?.isSuperAdmin) {
      redirect("/superadmin");
    }
    redirect("/dashboard");
  }

  return <HomePage />;
}

