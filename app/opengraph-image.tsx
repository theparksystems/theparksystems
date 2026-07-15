import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  const picks = [
    ["Crude Oil", "Hold", "#5D76FF"],
    ["Silver", "Buy", "#58C977"],
    ["Real Estate", "Sell", "#FF5A61"],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 30,
          background: "#101116",
          color: "#F8F8FB",
          padding: 58,
          fontFamily: "monospace",
        }}
      >
        <div style={{ color: "#FF5A61", fontSize: 34, fontWeight: 900 }}>
          PARKS MODEL // LACI
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#171820",
            border: "2px solid rgba(215,220,240,0.42)",
            padding: 40,
            gap: 26,
          }}
        >
          <div style={{ fontSize: 78, fontWeight: 900, lineHeight: 0.95 }}>
            ARIA Analyst Picks
          </div>
          <div style={{ color: "#DDE1EC", fontSize: 28, fontWeight: 700 }}>
            Browser-local PARKS conversation memory
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            {picks.map(([market, call, color]) => (
              <div
                key={market}
                style={{
                  width: 320,
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  background: "#1B1C25",
                  border: `2px solid ${color}`,
                  padding: 24,
                }}
              >
                <div style={{ color, fontSize: 34, fontWeight: 900 }}>
                  {market}
                </div>
                <div
                  style={{
                    alignSelf: "flex-start",
                    color,
                    fontSize: 48,
                    fontWeight: 900,
                    textTransform: "uppercase",
                  }}
                >
                  {call}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
