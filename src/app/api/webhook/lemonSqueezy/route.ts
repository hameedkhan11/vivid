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

    const { projectId, buyerUserId, secret } = body.meta.custom_data;

    if(!projectId || !buyerUserId || !secret){
      return Response.json({ message: "Invalid request.", status: 400 });
    }


    // console.log(`projectId:`, projectId);
    // console.log(`buyerUserId:`, buyerUserId);


    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signature = Buffer.from(req.headers.get("X-Signature") || "", "utf8");
    // console.log(`signatue:`, req.headers.get("X-Signature"));
    // console.log(`digest:`, digest);
    // console.log(`signature:`, signature);

    if (!crypto.timingSafeEqual(digest, signature)) {
      throw new Error("Invalid signature.");
    }

    // Validate `buyerUserId`
    const buyer = await client.user.findUnique({
      where: { id: buyerUserId },
    });

    if (!buyer) {
      return Response.json({ message: "Buyer user not found.", status: 404 });
    }

    // Fetch the project to ensure it exists
    const project = await client.project.update({
      where: { id: projectId },
      data: {
        Purchasers: {
          connect: {
            id: buyerUserId,
          },
        },
      },
    });

    if (!project) {
      return Response.json({ message: "Project not found.", status: 404 });
    }

    // console.log(`project:`, project);

    const { slides, outlines, title } = project;

    // Validate project fields
    if (!slides || !outlines || !title) {
      return Response.json({
        message: "Project data is incomplete.",
        status: 400,
      });
    }

    // Create a new project for the buyer

    const createProject = await client.project.create({
      data: {
        title: title,
        outlines: outlines,
        slides: slides,
        thumbnail: "https://placehold.co/600x400", // Add a placeholder if needed
        userId: buyerUserId,
      },
    });

    // console.log(`createProject:`, createProject);

    if (!createProject) {
      return Response.json({
        message: "Failed to create project.",
        status: 500,
      });
    }

    // console.log(`createProject:`, createProject);

    return Response.json({ data: createProject, status: 200 });
  } catch (e) {
    console.error("Error in POST handler:", e);
    return Response.json({ message: "Internal Server Error", status: 500 });
  }
}
