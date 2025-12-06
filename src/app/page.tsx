import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import HomePage from "./home/home";

export default async function Page() {
  const user = await getCurrent();
  
  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }
  
  return <HomePage />;
}
