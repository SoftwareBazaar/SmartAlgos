import { Link, useRouterState } from "@tanstack/react-router";
import {
  LineChart, FlaskConical, FileText, MessageCircle, Info, Mail, User,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { BrandLogo } from "@/components/brand-logo";
import { useSidebar } from "@/components/ui/sidebar";

const groups = [
  {
    label: "Platform",
    items: [
      { title: "Research", url: "/research", icon: FileText },
      { title: "Strategies", url: "/strategies", icon: FlaskConical },
      { title: "Performance", url: "/performance", icon: LineChart },
      { title: "Consultation", url: "/consultation", icon: MessageCircle },
      { title: "My Account", url: "/account", icon: User },
    ],
  },
  {
    label: "Company",
    items: [
      { title: "About", url: "/about", icon: Info },
      { title: "Contact", url: "/contact", icon: Mail },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { open } = useSidebar();
  const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center px-2 py-3">
          <BrandLogo variant="sidebar" iconOnly={!open} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border" />

    </Sidebar>
  );
}
