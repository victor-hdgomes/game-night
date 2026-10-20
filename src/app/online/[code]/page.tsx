import type { Metadata } from "next";

import { OnlineRoom } from "@/components/organisms/impostor/online/online-room";

export const metadata: Metadata = {
  title: "Sala do Impostor",
};

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <OnlineRoom code={code.toUpperCase()} />;
}
