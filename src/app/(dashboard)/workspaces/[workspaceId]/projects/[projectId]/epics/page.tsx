import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import { EpicClient } from "./client";

const EpicsPage = async () => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return <EpicClient />;
};

export default EpicsPage;
