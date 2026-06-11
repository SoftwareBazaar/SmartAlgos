import { Link, useRouterState } from "@tanstack/react-router";
import {
  LineChart, FlaskConical, FileText, MessageCircle, Info, Mail,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { company } from "@/lib/mock-data";

const groups = [
  {
    label: "Platform",
    items: [
      { title: "Research", url: "/research", icon: FileText },
      { title: "Strategies", url: "/strategies", icon: FlaskConical },
      { title: "Performance", url: "/performance", icon: LineChart },
      { title: "Consultation", url: "/consultation", icon: MessageCircle },
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
  const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gold text-primary-foreground">
            <span className="font-display text-base font-bold">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold tracking-wide">SMART ALGOS</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Capital</span>
          </div>
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
      <SidebarFooter className="border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground leading-snug px-1">
          {company.operator}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
