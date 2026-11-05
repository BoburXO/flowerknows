import { ImageResponse } from "next/og";

export const alt = "Flower Knows Uzbekistan — Vintage Rococo Cosmetics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FAF6F0 0%, #F7D6D0 55%, #EADCCF 100%)",
          color: "#3D332A",
          fontFamily: "Georgia, serif",
          border: "18px solid #FAF6F0",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 10, color: "#D47A75" }}>
          VINTAGE ROCOCO COSMETICS
        </div>
        <div style={{ display: "flex", fontSize: 128, letterSpacing: 18, marginTop: 24, fontWeight: 700 }}>
          FLOWER KNOWS
        </div>
        <div style={{ display: "flex", fontSize: 40, letterSpacing: 14, marginTop: 12, color: "#7E6F62" }}>
          UZBEKISTAN
        </div>
        <div style={{ display: "flex", width: 220, height: 3, background: "#D4AF37", marginTop: 40 }} />
        <div style={{ display: "flex", fontSize: 28, marginTop: 28, color: "#66584C" }}>
          @flowerknows.uzb  •  t.me/flowerknowsuzb
        </div>
      </div>
    ),
    { ...size }
  );
}
