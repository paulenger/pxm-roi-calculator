import { renderToBuffer } from "@react-pdf/renderer";
import { UserGuidePDF } from "@/lib/user-guide-pdf";
import React from "react";

export async function GET() {
  const buffer = await renderToBuffer(<UserGuidePDF />);
  const uint8 = new Uint8Array(buffer);
  return new Response(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="PXM_ROI_Calculator_User_Guide.pdf"',
    },
  });
}
