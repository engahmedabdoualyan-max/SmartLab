import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (p: P) => {
  const { size = 20, ...rest } = p;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
};

export const IconGauge = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 14a8 8 0 1 1 16 0" />
    <path d="M12 14l3.5-4.5" />
    <path d="M2.5 14h3M18.5 14h3M12 4.5v2.5" />
    <path d="M6 19.5h12" />
  </svg>
);

export const IconChip = (p: P) => (
  <svg {...base(p)}>
    <rect x="7" y="7" width="10" height="10" rx="1" />
    <rect x="10" y="10" width="4" height="4" />
    <path d="M9 7V3.5M15 7V3.5M9 20.5V17M15 20.5V17M7 9H3.5M7 15H3.5M20.5 9H17M20.5 15H17" />
  </svg>
);

export const IconScale = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="7.5" rx="7" ry="2.8" />
    <path d="M5 7.5v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6" />
    <path d="M12 10.3v3.2M9 16.8l-1 3.7M15 16.8l1 3.7" />
  </svg>
);

export const IconScreen = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="6" width="18" height="11" rx="1" />
    <path d="M6 9.5h7M6 12h4.5" />
    <path d="M8 20h8M12 17v3" />
  </svg>
);

export const IconWarn = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5L2.5 20h19L12 3.5z" />
    <path d="M12 9.5v5" />
    <circle cx="12" cy="17.2" r="0.4" fill="currentColor" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12.5l5 5L19.5 7" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l7.5 3v5.5c0 4.6-3 8-7.5 9.5-4.5-1.5-7.5-4.9-7.5-9.5V6L12 3z" />
    <path d="M9 11.8l2.2 2.2L15.5 9.5" />
  </svg>
);

export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z" />
  </svg>
);

export const IconPrint = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 8V3.5h10V8" />
    <rect x="4" y="8" width="16" height="8" rx="1" />
    <path d="M7 13h10v7.5H7z" />
    <path d="M16.8 10.8h.4" />
  </svg>
);

export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="1.5" />
    <path d="M15.5 5.5v-1a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 4.5V14a1.5 1.5 0 0 0 1.5 1.5h1" />
  </svg>
);

export const IconDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5v11M12 14.5l-4.5-4.5M12 14.5l4.5-4.5" />
    <path d="M4 17.5v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
  </svg>
);

export const IconArrowLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 12H5M5 12l6-6M5 12l6 6" />
  </svg>
);

export const IconArrowDown = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M12 19l-6-6M12 19l6-6" />
  </svg>
);

export const IconRuler = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="9" width="19" height="6" rx="1" transform="rotate(-18 12 12)" />
    <path d="M7.2 12.9l.9 2.6M10.7 11.7l.6 1.8M14.2 10.6l.9 2.6M17.7 9.4l.6 1.8" />
  </svg>
);

export const IconCalc = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="3" width="14" height="18" rx="1.5" />
    <path d="M8 7h8" />
    <path d="M8.2 12h.4M11.8 12h.4M15.4 12h.4M8.2 15.5h.4M11.8 15.5h.4M15.4 15.5h.4" strokeWidth="2.4" />
  </svg>
);

export const IconSerial = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4.5" width="18" height="13" rx="1.5" />
    <path d="M6.5 9l3 2.5-3 2.5M11.5 14.5h5" />
    <path d="M9 21h6" />
  </svg>
);

export const IconFlag = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 21V4" />
    <path d="M5.5 4.5c4-2 6.5 2 11 0v9c-4.5 2-7-2-11 0" />
  </svg>
);

export const IconHelmet = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 15a8 8 0 0 1 16 0" />
    <path d="M2.8 15h18.4v2.2H2.8z" />
    <path d="M10 7.2V5h4v2.2" />
  </svg>
);

export const IconPlug = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 3.5V8M15 3.5V8" />
    <path d="M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0V8z" />
    <path d="M12 17v3.5" />
  </svg>
);

export const IconBook = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 5a2 2 0 0 1 2-2h14v16.5H6a2 2 0 0 0-2 2V5z" />
    <path d="M4 19.5A2 2 0 0 1 6 17.5h14" />
    <path d="M9 7.5h7M9 11h5" />
  </svg>
);

export const IconCrack = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="1" />
    <path d="M12 4l-2 5 3.5 3-2.5 8" />
  </svg>
);
