import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { TimesheetsClient } from "./client";

const TimesheetsPage = async () => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return <TimesheetsClient />;
};

export default TimesheetsPage;
