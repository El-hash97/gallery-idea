import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getSessionAdminId } from "@/lib/auth";

export async function POST() {
  if (!(await getSessionAdminId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const blob = await put("selftest/tes.txt", `smoke test ${new Date().toISOString()}`, {
      access: "public",
      addRandomSuffix: true,
      contentType: "text/plain",
    });
    await del(blob.url);
    return NextResponse.json({ ok: true, url: blob.url, pathname: blob.pathname });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blob test gagal";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
