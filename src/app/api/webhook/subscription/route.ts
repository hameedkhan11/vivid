import { client } from "@/lib/prisma";
import crypto from "node:crypto";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // console.log(`Event:POST`, req);
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // console.log(`Event:body`, body);

    const { buyerUserId } = body.meta.custom_data;

    // console.log(`Event:buyerUserId`, buyerUserId);

    if(!buyerUserId){
      throw new Error("Invalid buyerUserId.");
    }

    const hmac = crypto.createHmac("sha256", process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signature = Buffer.from(req.headers.get("X-Signature") || "", "utf8");
    console.log(`signatue:`, req.headers.get("X-Signature"));
    console.log(`digest:`, digest);
    console.log(`signature:`, signature);

    if (!crypto.timingSafeEqual(digest, signature)) {
      throw new Error("Invalid signature.");
    }

    // Validate `buyerUserId`
    // we are only making the subscription true you have to add the webhook and listen to subscription events and update the subscription status accordingly
    const buyer = await client.user.update({
      where: { id: buyerUserId },
      data:{subscription:true}
    });

    // console.log(`Event:buyer`, buyer);

    if (!buyer) {
      return Response.json({ message: "Cannot update the subscription.", status: 404 });
    }

    return Response.json({ data: buyer, status: 200 });
  } catch (e) {
    console.error("Error in POST handler:", e);
    return Response.json({ message: "Internal Server Error", status: 500 });
  }
}
