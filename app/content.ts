export const signalTags = [
  "LACI",
  "VESTRA",
  "GARI",
  "LILA",
  "OPS",
  "RESEARCH",
  "THE PARK",
  "LOCAL-FIRST",
];

export const posts = [
  {
    slug: "public-node-online",
    date: "2026.07.12",
    domain: "BUILD",
    title: "Public node online",
    summary:
      "The PARKSystems public surface moves to a cleaner static frontend while LACI remains private and local.",
    body: [
      "This is the first placeholder transmission for the new public site. Replace this copy with finished analysis from C:\\laci when a note is ready to publish.",
      "The site is intentionally static for now. The publishing workflow is manual: write inside LACI, copy the selected output, paste it into this feed, and deploy through the connected repo.",
      "The goal is a public surface that feels operational without exposing the private operating system behind it.",
    ],
  },
  {
    slug: "manual-publishing-protocol",
    date: "2026.07.12",
    domain: "LACI",
    title: "Manual publishing protocol",
    summary:
      "A simple copy-paste path for selected LACI analysis before adding databases, logins, or automation.",
    body: [
      "Keep the first version boring on purpose: no admin panel, no hidden CMS, no premature data layer.",
      "Each public note should carry a title, date, domain, summary, and body. That is enough to make the feed useful while the product direction settles.",
      "When the content cadence is real, the same structure can move into storage or an editor without redesigning the public experience.",
    ],
  },
  {
    slug: "sovereign-stack-notes",
    date: "2026.07.12",
    domain: "RESEARCH",
    title: "Sovereign stack notes",
    summary:
      "Local compute, durable context, and public artifacts separated by a deliberate publishing boundary.",
    body: [
      "The public site should explain what is safe to say. The private stack should decide what is true enough to publish.",
      "That separation lets PARKSystems keep the operational surface protected while still shipping field notes, product signals, and research updates.",
      "The boundary is the product: public readers get clarity, private operators keep control.",
    ],
  },
];

export const divisions = [
  {
    code: "01 // LACI",
    name: "Local Autonomous Context Interface",
    description:
      "The private operating layer for analysis, memory, and decision support.",
  },
  {
    code: "02 // VESTRA",
    name: "Vestra Intelligence Graph",
    description:
      "Graph-native orchestration for crews, assets, energy, and operational provenance.",
  },
  {
    code: "03 // GARI",
    name: "GARI Worldwide",
    description:
      "Hardware distribution and field-deployable infrastructure for sovereign systems.",
  },
  {
    code: "04 // LILA",
    name: "Lila Broadcast Layer",
    description:
      "The public voice for selected signals, build notes, and authored dispatches.",
  },
];

export const operatingNotes = [
  "Private work stays in C:\\laci until a note is ready for public release.",
  "Public pages are static, fast, and readable without a login.",
  "The design favors signal density without the old control-room clutter.",
  "Future automation can attach to the same feed structure without changing the front door.",
];
