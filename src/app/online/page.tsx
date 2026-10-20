import { Suspense } from "react";
import type { Metadata } from "next";

import { JoinForm } from "@/components/organisms/impostor/online/join-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Impostor online",
  description:
    "Crie uma sala com código e QR Code e jogue o Impostor com cada um no seu celular.",
};

export default function OnlinePage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <JoinForm />
    </Suspense>
  );
}
