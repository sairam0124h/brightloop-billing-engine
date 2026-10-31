import { withApi } from "@/lib/errors";
import { clearAuthCookie } from "@/server/auth/jwt";

export async function POST() {
  return withApi(async () => {
    await clearAuthCookie();
    return { success: true };
  });
}