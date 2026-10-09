import { Sidebar } from "@whb/ui";

const NAV_SECTIONS = [
  {
    key: "family",
    label: "Family",
    items: [
      { id: "overview", label: "Overview", icon: "stylus_note", href: "/parent" },
      { id: "children", label: "Children", icon: "family_restroom", href: "/parent" },
      { id: "uploads", label: "Uploads", icon: "upload_file", href: "/parent/library" },
    ],
  },
  {
    key: "growth",
    label: "Growth",
    items: [
      { id: "scholarships", label: "Scholarships", icon: "volunteer_activism", href: "/parent" },
      { id: "classes", label: "Live classes", icon: "meeting_room", href: "/parent" },
    ],
  },
  {
    key: "account",
    label: "Account",
    items: [
      { id: "settings", label: "Settings", icon: "settings", href: "/parent" },
      { id: "billing", label: "Subscription", icon: "credit_card", href: "/parent" },
    ],
  },
];

export function ParentSidebar({ activeId, tagline }: { activeId: string; tagline: string }) {
  return (
    <Sidebar
      brand="WhiteBoard"
      tagline={tagline}
      sections={NAV_SECTIONS}
      activeId={activeId}
      className="sticky top-0 h-dvh"
    />
  );
}
