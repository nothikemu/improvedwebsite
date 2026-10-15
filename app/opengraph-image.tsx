import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TAGLINE = "code, computers, music, games, robots";

/** A static Archivo instance subset to `text`. Null if Google Fonts can't be reached. */
async function archivo(text: string, wdth: number, wght: number): Promise<ArrayBuffer | null> {
  "use cache";
  cacheLife("max");
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@${wdth},${wght}&text=${encodeURIComponent(text)}`,
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [display, body] = await Promise.all([
    archivo(site.name, 125, 800),
    archivo(`@${site.handle}${TAGLINE}`, 100, 500),
  ]);

  const fonts = [
    display && { name: "Archivo Expanded", data: display, weight: 800 as const },
    body && { name: "Archivo", data: body, weight: 500 as const },
  ].filter((f) => f !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0c0d0e",
          color: "#e8e7e3",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, color: "#8f9095" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#8b9dff" }} />
          {`@${site.handle}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Archivo Expanded",
              fontSize: 230,
              lineHeight: 0.85,
              letterSpacing: "-0.02em",
              marginLeft: -10,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: "2px solid #222428",
              fontSize: 34,
              color: "#8f9095",
            }}
          >
            {TAGLINE}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
