import { withApi } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { runBilling } from "@/server/services/billing";

export async function POST() {
  return withApi(async () => {
    const user = await requireRole("ADMIN");
    const result = await runBilling(new Date(), user.id);
    return result;
  });
}

