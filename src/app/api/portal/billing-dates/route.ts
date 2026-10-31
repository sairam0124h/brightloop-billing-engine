import { withApi } from "@/lib/errors";
import { requireUser } from "@/server/auth/session";

export async function GET() {
  return withApi(async () => {
    await requireUser();
    return {
      billingDates: [
        { id: "1", name: "1st of the month", startDay: 1, paymentTerms: 15 },
        { id: "2", name: "15th of the month", startDay: 15, paymentTerms: 15 },
      ],
    };
  });
}

