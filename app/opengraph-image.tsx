import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0A",
          color: "#E5E5E5",
          padding: 64,
          fontFamily: "monospace",
          border: "2px solid #FF2A2A",
        }}
      >
        <div style={{ color: "#FF2A2A", fontSize: 28, fontWeight: 800 }}>
          THE PARK SYSTEMS // BOUNTY CELL OPERATIONS
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 86,
            fontWeight: 900,
            lineHeight: 0.95,
          }}
        >
          <span>SCOUT.</span>
          <span>STRIKE.</span>
          <span>EXTRACT.</span>
        </div>
        <div style={{ color: "#A3A3A3", fontSize: 28 }}>
          Autonomous teams that hunt 24/7.
        </div>
      </div>
    ),
    size,
  );
}
