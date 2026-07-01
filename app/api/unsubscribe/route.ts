import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubToken } from "@/lib/unsubscribe";

// One-click unsubscribe target (also referenced by the List-Unsubscribe header).
export async function GET(request: NextRequest) {
  const contactId = request.nextUrl.searchParams.get("c") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";

  if (!contactId || !verifyUnsubToken(contactId, token)) {
    return new NextResponse("קישור לא תקין", { status: 400 });
  }

  await prisma.contact.update({
    where: { id: contactId },
    data: { subscribed: false },
  });

  // Pause any active enrollments for this contact.
  await prisma.enrollment.updateMany({
    where: { contactId, status: "active" },
    data: { status: "unsubscribed", nextRunAt: null },
  });

  return new NextResponse(
    `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><body style="font-family:sans-serif;text-align:center;padding:48px">
     <h1>הוסרת מרשימת התפוצה</h1><p>לא תקבל/י עוד מיילים מסדרה זו.</p></body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

// RFC 8058 one-click POST unsubscribe.
export async function POST(request: NextRequest) {
  return GET(request);
}
