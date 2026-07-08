import { z } from "zod";
import { currentUser } from "@/lib/current-user";
import { getStore } from "@/data/store";
import { isAllergenId } from "@/domain/allergens";
import { json, unauthorized, badRequest } from "@/lib/http";

export async function GET() {
  const user = await currentUser();
  if (!user) return unauthorized();
  return json({ allergens: user.allergens });
}

const bodySchema = z.object({ allergens: z.array(z.string()) });

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Expected { allergens: string[] }");

  const allergens = parsed.data.allergens.filter(isAllergenId);
  const updated = await getStore().updateUserAllergens(user.id, allergens);
  return json({ allergens: updated?.allergens ?? [] });
}
