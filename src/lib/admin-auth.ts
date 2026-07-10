import { notFound } from "next/navigation";
import { canReview, getCreatorSession } from "@/lib/creator-auth";

export async function requireAdminSession() {
  const session = await getCreatorSession();

  if (!canReview(session)) {
    notFound();
  }

  return session;
}
