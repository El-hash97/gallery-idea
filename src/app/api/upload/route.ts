import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSessionAdminId } from "@/lib/auth";
import { MAX_FILE_BYTES } from "@/lib/validation";

const ALLOWED_CONTENT_TYPES = [
  "image/*",
  "video/*",
  "text/html",
  "text/css",
  "application/json",
  "text/javascript",
  "application/javascript",
  "model/gltf-binary",
  "application/octet-stream",
];

export async function POST(request: Request) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: MAX_FILE_BYTES,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload gagal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
