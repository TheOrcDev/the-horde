import { ImageResponse } from "next/og";
import {
  type CardClass,
  type CardRole,
  CLASS_DISPLAY,
  ROLE_DISPLAY,
} from "@/lib/card-schema";
import { timezoneShortLabel } from "@/lib/timezones";
import { getCardByHandle } from "@/server/cards";

export const revalidate = 3600;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const AVATAR_SIZE = 280;
const FETCH_TIMEOUT_MS = 2500;

type HandleParams = Promise<{ handle: string }>;

const toDataUrl = async (avatarUrl: string) => {
  try {
    const response = await fetch(new URL(avatarUrl), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    const mime = response.headers.get("content-type") ?? "image/jpeg";
    const bytes = Buffer.from(await response.arrayBuffer()).toString("base64");
    return `data:${mime};base64,${bytes}`;
  } catch {
    return null;
  }
};

const badgeLine = (cardClass: CardClass, role: CardRole, timezone: string) =>
  `${CLASS_DISPLAY[cardClass]} · ${ROLE_DISPLAY[role]} · ${timezoneShortLabel(timezone)}`;

export default async function CardOpengraphImage({
  params,
}: {
  params: HandleParams;
}) {
  const { handle } = await params;
  const result = await getCardByHandle(handle);
  const title = result?.card.title ?? "Wanted";
  const cardHandle = result?.card.handle ?? handle.toLowerCase();
  const cardClass = result?.card.class ?? "grunt";
  const role = result?.card.role ?? "dps";
  const timezone = result?.card.timezone ?? "UTC";
  const avatarSrc = result?.card.avatarUrl
    ? await toDataUrl(result.card.avatarUrl)
    : null;
  const initial = result?.card.displayName.at(0) ?? cardHandle.at(0) ?? "?";

  return new ImageResponse(
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: "flex",
        background: "#140b0b",
        color: "#fff7ed",
        padding: 64,
        gap: 48,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          border: "8px solid #92400e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1917",
          overflow: "hidden",
        }}
      >
        {avatarSrc ? (
          // biome-ignore lint/performance/noImgElement: ImageResponse cannot use next/image
          <img
            alt={title}
            height={AVATAR_SIZE}
            src={avatarSrc}
            style={{
              height: AVATAR_SIZE,
              objectFit: "cover",
              width: AVATAR_SIZE,
            }}
            width={AVATAR_SIZE}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#fbbf24",
              fontSize: 96,
              fontWeight: 700,
            }}
          >
            <span>☠</span>
            <span style={{ fontSize: 40 }}>{initial}</span>
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 10,
            color: "#fcd34d",
            fontWeight: 700,
          }}
        >
          WANTED
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ fontSize: 32, color: "#fde68a" }}>@{cardHandle}</div>
        <div style={{ fontSize: 24, color: "#e7e5e4" }}>
          {badgeLine(cardClass, role, timezone)}
        </div>
      </div>
    </div>,
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
    }
  );
}
