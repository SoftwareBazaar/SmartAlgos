import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, LineChart, FlaskConical, FileText, MessageCircle,
  Cpu, Info, Mail, ShieldCheck,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { DonateButton } from "@/components/donate-button";
import { company } from "@/lib/mock-data";

const groups = [
  {
    label: "Platform",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Performance", url: "/performance", icon: LineChart },
      { title: "Alpha Portfolio", url: "/alpha-portfolio", icon: FlaskConical },
      { title: "Research", url: "/research", icon: FileText },
      { title: "Consultation", url: "/consultation", icon: MessageCircle },
      { title: "Technology Division", url: "/technology", icon: Cpu },
    ],
  },
  {
    label: "Client Portal",
    items: [
      { title: "Client Dashboard", url: "/client-dashboard", icon: ShieldCheck },
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
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
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
      <SidebarFooter className="border-t border-sidebar-border flex flex-col gap-2">
        <DonateButton />
        <p className="text-[10px] text-muted-foreground leading-snug px-1">
          {company.operator}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
