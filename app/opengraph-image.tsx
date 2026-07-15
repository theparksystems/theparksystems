import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  const picks = [
    ["Crude Oil", "Hold", "#8A5B12", "#F8E8BC"],
    ["Silver", "Buy", "#0D7A4F", "#DFF6E8"],
    ["Real Estate", "Sell", "#B4232D", "#FFE1DF"],
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
          background: "#07110F",
          color: "#15211E",
          padding: 58,
          fontFamily: "Arial",
        }}
      >
        <div style={{ color: "#F7F1E6", fontSize: 34, fontWeight: 800 }}>
          THE PARK SYSTEMS
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#F7F1E6",
            borderRadius: 38,
            padding: 44,
            gap: 26,
          }}
        >
          <div style={{ fontSize: 86, fontWeight: 900, lineHeight: 0.95 }}>
            Analyst Picks
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            {picks.map(([market, call, color, bg]) => (
              <div
                key={market}
                style={{
                  width: 320,
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  background: "#FFFAF0",
                  border: "2px solid rgba(21, 33, 30, 0.14)",
                  borderRadius: 22,
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 34, fontWeight: 900 }}>{market}</div>
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: bg,
                    color,
                    borderRadius: 16,
                    padding: "14px 22px",
                    fontSize: 30,
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
