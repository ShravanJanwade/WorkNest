"use client";

import { MfaCard } from "@/features/auth/components/mfa-card";
import { Suspense } from "react";

const MfaVerifyPage = () => {
  return (
    <Suspense>
      <MfaCard />
    </Suspense>
  );
};

export default MfaVerifyPage;
