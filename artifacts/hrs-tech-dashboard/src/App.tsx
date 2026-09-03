import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Archive,
  ArrowDown,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  Download,
  CreditCard,
  FileBarChart,
  Fingerprint,
  Globe2,
  KeyRound,
  ListFilter,
  LockKeyhole,
  Menu,
  MonitorCog,
  MoreHorizontal,
  Network,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  Smartphone,
  SlidersHorizontal,
  UserCheck,
  UserCog,
  Users,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import {
  Link,
  Route,
  Switch,
  Router as WouterRouter,
  useLocation,
} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createUser, listUsers, updateUserStatus } from "@/lib/users-api";

const queryClient = new QueryClient();
const logoPath = "/hrs-tech-logo.png";

type NoticeTone = "success" | "warning" | "info";
type Notify = (message: string, tone?: NoticeTone) => void;

type UserRecord = {
  id: string;
  initials: string;
  name: string;
  employeeId: string;
  department: string;
  title: string;
  group: string;
  type: "Employee" | "Contractor";
  status: "Active" | "Suspended";
  lastSeen: string;
};

const initialUsers: UserRecord[] = [
  { id: "1", initials: "AR", name: "Amaya Rao", employeeId: "EMP-19321", department: "Facilities", title: "Facilities Manager", group: "Facilities — Standard", type: "Employee", status: "Active", lastSeen: "Today, 08:42" },
  { id: "2", initials: "DO", name: "Daniel Osei", employeeId: "EMP-18456", department: "IT Infrastructure", title: "Network Engineer", group: "IT — Server Rooms", type: "Employee", status: "Active", lastSeen: "Today, 08:31" },
  { id: "3", initials: "MK", name: "Marta Kowalski", employeeId: "EMP-19812", department: "HR", title: "HR Administrator", group: "HR — Standard", type: "Employee", status: "Active", lastSeen: "Today, 08:17" },
  { id: "4", initials: "JB", name: "Jonas Berg", employeeId: "CTR-20844", department: "Vendor — ACME MEP", title: "HVAC Contractor", group: "Contractor — Mechanical", type: "Contractor", status: "Active", lastSeen: "Yesterday, 16:20" },
  { id: "5", initials: "FA", name: "Fatima Al-Sayed", employeeId: "EMP-11023", department: "Security", title: "Security Operator", group: "Security — Full", type: "Employee", status: "Active", lastSeen: "Today, 07:55" },
  { id: "6", initials: "SC", name: "Sophie Chen", employeeId: "EMP-17704", department: "Finance", title: "Finance Controller", group: "Finance — Restricted", type: "Employee", status: "Suspended", lastSeen: "14 Mar 2025, 17:04" },
  { id: "7", initials: "TN", name: "Tomas Novak", employeeId: "EMP-20318", department: "Product", title: "Product Director", group: "HQ — Standard", type: "Employee", status: "Active", lastSeen: "Today, 09:03" },
  { id: "8", initials: "LP", name: "Leah Park", employeeId: "CTR-20911", department: "Visitor Services", title: "Reception Partner", group: "Contractor — Front Desk", type: "Contractor", status: "Active", lastSeen: "Today, 08:12" },
];

const navGroups: { label: string; items: { label: string; icon: LucideIcon; href?: string; badge?: string }[] }[] = [
  {
    label: "HRS TECH VIEW",
    items: [
      { label: "User Management", icon: Users, href: "/users" },
      { label: "Mobile Users", icon: UserRound, href: "/mobile-users" },
      { label: "Credential Management", icon: Fingerprint, href: "/credentials" },
      { label: "Access Management", icon: KeyRound, href: "/access" },
      { label: "Attendance Management", icon: ClipboardList, href: "/attendance" },
      { label: "Visitor Management", icon: UsersRound, href: "/visitors" },
      { label: "Reports", icon: FileBarChart, href: "/reports" },
      { label: "Requests", icon: Archive, href: "/requests" },
      { label: "Dashboard Analytics", icon: BarChart3, href: "/analytics" },
      { label: "Settings", icon: Settings, href: "/settings" },
    ],
  },
  {
    label: "SECURITY VIEW",
    items: [
      { label: "Real-Time Monitoring", icon: Activity, href: "/monitoring" },
      { label: "Controller Management", icon: MonitorCog, href: "/controllers" },
      { label: "Area Control", icon: DoorOpen, href: "/areas" },
      { label: "Logical Area Control", icon: Network, href: "/logical-areas" },
      { label: "Alarm Management", icon: Bell, href: "/alarms", badge: "3" },
      { label: "Zone Draw", icon: SlidersHorizontal },
    ],
  },
  {
    label: "PLATFORM",
    items: [{ label: "Cross-Cutting Requirements", icon: Zap, href: "/requirements" }],
  },
];

function LogoMark() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-[5px] bg-slate-100 p-0.5 shadow-[0_0_0_1px_rgba(255,255,255,.14)]">
        {!failed ? (
          <img
            src={logoPath}
            alt="HRS Tech logo"
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
            data-testid="img-hrs-tech-logo"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[#1458d9] text-[13px] font-bold text-white" data-testid="fallback-hrs-tech-logo">H</span>
        )}
      </div>
      <div className="min-w-0 leading-none">
        <div className="truncate text-[12px] font-bold tracking-[.08em] text-slate-100">HRS TECH</div>
        <div className="mt-1 truncate text-[8px] tracking-[.08em] text-slate-500">SECURITY PLATFORM</div>
      </div>
    </div>
  );
}

function Sidebar({ compact, onClose, notify }: { compact: boolean; onClose: () => void; notify: Notify }) {
  const [location, setLocation] = useLocation();
  const selected = location.includes("requirements") ? "Cross-Cutting Requirements" : location.includes("mobile-users") ? "Mobile Users" : location.includes("credentials") ? "Credential Management" : location.includes("access") ? "Access Management" : location.includes("attendance") ? "Attendance Management" : location.includes("visitors") ? "Visitor Management" : location.includes("reports") ? "Reports" : location.includes("requests") ? "Requests" : location.includes("analytics") ? "Dashboard Analytics" : location.includes("settings") ? "Settings" : location.includes("monitoring") ? "Real-Time Monitoring" : location.includes("controllers") ? "Controller Management" : location.includes("areas") ? "Area Control" : location.includes("logical-areas") ? "Logical Area Control" : location.includes("alarms") ? "Alarm Management" : location.includes("users") || location === "/" ? "User Management" : "";

  const handleUnavailable = (label: string) => {
    notify(`${label} is available in the connected operations environment.`, "info");
    onClose();
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col border-r border-slate-800/80 bg-[#0b1421] transition-transform duration-200 md:translate-x-0 ${compact ? "-translate-x-full" : "translate-x-0"}`} data-testid="sidebar-navigation">
      <div className="flex h-[54px] items-center justify-between border-b border-slate-800/80 px-4">
        <Link href="/users" className="block" onClick={onClose} data-testid="link-hrs-tech-home"><LogoMark /></Link>
        <button className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200 md:hidden" onClick={onClose} data-testid="button-close-sidebar" aria-label="Close navigation"><X size={16} /></button>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-2.5 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="mb-2 px-2 text-[9px] font-semibold tracking-[.16em] text-slate-600">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = selected === item.label;
                return item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex h-[30px] items-center gap-2 rounded-[4px] px-2.5 text-[11px] transition-colors ${active ? "bg-[#064b49] font-semibold text-[#24e0c5] shadow-[inset_2px_0_0_#20d7be]" : "text-slate-400 hover:bg-slate-800/75 hover:text-slate-200"}`}
                    data-testid={`link-nav-${item.label.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    <Icon size={14} strokeWidth={1.65} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && <span className="ml-auto rounded bg-rose-500/15 px-1.5 py-0.5 text-[9px] text-rose-300">{item.badge}</span>}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    onClick={() => handleUnavailable(item.label)}
                    className="group flex h-[30px] w-full items-center gap-2 rounded-[4px] px-2.5 text-left text-[11px] text-slate-400 transition-colors hover:bg-slate-800/75 hover:text-slate-200"
                    data-testid={`button-nav-${item.label.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    <Icon size={14} strokeWidth={1.65} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && <span className="ml-auto rounded bg-rose-500/15 px-1.5 py-0.5 text-[9px] text-rose-300">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-800/80 p-3">
        <div className="flex items-center gap-2 rounded-[5px] bg-[#111e2e] px-2.5 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-[10px] font-semibold text-cyan-300">PN</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-medium text-slate-200">Priya Nair</div>
            <div className="truncate text-[9px] text-slate-500">Platform Administrator</div>
          </div>
          <button className="text-slate-500 hover:text-slate-200" onClick={() => setLocation("/users")} data-testid="button-account-menu" aria-label="Open account menu"><MoreHorizontal size={15} /></button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ onMenu, notify }: { onMenu: () => void; notify: Notify }) {
  const [search, setSearch] = useState("");
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-[54px] items-center border-b border-slate-800/80 bg-[#0b1421]/95 px-3 backdrop-blur md:left-[232px] md:px-5">
      <button className="mr-3 rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 md:hidden" onClick={onMenu} data-testid="button-open-sidebar" aria-label="Open navigation"><Menu size={18} /></button>
      <div className="relative hidden min-w-0 max-w-[440px] flex-1 md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && search) notify(`Searching the platform for “${search}”.`, "info"); }} className="h-8 w-full rounded-[4px] border border-slate-800 bg-[#111e2e] pl-9 pr-3 text-[11px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/60" placeholder="Search users, credentials, devices, reports..." data-testid="input-global-search" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="hidden h-8 items-center gap-2 rounded-[4px] border border-slate-800 bg-[#111e2e] px-3 text-[10px] text-slate-300 hover:border-slate-700 sm:flex" onClick={() => notify("North Wing control context selected.", "info")} data-testid="button-location-selector">HQ — North Wing <ChevronDown size={12} className="text-slate-500" /></button>
        <div className="hidden rounded-[4px] border border-slate-800 bg-[#111e2e] px-2.5 py-[7px] text-[9px] font-semibold tracking-[.08em] text-slate-500 lg:block">WIREFRAME</div>
        <div className="rounded-[4px] bg-[#18d4bc] px-2.5 py-[7px] text-[9px] font-bold tracking-[.08em] text-[#062d31]">PROTOTYPE</div>
        <button className="relative rounded p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200" onClick={() => notify("No new platform alerts.", "info")} data-testid="button-alerts" aria-label="View alerts"><Bell size={15} /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-400" /></button>
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-[#17263a] text-[9px] font-semibold text-slate-300" data-testid="avatar-current-user">PN</div>
      </div>
    </header>
  );
}

function Badge({ status }: { status: "Active" | "Suspended" }) {
  return <span className={`inline-flex items-center gap-1 rounded-[10px] px-2 py-[3px] text-[9px] font-semibold ${status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-300"}`} data-testid={`status-user-${status.toLowerCase()}`}><span className={`h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-emerald-400" : "bg-amber-300"}`} />{status}</span>;
}

function StatCard({ label, value, detail, tone = "normal", icon: Icon }: { label: string; value: string; detail: string; tone?: "normal" | "good" | "warning"; icon: LucideIcon }) {
  return (
    <div className="control-surface relative min-h-[84px] overflow-hidden rounded-[6px] p-3.5">
      <Icon size={30} strokeWidth={1} className="absolute -right-1 -top-1 text-slate-800/70" />
      <div className="text-[9px] font-semibold tracking-[.1em] text-slate-500">{label}</div>
      <div className={`mono mt-2 text-[21px] font-semibold leading-none ${tone === "good" ? "text-emerald-400" : tone === "warning" ? "text-amber-300" : "text-slate-100"}`} data-testid={`text-stat-${label.toLowerCase().replaceAll(" ", "-")}`}>{value}</div>
      <div className="mt-2 text-[9px] text-slate-600">{detail}</div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mono mb-1.5 text-[9px] font-semibold tracking-[.16em] text-[#20d7be]">{eyebrow}</div>
        <h1 className="text-[19px] font-semibold tracking-[-.02em] text-slate-100 sm:text-[20px]" data-testid={`heading-${title.toLowerCase().replaceAll(" ", "-")}`}>{title}</h1>
        <p className="mt-1 max-w-[680px] text-[10px] leading-4 text-slate-500">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

function Button({ children, onClick, kind = "secondary", icon: Icon, testId, disabled = false, type = "button" }: { children: React.ReactNode; onClick: () => void; kind?: "primary" | "secondary" | "quiet" | "danger"; icon?: LucideIcon; testId: string; disabled?: boolean; type?: "button" | "submit" }) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-[4px] px-3 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${kind === "primary" ? "bg-[#12cdb7] text-[#062d31] hover:bg-[#27e2ca]" : kind === "danger" ? "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/15" : kind === "quiet" ? "text-slate-500 hover:bg-slate-800 hover:text-slate-200" : "border border-slate-700/90 bg-[#152235] text-slate-300 hover:border-slate-600 hover:bg-[#1a2b42]"}`} data-testid={testId}>{Icon && <Icon size={13} />} {children}</button>;
}

function CredentialIssueModal({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [activeTab, setActiveTab] = useState<"Summary" | "Cards" | "Biometrics" | "Dynamic QR" | "Mobile ID">("Summary");
  const [cardNumber, setCardNumber] = useState("");
  const [cardFormat, setCardFormat] = useState("MIFARE DESFire EV2");
  const [issueDate, setIssueDate] = useState("08/23/2026");
  const [expiryDate, setExpiryDate] = useState("08/23/2026");
  const [neverExpires, setNeverExpires] = useState(false);
  const [activateImmediately, setActivateImmediately] = useState(true);
  const [biometricExempt, setBiometricExempt] = useState(true);
  const [mobileIdExempt, setMobileIdExempt] = useState(false);
  const [assignedUser, setAssignedUser] = useState("Ananya Rao");
  const [credentialType, setCredentialType] = useState("Default");

  if (!open) return null;

  const tabOptions: Array<"Summary" | "Cards" | "Biometrics" | "Dynamic QR" | "Mobile ID"> = ["Summary", "Cards", "Biometrics", "Dynamic QR", "Mobile ID"];
  const cardOptions = ["MIFARE DESFire EV2", "HID Prox", "LEGIC Prime", "NFC SmartCard"];
  const credentialTypeOptions = ["Default", "Contractor", "Temporary"];

  const renderTabContent = () => {
    if (activeTab === "Summary") {
      return (
        <div className="space-y-4">
          <label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
            Assign to user
            <select value={assignedUser} onChange={(event) => setAssignedUser(event.target.value)} className="mt-2 h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-2 text-[12px] text-slate-100 outline-none focus:border-cyan-500/60">
              <option>Ananya Rao</option>
              <option>Daniel Osei</option>
              <option>Marta Kowalski</option>
              <option>Jonas Berg</option>
            </select>
          </label>

          <label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
            Credential type
            <select value={credentialType} onChange={(event) => setCredentialType(event.target.value)} className="mt-2 h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-2 text-[12px] text-slate-100 outline-none focus:border-cyan-500/60">
              {credentialTypeOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>

          <div className="flex items-center justify-between rounded-[6px] bg-[#0f1d2d] px-3 py-2.5 text-[10px] text-slate-300">
            <span>Biometric Exempt</span>
            <button type="button" onClick={() => setBiometricExempt((value) => !value)} className={`relative h-6 w-11 rounded-full transition-colors ${biometricExempt ? "bg-[#12cdb7]" : "bg-slate-700"}`} aria-label="Toggle biometric exemption">
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${biometricExempt ? "left-6" : "left-1"}`} />
            </button>
          </div>

          <div className="rounded-[7px] border border-slate-800 bg-[#112133] p-4 text-[12px] text-slate-300">
            <div className="mb-2 flex items-center gap-2 text-slate-200">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"><QrCode size={12} /></span>
              <span className="font-medium">Select credential type</span>
            </div>
            <div className="space-y-2 text-[10px] text-slate-400">
              <div className="rounded border border-slate-700 bg-[#0d1b2c] px-2 py-2">Summary</div>
              <div className="rounded border border-slate-700 bg-[#0d1b2c] px-2 py-2">Cards</div>
              <div className="rounded border border-slate-700 bg-[#0d1b2c] px-2 py-2">Biometrics</div>
              <div className="rounded border border-slate-700 bg-[#0d1b2c] px-2 py-2">Dynamic QR</div>
              <div className="rounded border border-slate-700 bg-[#0d1b2c] px-2 py-2">Mobile ID</div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "Cards") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
              Card number
              <input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} className="mt-2 h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-3 text-[12px] text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-500/60" placeholder="e.g. 88231198" />
            </label>
            <label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
              Card format
              <select value={cardFormat} onChange={(event) => setCardFormat(event.target.value)} className="mt-2 h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-2 text-[12px] text-slate-100 outline-none focus:border-cyan-500/60">
                {cardOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
              Issue date
              <div className="relative mt-2">
                <input value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className="h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-3 pr-10 text-[12px] text-slate-100 outline-none focus:border-cyan-500/60" />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><CalendarClock size={14} /></span>
              </div>
            </label>
            <label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
              Expiry date
              <div className="relative mt-2">
                <input value={neverExpires ? "Never" : expiryDate} onChange={(event) => setExpiryDate(event.target.value)} disabled={neverExpires} className="h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-3 pr-10 text-[12px] text-slate-100 outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-cyan-500/60" />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><CalendarClock size={14} /></span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-[6px] bg-[#0f1d2d] px-3 py-2.5 text-[10px] text-slate-300">
            <span>Never Expires</span>
            <button type="button" onClick={() => setNeverExpires((value) => !value)} className={`relative h-6 w-11 rounded-full transition-colors ${neverExpires ? "bg-[#12cdb7]" : "bg-slate-700"}`} aria-label="Toggle never expires">
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${neverExpires ? "left-6" : "left-1"}`} />
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === "Biometrics") {
      return (
        <div className="space-y-4">
          <div className="rounded-[7px] border border-slate-800 bg-[#101d2d] p-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-2 font-medium">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-cyan-500/10 text-cyan-300"><Fingerprint size={12} /></span>
              Biometrics enrollment is device-driven — connect a supported reader/scanner to continue.
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "Dynamic QR") {
      return (
        <div className="space-y-4">
          <div className="rounded-[7px] border border-slate-800 bg-[#101d2d] p-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-2 font-medium">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-cyan-500/10 text-cyan-300"><QrCode size={12} /></span>
              Dynamic QR enrollment is device-driven — connect a supported reader/scanner to continue.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
            Issue date
            <div className="relative mt-2">
              <input value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className="h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-3 pr-10 text-[12px] text-slate-100 outline-none focus:border-cyan-500/60" />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><CalendarClock size={14} /></span>
            </div>
          </label>
          <label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
            Expiry date
            <div className="relative mt-2">
              <input value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className="h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-3 pr-10 text-[12px] text-slate-100 outline-none focus:border-cyan-500/60" />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><CalendarClock size={14} /></span>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between rounded-[6px] bg-[#0f1d2d] px-3 py-2.5 text-[10px] text-slate-300">
          <span>Activate Immediately</span>
          <button type="button" onClick={() => setActivateImmediately((value) => !value)} className={`relative h-6 w-11 rounded-full transition-colors ${activateImmediately ? "bg-[#12cdb7]" : "bg-slate-700"}`} aria-label="Toggle immediate activation">
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${activateImmediately ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-[6px] bg-[#0f1d2d] px-3 py-2.5 text-[10px] text-slate-300">
          <div>
            <div>Biometric Exempt</div>
            <div className="mt-1 text-[9px] text-slate-500">No biometric verification required</div>
          </div>
          <button type="button" onClick={() => setBiometricExempt((value) => !value)} className={`relative h-6 w-11 rounded-full transition-colors ${biometricExempt ? "bg-[#12cdb7]" : "bg-slate-700"}`} aria-label="Toggle biometric exemption">
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${biometricExempt ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="space-y-2 rounded-[6px] border border-slate-800 bg-[#0f1d2d] p-3 text-[10px] text-slate-300">
          <div className="flex items-center justify-between">
            <span>Absolute Time-Bound</span>
            <button type="button" onClick={() => setMobileIdExempt((value) => !value)} className={`relative h-6 w-11 rounded-full transition-colors ${mobileIdExempt ? "bg-[#12cdb7]" : "bg-slate-700"}`} aria-label="Toggle absolute time bound">
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${mobileIdExempt ? "left-6" : "left-1"}`} />
            </button>
          </div>
          <div className="text-[9px] leading-4 text-slate-500">Access is revoked at the exact expiry timestamp, regardless of schedule.</div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020a12]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[525px] rounded-[8px] border border-slate-800 bg-[#091a2b] p-0 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-100">Issue Credential</h2>
            <p className="mt-1 text-[9px] text-slate-500">Multi-modal: card, PIN, biometric, dynamic QR, or mobile ID</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-100" aria-label="Close issue credential dialog">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-3">
          <div className="flex gap-5 border-b border-slate-800">
            {tabOptions.map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`pb-3 text-[10px] font-medium ${activeTab === tab ? "border-b-2 border-cyan-400 text-cyan-300" : "text-slate-500 hover:text-slate-300"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-4">{renderTabContent()}</div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-5 py-4">
          <Button onClick={onClose} kind="quiet" testId="button-cancel-credential-modal">Cancel</Button>
          <Button onClick={() => { notify("Credential issued successfully.", "success"); onClose(); }} kind="primary" testId="button-submit-credential-modal">Issue Credential</Button>
        </div>
      </div>
    </div>
  );
}

function UserManagementPage({ notify }: { notify: Notify }) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [apiConnected, setApiConnected] = useState(false);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Statuses");
  const [visitingOnly, setVisitingOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", department: "Facilities", title: "", type: "Employee" as UserRecord["type"] });
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    listUsers()
      .then((records) => {
        if (cancelled) return;
        setUsers(records.map((user) => ({ ...user, id: String(user.id), group: user.accessGroup })));
        setApiConnected(true);
      })
      .catch(() => {
        if (!cancelled) notify("Backend unavailable; showing local directory data.", "warning");
      });
    return () => { cancelled = true; };
  }, []);

  const departments = useMemo(() => ["All Departments", ...Array.from(new Set(users.map((user) => user.department)))], [users]);
  const filteredUsers = useMemo(() => users.filter((user) => {
    const haystack = `${user.name} ${user.employeeId} ${user.department} ${user.title}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (department === "All Departments" || user.department === department) && (status === "All Statuses" || user.status === status) && (!visitingOnly || user.lastSeen.toLowerCase().includes("today"));
  }), [users, query, department, status, visitingOnly]);
  const allSelected = filteredUsers.length > 0 && filteredUsers.every((user) => selected.includes(user.id));

  const toggleUser = (id: string) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const toggleAll = () => setSelected(allSelected ? [] : filteredUsers.map((user) => user.id));
  const toggleStatus = (id: string) => {
    const changed = users.find((user) => user.id === id);
    if (!changed) return;
    const nextStatus = changed.status === "Active" ? "Suspended" : "Active";
    setUsers((current) => current.map((user) => user.id === id ? { ...user, status: nextStatus } : user));
    if (apiConnected) {
      updateUserStatus(id, nextStatus).catch(() => {
        setUsers((current) => current.map((user) => user.id === id ? { ...user, status: changed.status } : user));
        notify("Could not save the status change.", "warning");
      });
    }
    notify(`${changed.name} is now ${nextStatus.toLowerCase()}.`, nextStatus === "Suspended" ? "warning" : "success");
  };
  const addUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.title.trim()) {
      notify("Enter a name and title before adding a user.", "warning");
      return;
    }
    const parts = draft.name.trim().split(" ");
    const initials = parts.map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    const newUser: UserRecord = { id: `new-${Date.now()}`, initials, name: draft.name.trim(), employeeId: `${draft.type === "Employee" ? "EMP" : "CTR"}-${21000 + users.length}`, department: draft.department, title: draft.title.trim(), group: `${draft.department} — Standard`, type: draft.type, status: "Active", lastSeen: "Not yet recorded" };
    const saveUser = apiConnected
      ? createUser({ name: newUser.name, department: newUser.department, title: newUser.title, type: newUser.type }).then((saved) => ({ ...newUser, id: String(saved.id), employeeId: saved.employeeId, group: saved.accessGroup, lastSeen: saved.lastSeen }))
      : Promise.resolve(newUser);
    saveUser.then((savedUser) => {
      setUsers((current) => [savedUser, ...current]);
      setModalOpen(false);
      setDraft({ name: "", department: "Facilities", title: "", type: "Employee" });
      notify(`${savedUser.name} was added to the user directory.`, "success");
    }).catch(() => notify("Could not save the new user.", "warning"));
  };

  return (
    <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8">
      <SectionHeading eyebrow="HRS TECH VIEW · MODULE 1" title="User Management" description="Central identity system of record for employees, contractors, security staff, and other associated individuals." actions={<><Button onClick={() => notify("Bulk action menu opened for the directory.", "info")} icon={UsersRound} testId="button-bulk-actions">Bulk Actions</Button><Button onClick={() => setModalOpen(true)} icon={Plus} kind="primary" testId="button-add-user">Add User</Button></>} />
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 stagger-in">
        <StatCard label="TOTAL USERS" value={String(users.length)} detail="+3 this month" icon={Users} />
        <StatCard label="ACTIVE" value={String(users.filter((user) => user.status === "Active").length)} detail="Access currently enabled" tone="good" icon={UserCheck} />
        <StatCard label="SUSPENDED" value={String(users.filter((user) => user.status === "Suspended").length)} detail="Requires review" tone="warning" icon={ShieldAlert} />
        <StatCard label="CONTRACTORS" value={String(users.filter((user) => user.type === "Contractor").length)} detail="Time-bound access" icon={Building2} />
      </div>

      <section className="control-surface mt-4 overflow-hidden rounded-[7px] stagger-in stagger-2" data-testid="section-user-directory">
        <div className="flex flex-col gap-2 border-b border-slate-800/80 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[12px] font-semibold text-slate-200">User Directory</h2>
            <p className="mt-0.5 text-[9px] text-slate-600">Identity records · synced 2 min ago</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button onClick={() => notify("Directory data refreshed.", "success")} icon={RefreshCw} kind="quiet" testId="button-refresh-directory">Refresh</Button>
            <Button onClick={() => notify("Directory export is being prepared.", "info")} icon={Download} kind="quiet" testId="button-export-directory">Export</Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-b border-slate-800/80 bg-[#101c2b] px-3 py-2.5 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1 xl:max-w-[305px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-8 w-full rounded-[4px] border border-slate-800 bg-[#0d1725] pl-8 pr-2.5 text-[10px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/60" placeholder="Search by name, ID, department..." data-testid="input-user-search" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-8 rounded-[4px] border border-slate-800 bg-[#0d1725] px-2 text-[10px] text-slate-300 outline-none focus:border-cyan-500/60" data-testid="select-user-department">{departments.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 rounded-[4px] border border-slate-800 bg-[#0d1725] px-2 text-[10px] text-slate-300 outline-none focus:border-cyan-500/60" data-testid="select-user-status"><option>All Statuses</option><option>Active</option><option>Suspended</option></select>
            <button onClick={() => setVisitingOnly((current) => !current)} className={`inline-flex h-8 items-center gap-1.5 rounded-[4px] border px-2.5 text-[10px] transition-colors ${visitingOnly ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-slate-800 bg-[#0d1725] text-slate-500 hover:text-slate-300"}`} data-testid="button-visiting-users-filter"><span className={`h-1.5 w-1.5 rounded-full ${visitingOnly ? "bg-cyan-300" : "bg-slate-600"}`} /> Visiting Users Only</button>
            {(query || department !== "All Departments" || status !== "All Statuses" || visitingOnly) && <Button onClick={() => { setQuery(""); setDepartment("All Departments"); setStatus("All Statuses"); setVisitingOnly(false); }} icon={X} kind="quiet" testId="button-clear-user-filters">Clear</Button>}
          </div>
        </div>
        {selected.length > 0 && <div className="flex items-center justify-between border-b border-cyan-500/20 bg-cyan-500/[.06] px-3.5 py-2 text-[10px] text-cyan-200"><span><strong>{selected.length}</strong> records selected</span><div className="flex gap-1.5"><Button onClick={() => { notify(`${selected.length} users suspended.`, "warning"); setUsers((current) => current.map((user) => selected.includes(user.id) ? { ...user, status: "Suspended" } : user)); setSelected([]); }} kind="danger" testId="button-bulk-suspend">Suspend</Button><Button onClick={() => setSelected([])} kind="quiet" testId="button-clear-selection">Clear selection</Button></div></div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead className="bg-[#152337] text-[9px] font-semibold tracking-[.08em] text-slate-500"><tr><th className="w-10 px-3 py-2.5"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-cyan-400" data-testid="checkbox-select-all-users" aria-label="Select all users" /></th><th className="px-2 py-2.5">USER <ArrowDown size={10} className="ml-1 inline text-cyan-400" /></th><th className="px-2 py-2.5">DEPARTMENT</th><th className="px-2 py-2.5">TITLE</th><th className="px-2 py-2.5">ACCESS GROUP</th><th className="px-2 py-2.5">TYPE</th><th className="px-2 py-2.5">STATUS</th><th className="px-3 py-2.5 text-right">LAST SEEN</th><th className="w-9 px-2 py-2.5" /></tr></thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredUsers.map((user, index) => <tr key={user.id} className="group text-[10px] text-slate-400 transition-colors hover:bg-slate-800/35 stagger-in" style={{ animationDelay: `${index * 35}ms` }} data-testid={`row-user-${user.id}`}>
                <td className="px-3 py-2.5"><input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleUser(user.id)} className="accent-cyan-400" data-testid={`checkbox-user-${user.id}`} aria-label={`Select ${user.name}`} /></td>
                <td className="px-2 py-2.5"><div className="flex items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-[#1a2b40] text-[9px] font-semibold text-slate-300">{user.initials}</span><div><div className="font-semibold text-slate-200">{user.name}</div><div className="mono mt-0.5 text-[9px] text-slate-600">{user.employeeId}</div></div></div></td>
                <td className="px-2 py-2.5 text-slate-300">{user.department}</td><td className="px-2 py-2.5 text-slate-400">{user.title}</td><td className="px-2 py-2.5 text-slate-400">{user.group}</td><td className="px-2 py-2.5 text-slate-500">{user.type}</td><td className="px-2 py-2.5"><button onClick={() => toggleStatus(user.id)} data-testid={`button-toggle-status-${user.id}`}><Badge status={user.status} /></button></td><td className="mono px-3 py-2.5 text-right text-[9px] text-slate-600">{user.lastSeen}</td><td className="px-2 py-2.5 text-right"><button onClick={() => notify(`Opening profile for ${user.name}.`, "info")} className="rounded p-1 text-slate-600 opacity-0 hover:bg-slate-700 hover:text-slate-200 group-hover:opacity-100" data-testid={`button-user-more-${user.id}`} aria-label={`Open ${user.name} actions`}><MoreHorizontal size={14} /></button></td>
              </tr>)}
            </tbody>
          </table>
          {filteredUsers.length === 0 && <div className="flex min-h-[180px] flex-col items-center justify-center text-center"><Search size={20} className="mb-2 text-slate-700" /><div className="text-[11px] font-semibold text-slate-400">No users match this view</div><div className="mt-1 text-[10px] text-slate-600">Try a different search or clear the active filters.</div></div>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-800/80 px-3.5 py-2.5 text-[9px] text-slate-600"><span>Showing <strong className="text-slate-400">{filteredUsers.length}</strong> of {users.length} users</span><div className="flex items-center gap-1"><button disabled={page === 1} onClick={() => setPage(1)} className="rounded p-1 hover:bg-slate-800 disabled:opacity-30" data-testid="button-previous-page"><ChevronLeft size={13} /></button><span className="rounded bg-slate-800 px-2 py-1 text-slate-300">1</span><button onClick={() => { setPage(2); notify("Demo directory contains one page of records.", "info"); }} className={`rounded p-1 ${page === 2 ? "bg-slate-800 text-slate-300" : "text-slate-500 hover:bg-slate-800"}`} data-testid="button-next-page"><ChevronRight size={13} /></button></div></div>
      </section>
      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050a11]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" data-testid="dialog-add-user"><form onSubmit={addUser} className="control-surface w-full max-w-[420px] rounded-[7px] p-5 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><div className="mono text-[9px] tracking-[.16em] text-cyan-400">DIRECTORY ACTION</div><h2 className="mt-1 text-[16px] font-semibold text-slate-100">Add user</h2><p className="mt-1 text-[10px] text-slate-500">Create a new identity record with standard access.</p></div><button type="button" onClick={() => setModalOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200" data-testid="button-close-add-user"><X size={16} /></button></div><div className="space-y-3"><label className="block"><span className="mb-1.5 block text-[10px] font-medium text-slate-400">Full name</span><input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-3 text-[11px] text-slate-200 outline-none focus:border-cyan-400/60" placeholder="e.g. Noor Hassan" data-testid="input-new-user-name" /></label><div className="grid grid-cols-2 gap-3"><label className="block"><span className="mb-1.5 block text-[10px] font-medium text-slate-400">Department</span><select value={draft.department} onChange={(event) => setDraft({ ...draft, department: event.target.value })} className="h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-2 text-[10px] text-slate-200 outline-none" data-testid="select-new-user-department">{departments.filter((item) => item !== "All Departments").map((item) => <option key={item}>{item}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-[10px] font-medium text-slate-400">Type</span><select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as UserRecord["type"] })} className="h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-2 text-[10px] text-slate-200 outline-none" data-testid="select-new-user-type"><option>Employee</option><option>Contractor</option></select></label></div><label className="block"><span className="mb-1.5 block text-[10px] font-medium text-slate-400">Job title</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-3 text-[11px] text-slate-200 outline-none focus:border-cyan-400/60" placeholder="e.g. Site Reliability Engineer" data-testid="input-new-user-title" /></label></div><div className="mt-6 flex justify-end gap-2"><Button type="button" onClick={() => setModalOpen(false)} kind="quiet" testId="button-cancel-add-user">Cancel</Button><button type="submit" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[4px] bg-[#12cdb7] px-3 text-[10px] font-semibold text-[#062d31] hover:bg-[#27e2ca]" data-testid="button-submit-add-user"><Plus size={13} /> Add user</button></div></form></div>}
    </main>
  );
}

function RequirementToggle({ selected, onSelect, testId }: { selected: "Fail-Safe" | "Fail-Secure"; onSelect: (value: "Fail-Safe" | "Fail-Secure") => void; testId: string }) {
  return <div className="flex rounded-[5px] border border-slate-800 bg-[#142236] p-0.5" data-testid={testId}><button onClick={() => onSelect("Fail-Safe")} className={`rounded-[4px] px-2.5 py-1 text-[9px] font-semibold ${selected === "Fail-Safe" ? "bg-[#10d1bc] text-[#052e32]" : "text-slate-500 hover:text-slate-300"}`} data-testid={`${testId}-fail-safe`}>Fail-Safe</button><button onClick={() => onSelect("Fail-Secure")} className={`rounded-[4px] px-2.5 py-1 text-[9px] font-semibold ${selected === "Fail-Secure" ? "bg-[#10d1bc] text-[#052e32]" : "text-slate-500 hover:text-slate-300"}`} data-testid={`${testId}-fail-secure`}>Fail-Secure</button></div>;
}

function RequirementsPage({ notify }: { notify: Notify }) {
  const [doors, setDoors] = useState<Record<string, "Fail-Safe" | "Fail-Secure">>({ "Main Lobby N": "Fail-Safe", "Server Room A": "Fail-Secure", "Stairwell Egress — East": "Fail-Safe" });
  const [previewOpen, setPreviewOpen] = useState(true);
  const taxonomy = [["DEN—01", "Expired Credential"], ["DEN—02", "Outside Schedule"], ["DEN—03", "Occupancy Limit Reached"], ["DEN—04", "Anti-Passback Violation"], ["DEN—05", "Multi-Man Incomplete"], ["DEN—06", "Watchlist Match"]];
  const setDoor = (door: string, value: "Fail-Safe" | "Fail-Secure") => setDoors((current) => ({ ...current, [door]: value }));
  const changedDoors = Object.values(doors).filter((value, index) => value !== ["Fail-Safe", "Fail-Secure", "Fail-Safe"][index]).length;
  return (
    <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8">
      <SectionHeading eyebrow="PLATFORM · MODULE 17" title="Cross-Cutting Platform Requirements" description="Requirements spanning multiple modules: denial-reason codes, door failsafe classification, bulk-change preview, and data retention." actions={<Button onClick={() => notify("Requirement configuration saved to local demo state.", "success")} icon={LockKeyhole} kind="primary" testId="button-save-requirements">Save changes</Button>} />
      <div className="grid gap-2.5 lg:grid-cols-[1fr_1fr]">
        <section className="control-surface overflow-hidden rounded-[7px] stagger-in" data-testid="section-denial-taxonomy"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Denial Reason Taxonomy</h2><p className="mt-0.5 text-[9px] text-slate-600">Codes presented to operators when access is denied</p></div><div className="p-3"><table className="w-full border-collapse text-left"><thead className="bg-[#152337] text-[9px] tracking-[.08em] text-slate-500"><tr><th className="px-2 py-2">CODE</th><th className="px-2 py-2">REASON</th></tr></thead><tbody className="divide-y divide-slate-800/70">{taxonomy.map(([code, reason]) => <tr key={code} className="text-[10px] text-slate-300"><td className="mono px-2 py-2">{code}</td><td className="px-2 py-2">{reason}</td></tr>)}</tbody></table></div></section>
        <section className="control-surface overflow-hidden rounded-[7px] stagger-in stagger-2" data-testid="section-door-classification"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Door Hardware Classification</h2><p className="mt-0.5 text-[9px] text-slate-600">Power-loss behavior for critical access points</p></div><div className="divide-y divide-slate-800/70 p-3">{Object.entries(doors).map(([door, value]) => <div key={door} className="flex items-center justify-between gap-3 py-2.5 first:pt-1 last:pb-1"><div><div className="text-[10px] font-semibold text-slate-300">{door}</div><div className="mt-1 text-[9px] text-slate-600">{value === "Fail-Safe" ? "Fail-Safe — unlocks on power loss" : "Fail-Secure — stays locked on power loss"}</div></div><RequirementToggle selected={value} onSelect={(next) => { setDoor(door, next); notify(`${door} set to ${next}.`, "success"); }} testId={`toggle-door-${door.toLowerCase().replaceAll(" ", "-").replaceAll("—", "")}`} /></div>)}</div></section>
      </div>
      <section className="control-surface mt-2.5 overflow-hidden rounded-[7px] stagger-in stagger-3" data-testid="section-bulk-preview"><div className="flex flex-col gap-2 border-b border-slate-800/80 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-[12px] font-semibold text-slate-200">Bulk Change Preview</h2><p className="mt-0.5 text-[9px] text-slate-600">Review cross-module impact before committing changes</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-[10px] bg-amber-500/10 px-2 py-1 text-[9px] font-semibold text-amber-300"><ShieldAlert size={11} /> {32 + changedDoors} records affected</span></div>{previewOpen ? <><div className="mx-3 mt-3 rounded-[5px] border border-amber-500/50 bg-amber-500/[.10] px-3 py-2.5 text-[10px] leading-4 text-amber-200"><ShieldAlert size={13} className="mr-2 inline-block align-[-2px]" />Reassigning <strong>“Facilities — Standard”</strong> → <strong>“Facilities — Extended Hours”</strong> will affect 34 users. 2 records have conflicting manual overrides and will be skipped — review before committing.</div><div className="flex items-center justify-between px-3.5 py-3"><span className="text-[9px] text-slate-600">Last preview generated just now</span><div className="flex gap-2"><Button onClick={() => setPreviewOpen(false)} kind="quiet" testId="button-cancel-preview">Cancel</Button><Button onClick={() => { notify("Bulk change applied to 32 records.", "success"); setPreviewOpen(false); }} kind="primary" testId="button-apply-preview">Apply to 32 Records</Button></div></div></> : <div className="flex items-center justify-between px-3.5 py-4"><span className="text-[10px] text-slate-500">No pending bulk changes.</span><Button onClick={() => setPreviewOpen(true)} icon={RefreshCw} testId="button-reopen-preview">Reopen preview</Button></div>}</section>
      <div className="mt-4 grid gap-2.5 md:grid-cols-3"><InfoTile icon={Globe2} label="DATA RETENTION" value="365 days" detail="Audit events and access decisions" /><InfoTile icon={LockKeyhole} label="AUTHENTICATION" value="MFA required" detail="For administrators and operators" /><InfoTile icon={RefreshCw} label="POLICY SYNC" value="Healthy" detail="Last sync 2 minutes ago" tone="good" /></div>
    </main>
  );
}

type ModuleRow = Record<string, string>;

function ModuleTablePage({
  notify,
  module,
  title,
  description,
  eyebrow,
  action,
  onAction,
  stats,
  tabs,
  columns,
  rows,
  searchPlaceholder,
}: {
  notify: Notify;
  module: string;
  title: string;
  description: string;
  eyebrow: string;
  action: string;
  onAction?: () => void;
  stats?: { label: string; value: string; detail: string; tone?: "normal" | "good" | "warning" }[];
  tabs?: string[];
  columns: { key: string; label: string }[];
  rows: ModuleRow[];
  searchPlaceholder: string;
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(tabs?.[0] ?? "");
  const filtered = rows.filter((row) => Object.values(row).some((value) => value.toLowerCase().includes(search.toLowerCase())));
  return (
    <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} actions={<Button onClick={() => {
        if (onAction) {
          onAction();
          return;
        }
        notify(`${action} workflow opened for ${module}.`, "info");
      }} icon={Plus} kind="primary" testId={`button-${module.toLowerCase().replaceAll(" ", "-")}-action`}>{action}</Button>} />
      {stats && <div className="mb-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat) => <StatCard key={stat.label} {...stat} icon={module === "Mobile Users" ? Smartphone : module === "Credentials" ? CreditCard : module === "Attendance" ? CalendarClock : KeyRound} />)}</div>}
      <section className="control-surface overflow-hidden rounded-[7px] stagger-in">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-3.5 py-3"><div><h2 className="text-[12px] font-semibold text-slate-200">{module}</h2><p className="mt-0.5 text-[9px] text-slate-600">Identity records · synced just now</p></div><Button onClick={() => notify(`${module} data refreshed.`, "success")} icon={RefreshCw} kind="quiet" testId={`button-${module.toLowerCase().replaceAll(" ", "-")}-refresh`}>Refresh</Button></div>
        {tabs && <div className="flex gap-4 border-b border-slate-800/80 bg-[#0f1b2b] px-3.5 pt-2.5">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 px-0.5 pb-2 text-[10px] ${activeTab === tab ? "border-cyan-400 font-semibold text-cyan-300" : "border-transparent text-slate-500 hover:text-slate-300"}`} data-testid={`tab-${tab.toLowerCase().replaceAll(" ", "-")}`}>{tab}</button>)}</div>}
        <div className="flex items-center gap-2 border-b border-slate-800/80 bg-[#101d2d] px-3.5 py-3"><div className="relative w-full max-w-[330px]"><Search size={13} className="absolute left-2.5 top-2.5 text-slate-600" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-8 w-full rounded-[4px] border border-slate-800 bg-[#0b1522] pl-8 pr-3 text-[10px] text-slate-200 outline-none focus:border-cyan-500/60" placeholder={searchPlaceholder} data-testid={`input-${module.toLowerCase().replaceAll(" ", "-")}-search`} /></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead className="bg-[#152337] text-[9px] font-semibold tracking-[.08em] text-slate-500"><tr>{columns.map((column) => <th key={column.key} className="px-3 py-2.5">{column.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-800/70">{filtered.map((row, index) => <tr key={`${module}-${index}`} className="text-[10px] text-slate-300 transition-colors hover:bg-slate-800/35 stagger-in"><td className="px-3 py-2.5 font-semibold text-slate-200">{row[columns[0].key]}</td>{columns.slice(1).map((column) => <td key={column.key} className="px-3 py-2.5">{row[column.key].startsWith("Active") ? <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[9px] font-semibold text-emerald-400">{row[column.key]}</span> : row[column.key].startsWith("Suspended") ? <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[9px] font-semibold text-amber-300">{row[column.key]}</span> : row[column.key]}</td>)}</tr>)}</tbody></table>{filtered.length === 0 && <div className="flex min-h-[150px] items-center justify-center text-[10px] text-slate-600">No records match this view.</div>}</div>
        <div className="border-t border-slate-800/80 px-3.5 py-2.5 text-[9px] text-slate-600">Showing <strong className="text-slate-400">{filtered.length}</strong> of {rows.length} records</div>
      </section>
    </main>
  );
}

function MobileUsersPage({ notify }: { notify: Notify }) {
  const rows = [
    { user: "Amaya Rao", appPrivilege: "Active", ble: "Active", appCount: "2", bleCount: "1", apple: "1", google: "0" },
    { user: "Daniel Osei", appPrivilege: "Active", ble: "Not Enabled", appCount: "1", bleCount: "0", apple: "0", google: "1" },
    { user: "Marta Kowalski", appPrivilege: "Not Enabled", ble: "Not Enabled", appCount: "0", bleCount: "0", apple: "0", google: "0" },
    { user: "Fatima Al-Sayed", appPrivilege: "Active", ble: "Active", appCount: "1", bleCount: "1", apple: "1", google: "1" },
  ];
  return <ModuleTablePage notify={notify} module="Mobile Users" title="Manage Mobile Users" eyebrow="HRS TECH VIEW · MODULE 2" description="App access, BLE credentials, and digital wallet issuance for mobile-registered users." action="Bulk Assign Privilege" stats={[{ label: "APP PRIVILEGE", value: "3", detail: "of 4 users", tone: "good" }, { label: "BLE CREDENTIALS", value: "2", detail: "registered devices" }, { label: "APPLE WALLET", value: "2", detail: "issued passes" }, { label: "GOOGLE WALLET", value: "2", detail: "issued passes" }]} columns={[{ key: "user", label: "USER" }, { key: "appPrivilege", label: "APP PRIVILEGE" }, { key: "ble", label: "BLE CREDENTIAL" }, { key: "appCount", label: "APP COUNT" }, { key: "bleCount", label: "BLE COUNT" }, { key: "apple", label: "APPLE WALLET" }, { key: "google", label: "GOOGLE WALLET" }]} rows={rows} searchPlaceholder="Search by name or ID..." />;
}

function CredentialsPage({ notify }: { notify: Notify }) {
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const rows = [
    { card: "88231198", user: "Amaya Rao", type: "Default", format: "MIFARE DESFire EV2", issued: "2022-03-14", expiry: "Never", status: "Active" },
    { card: "88231204", user: "Daniel Osei", type: "Default", format: "MIFARE DESFire EV2", issued: "2021-07-01", expiry: "Never", status: "Active" },
    { card: "91004432", user: "Jonas Berg", type: "Contractor", format: "HID Prox", issued: "2026-06-01", expiry: "2026-09-30", status: "Active" },
    { card: "88230877", user: "Liam Chen", type: "Default", format: "MIFARE DESFire EV2", issued: "2019-05-18", expiry: "Never", status: "Suspended" },
    { card: "91004501", user: "Visitor — R. Fontaine", type: "Temporary", format: "Dynamic QR", issued: "2026-08-22", expiry: "2026-08-22 17:00", status: "Active" },
  ];

  return (
    <>
      <ModuleTablePage notify={notify} module="Credentials" title="Credential Management" eyebrow="HRS TECH VIEW · MODULE 3" description="Issuance, tracking, and lifecycle control of every physical and digital access credential." action="Issue Credential" onAction={() => setIssueModalOpen(true)} tabs={["Cards", "Biometrics", "Dynamic QR", "Vehicle Tags", "Last Card Action"]} columns={[{ key: "card", label: "CARD NUMBER" }, { key: "user", label: "USER" }, { key: "type", label: "CREDENTIAL TYPE" }, { key: "format", label: "FORMAT" }, { key: "issued", label: "ISSUED" }, { key: "expiry", label: "EXPIRY" }, { key: "status", label: "STATUS" }]} rows={rows} searchPlaceholder="Search by card number or user..." />
      <CredentialIssueModal open={issueModalOpen} onClose={() => setIssueModalOpen(false)} notify={notify} />
    </>
  );
}

function AccessPage({ notify }: { notify: Notify }) {
  const [activeTab, setActiveTab] = useState("Time Code");
  const tabs = ["Time Code", "Time Zone", "Reader Group", "Access Groups", "Elevator Group", "Multi-Man Access"];
  const rows = [
    { zone: "Business Hours", mon: "09:00—18:00", tue: "09:00—18:00", wed: "09:00—18:00", thu: "09:00—18:00", fri: "09:00—18:00", sat: "Off", sun: "Off", holiday: "HG — National" },
    { zone: "Night Shift", mon: "22:00—06:00", tue: "22:00—06:00", wed: "22:00—06:00", thu: "22:00—06:00", fri: "22:00—06:00", sat: "22:00—06:00", sun: "Off", holiday: "HG — National" },
    { zone: "24x7 Security", mon: "00:00—23:59", tue: "00:00—23:59", wed: "00:00—23:59", thu: "00:00—23:59", fri: "00:00—23:59", sat: "00:00—23:59", sun: "00:00—23:59", holiday: "None" },
  ];
  const timeZoneRows = [
    ["Business Hours", "09:00—18:00", "09:00—18:00", "09:00—18:00", "09:00—18:00", "09:00—18:00", "Off", "Off", "HG — National"],
    ["Night Shift", "22:00—06:00", "22:00—06:00", "22:00—06:00", "22:00—06:00", "22:00—06:00", "22:00—06:00", "Off", "HG — National"],
    ["24x7 Security", "00:00—23:59", "00:00—23:59", "00:00—23:59", "00:00—23:59", "00:00—23:59", "00:00—23:59", "00:00—23:59", "None"],
  ];
  const readerGroupRows = [["Main Entrances", "6", "Lobby N, Lobby S, Rear Entry"], ["Server Room A", "2", "SRV-A-01, SRV-A-02"], ["All Readers", "38", "Organization-wide"]];
  const accessGroupRows = [["Facilities — Standard", "User", "Main Entrances, Common Areas", "Business Hours", "Floors 1–3", "Local", "34"], ["IT — Server Rooms", "User", "Server Room A, Server Room B, NOC", "24x7 Security", "Floor B1", "Shared", "9"], ["Security — Full", "User", "All Readers", "24x7 Security", "All Floors", "Shared", "14"], ["Contractor — Mechanical", "Vehicle", "Loading Dock, Mechanical Rm", "Business Hours", "None", "Local", "6"]];
  const elevatorRows = [["Floors 1–3", "HID VertX/Edge", "1, 2, 3", "Business Hours"], ["All Floors", "Mercury/AERO", "B1–14", "24x7 Security"]];
  const multiManRows = [["Server Room Dual-Auth", "IT Admin, Security Officer", "45s", "Hard", "Server Room A"]];
  const renderTable = (headers: string[], data: string[][], testId: string) => <div className="overflow-x-auto" data-testid={testId}><table className="w-full min-w-[760px] border-collapse text-left text-[10px]"><thead className="bg-[#152337] text-[9px] font-semibold tracking-[.08em] text-slate-500"><tr>{headers.map((header) => <th key={header} className="px-3 py-2.5">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-800/70">{data.map((row) => <tr key={row[0]} className="text-slate-300 transition-colors hover:bg-slate-800/35">{row.map((cell, index) => <td key={`${row[0]}-${index}`} className={`px-3 py-3 ${index === 0 ? "font-semibold text-slate-200" : ""}`}>{cell === "Shared" ? <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[9px] font-semibold text-emerald-400">{cell}</span> : cell === "Local" ? <span className="rounded-full bg-slate-700/60 px-2 py-1 text-[9px] text-slate-400">{cell}</span> : cell === "User" || cell === "Vehicle" ? <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[9px] font-semibold text-blue-400">{cell}</span> : cell === "Hard" ? <span className="rounded-full bg-rose-500/20 px-2 py-1 text-[9px] font-semibold text-rose-300">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>;
  const content = activeTab === "Time Zone" ? renderTable(["TIME ZONE", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN", "HOLIDAY GROUP"], timeZoneRows, "table-time-zones") : activeTab === "Reader Group" ? renderTable(["READER GROUP", "READER COUNT", "DOORS"], readerGroupRows, "table-reader-groups") : activeTab === "Access Groups" ? <>{renderTable(["ACCESS GROUP", "TYPE", "READER GROUPS", "TIME ZONE", "ELEVATOR", "SHARED", "USERS"], accessGroupRows, "table-access-groups")}</> : activeTab === "Elevator Group" ? renderTable(["ELEVATOR GROUP", "CONTROLLER PLATFORM", "FLOORS", "TIME ZONE"], elevatorRows, "table-elevator-groups") : activeTab === "Multi-Man Access" ? <>{renderTable(["RULE", "REQUIRED ROLES", "SEQUENCE TIMEOUT", "ENTRY TYPE", "READERS"], multiManRows, "table-multi-man-access")}</> : <div className="flex min-h-[112px] items-center justify-center px-4 text-center text-[10px] text-slate-600">Select a configuration tab to view access policy records.</div>;
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="NEXORA VIEW · MODULE 4" title="Access Management" description="The core policy engine — time codes, time zones, reader groups, access groups, elevator groups, and multi-person authorisation." actions={<Button onClick={() => notify(`New ${activeTab} workflow opened.`, "info")} icon={Plus} kind="primary" testId="button-access-new">New</Button>} /><section className="control-surface overflow-hidden rounded-[8px]" data-testid="section-access-configuration"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Access Configuration</h2></div><div className="flex gap-4 overflow-x-auto border-b border-slate-800/80 bg-[#0f1b2b] px-3.5 pt-2.5">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-0.5 pb-2.5 text-[10px] ${activeTab === tab ? "border-cyan-400 font-semibold text-cyan-300" : "border-transparent text-slate-500 hover:text-slate-300"}`} data-testid={`tab-access-${tab.toLowerCase().replaceAll(" ", "-")}`}>{tab}</button>)}</div>{content}</section></main>;
}

function AttendancePage({ notify }: { notify: Notify }) {
  const [activeTab, setActiveTab] = useState("Attendance Rule");
  const tabs = ["Attendance Rule", "Rule Group", "Leave Policy"];
  const rules = [["Standard Day Shift", "09:00", "10 min", "4 hrs", "8 hrs", "After 8.5 hrs", "No"], ["Night Shift", "22:00", "15 min", "4 hrs", "8 hrs", "After 8 hrs", "Yes"]];
  const leavePolicies = [["Annual Leave", "Earned", "18", "Active"], ["Sick Leave", "Medical", "10", "Active"], ["2023 Legacy Casual Leave", "Casual", "6", "Inactive"]];
  const renderTable = (headers: string[], data: string[][]) => <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-[10px]"><thead className="bg-[#152337] text-[9px] font-semibold tracking-[.08em] text-slate-500"><tr>{headers.map((header) => <th key={header} className="px-3 py-2.5">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-800/70">{data.map((row) => <tr key={row[0]} className="text-slate-300 transition-colors hover:bg-slate-800/35">{row.map((cell, index) => <td key={`${row[0]}-${index}`} className={`px-3 py-3 ${index === 0 ? "font-semibold text-slate-200" : ""}`}>{cell === "Active" ? <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[9px] font-semibold text-emerald-400">{cell}</span> : cell === "Inactive" ? <span className="rounded-full bg-slate-700/60 px-2 py-1 text-[9px] text-slate-400">{cell}</span> : cell === "Yes" ? <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[9px] font-semibold text-blue-400">{cell}</span> : cell === "No" ? <span className="rounded-full bg-slate-700/60 px-2 py-1 text-[9px] text-slate-400">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>;
  const content = activeTab === "Attendance Rule" ? renderTable(["RULE NAME", "DAY START", "GRACE PERIOD", "HALF-DAY MIN", "FULL-DAY MIN", "OVERTIME", "NIGHT SHIFT"], rules) : activeTab === "Rule Group" ? <div className="p-3"><div className="rounded-[7px] border border-slate-800 bg-[#101d2d] p-3"><div className="text-[12px] font-semibold text-slate-200">HQ Weekly Pattern</div><div className="mt-2 text-[10px] text-slate-500">Mon–Fri Standard Day, Sat–Sun Week-off</div><span className="mt-2 inline-flex rounded-full bg-blue-500/15 px-2 py-1 text-[9px] font-semibold text-blue-400">Holiday: HG — National</span></div></div> : renderTable(["LEAVE POLICY", "TYPE", "DAYS/YEAR", "STATUS"], leavePolicies);
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="NEXORA VIEW · MODULE 5" title="Attendance Management" description="Shift-based attendance rule definition, rule-group assignment by day/holiday, and leave policy configuration." actions={<Button onClick={() => notify(`New ${activeTab} workflow opened.`, "info")} icon={Plus} kind="primary" testId="button-attendance-new-rule">New Rule</Button>} /><section className="control-surface overflow-hidden rounded-[8px]" data-testid="section-attendance-configuration"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Attendance Configuration</h2></div><div className="flex gap-4 overflow-x-auto border-b border-slate-800/80 bg-[#0f1b2b] px-3.5 pt-2.5">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-0.5 pb-2.5 text-[10px] ${activeTab === tab ? "border-cyan-400 font-semibold text-cyan-300" : "border-transparent text-slate-500 hover:text-slate-300"}`} data-testid={`tab-attendance-${tab.toLowerCase().replaceAll(" ", "-")}`}>{tab}</button>)}</div>{content}</section></main>;
}

function VisitorsPage({ notify }: { notify: Notify }) {
  const [activeTab, setActiveTab] = useState("Visitor Details");
  const [policies, setPolicies] = useState([true, false, true, true, true, false]);
  const tabs = ["Visitor Details", "Visit Details", "Gate Master", "Visitor Policy"];
  const visitorRows = [["Renee Fontaine", "Meridian Consulting", "Ananya Rao", "Business", "Clear", "Checked In"], ["Tomás Álvarez", "—", "Marta Kowalski", "Interview", "Clear", "Expected"], ["Unknown — flagged", "—", "—", "Walk-in", "Flagged", "Denied"], ["Grace Lin", "ACME MEP", "Daniel Osei", "Contractor Escort", "Clear", "Overstaying"]];
  const visitRows = [["VIS-88231", "Renee Fontaine", "Business", "Ananya Rao", "Checked In"], ["VIS-88240", "Tomás Álvarez", "Interview", "Marta Kowalski", "Expected"], ["VIS-88241", "Unknown — flagged", "Walk-in", "—", "Denied"], ["VIS-88198", "Grace Lin", "Contractor Escort", "Daniel Osei", "Overstaying"]];
  const gateRows = [["Main Lobby Gate", "E-Gate (QR/PIN)", "Express", "Active"], ["Loading Dock Gate", "Attended Desk", "Secure (Appointment Required)", "Active"]];
  const policyRows = [["Express Flow (Direct e-pass)", "No appointment ID required for entry"], ["Secure Flow (Appointment-gated)", "Requires appointment ID at kiosk or desk"], ["E-Gate Support", "QR/PIN enabled automated gate entry"], ["Host Approval for Walk-Ins", "Walk-in requests require host sign-off before a pass is issued"], ["NDA & Safety Instructions", "Mandatory acknowledgment step at check-in"], ["ezVISIT Appointment-Mandatory Mode", "License-gated desktop reception enforcement"]];
  const renderTable = (headers: string[], rows: string[][]) => <div className="overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-left text-[10px]"><thead className="bg-[#152337] text-[9px] font-semibold tracking-[.08em] text-slate-500"><tr>{headers.map((header) => <th key={header} className="px-3 py-2.5">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-800/70">{rows.map((row) => <tr key={row[0]} className="text-slate-300 transition-colors hover:bg-slate-800/35">{row.map((cell, index) => <td key={`${row[0]}-${index}`} className={`px-3 py-2.5 ${index === 0 ? "font-semibold text-slate-200" : ""}`}>{cell === "Clear" || cell === "Checked In" || cell === "Active" ? <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[9px] font-semibold text-emerald-400">{cell}</span> : cell === "Expected" ? <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[9px] font-semibold text-blue-400">{cell}</span> : cell === "Flagged" || cell === "Denied" ? <span className="rounded-full bg-rose-500/15 px-2 py-1 text-[9px] font-semibold text-rose-300">{cell}</span> : cell === "Overstaying" ? <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[9px] font-semibold text-amber-300">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>;
  const content = activeTab === "Visitor Details" ? renderTable(["VISITOR", "COMPANY", "HOST", "TYPE", "WATCHLIST", "STATUS"], visitorRows) : activeTab === "Visit Details" ? renderTable(["MEETING ID", "VISITOR", "PURPOSE", "HOST", "STATUS"], visitRows) : activeTab === "Gate Master" ? renderTable(["GATE", "TYPE", "FLOW", "ACTIVE"], gateRows) : <div className="divide-y divide-slate-800/70">{policyRows.map(([label, detail], index) => <div key={label} className="flex items-center justify-between gap-4 px-3.5 py-2.5"><div><div className="text-[10px] font-semibold text-slate-300">{label}</div><div className="mt-0.5 text-[9px] text-slate-600">{detail}</div></div><button type="button" onClick={() => { setPolicies((current) => current.map((enabled, policyIndex) => policyIndex === index ? !enabled : enabled)); notify(`${label} policy ${policies[index] ? "disabled" : "enabled"}.`, policies[index] ? "warning" : "success"); }} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${policies[index] ? "bg-[#12cdb7]" : "bg-slate-700"}`} aria-label={`Toggle ${label}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${policies[index] ? "left-6" : "left-1"}`} /></button></div>)}</div>;
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="NEXORA VIEW · MODULE 6" title="Visitor Management" description="End-to-end visitor lifecycle: gate/meeting-room setup, pre-registration policy, check-in/out, and watchlist screening." actions={<Button onClick={() => notify("Pre-registration workflow opened.", "info")} icon={Plus} kind="primary" testId="button-visitors-action">Pre-Register Visitor</Button>} /><div className="mb-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="INSIDE NOW" value="1" detail="active visitor" tone="good" icon={Users} /><StatCard label="EXPECTED TODAY" value="1" detail="pre-registered" icon={CalendarClock} /><StatCard label="OVERSTAYING" value="1" detail="Past approved window" tone="warning" icon={ShieldAlert} /><StatCard label="WATCHLIST FLAGS" value="1" detail="Requires justification to override" tone="warning" icon={ShieldAlert} /></div><section className="control-surface overflow-hidden rounded-[8px]" data-testid="section-visitor-configuration"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Visitors</h2></div><div className="flex gap-4 overflow-x-auto border-b border-slate-800/80 bg-[#0f1b2b] px-3.5 pt-2.5">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-0.5 pb-2.5 text-[10px] ${activeTab === tab ? "border-cyan-400 font-semibold text-cyan-300" : "border-transparent text-slate-500 hover:text-slate-300"}`} data-testid={`tab-visitors-${tab.toLowerCase().replaceAll(" ", "-")}`}>{tab}</button>)}</div>{content}</section></main>;
}

function ReportsPage({ notify }: { notify: Notify }) {
  const [activeTab, setActiveTab] = useState("Scheduled");
  const [search, setSearch] = useState("");
  const reports = ["Biometric Enrollment", "Card-Not-Shown", "Device Inventory", "Employee Master Point", "Employee Verification", "Geo-Location Access", "Guard Tour", "Individual Access", "Individual Reader Assignment", "Last Geo-Location Access", "Logical Access", "Muster Point", "Reader Access", "Reader Assignment", "Reader Group Access"];
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="HRS TECH VIEW · MODULE 7" title="Reports" description="Standard and scheduled reporting across attendance, visitor activity, and system/card audit trails." /><section className="control-surface overflow-hidden rounded-[7px]"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Access Reports</h2></div><div className="flex gap-4 border-b border-slate-800/80 bg-[#0f1b2b] px-3.5 pt-2.5"><button className="border-b-2 border-cyan-400 pb-2 text-[10px] font-semibold text-cyan-300">Standard</button><button onClick={() => notify("Scheduled reports are available in the connected operations environment.", "info")} className="border-b-2 border-transparent pb-2 text-[10px] text-slate-500">Scheduled</button></div><div className="border-b border-slate-800/80 bg-[#101d2d] px-3.5 py-3"><div className="relative max-w-[330px]"><Search size={13} className="absolute left-2.5 top-2.5 text-slate-600" /><input className="h-8 w-full rounded-[4px] border border-slate-800 bg-[#0b1522] pl-8 pr-3 text-[10px] text-slate-200 outline-none focus:border-cyan-500/60" placeholder="Search report types..." data-testid="input-reports-search" /></div></div><div className="grid gap-2.5 p-3.5 md:grid-cols-2 xl:grid-cols-3">{reports.map((report, index) => <button key={report} onClick={() => notify(`${report} report queued for generation.`, "success")} className="group flex min-h-[58px] items-start gap-2 rounded-[7px] border border-slate-800 bg-[#0e1928] px-3 py-2.5 text-left transition-colors hover:border-cyan-500/40 hover:bg-[#132337] stagger-in" style={{ animationDelay: `${index * 25}ms` }} data-testid={`button-report-${index}`}><FileBarChart size={14} className="mt-0.5 text-slate-400 group-hover:text-cyan-300" /><span><span className="block text-[10px] font-semibold text-slate-300">{report}</span><span className="mt-1 block text-[9px] text-slate-600">Standard report</span></span></button>)}</div></section></main>;
}

function ReportsSnapshotPage({ notify }: { notify: Notify }) {
  const [activeTab, setActiveTab] = useState("Scheduled");
  const [search, setSearch] = useState("");
  const reports = ["Biometric Enrollment", "Card-Not-Shown", "Device Inventory", "Employee Master Point", "Employee Verification", "Geo-Location Access", "Guard Tour", "Individual Access", "Individual Reader Assignment", "Last Geo-Location Access", "Logical Access", "Muster Point", "Reader Access", "Reader Assignment", "Reader Group Access"];
  const filteredReports = reports.filter((report) => report.toLowerCase().includes(search.toLowerCase()));
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="NEXORA VIEW · MODULE 7" title="Reports" description="Standard and scheduled reporting across attendance, visitor activity, and system/card audit trails." /><section className="control-surface overflow-hidden rounded-[7px]" data-testid="section-access-reports"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Access Reports</h2></div><div className="flex gap-4 border-b border-slate-800/80 bg-[#0f1b2b] px-3.5 pt-2.5"><button onClick={() => setActiveTab("Standard")} className={`border-b-2 pb-2 text-[10px] ${activeTab === "Standard" ? "border-cyan-400 font-semibold text-cyan-300" : "border-transparent text-slate-500"}`}>Standard</button><button onClick={() => setActiveTab("Scheduled")} className={`border-b-2 pb-2 text-[10px] ${activeTab === "Scheduled" ? "border-cyan-400 font-semibold text-cyan-300" : "border-transparent text-slate-500"}`}>Scheduled</button></div><div className="border-b border-slate-800/80 bg-[#101d2d] px-3.5 py-3"><div className="relative max-w-[330px]"><Search size={13} className="absolute left-2.5 top-2.5 text-slate-600" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-8 w-full rounded-[4px] border border-slate-800 bg-[#0b1522] pl-8 pr-3 text-[10px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/60" placeholder="Search report types..." data-testid="input-reports-search" /></div></div><div className="grid gap-2.5 p-3.5 md:grid-cols-2 xl:grid-cols-3">{filteredReports.map((report, index) => <button key={report} onClick={() => notify(`${report} ${activeTab.toLowerCase()} report queued for generation.`, "success")} className="group flex min-h-[60px] items-start gap-2 rounded-[7px] border border-slate-800 bg-[#0e1928] px-3 py-2.5 text-left transition-colors hover:border-cyan-500/40 hover:bg-[#132337] stagger-in" style={{ animationDelay: `${index * 25}ms` }} data-testid={`button-report-${index}`}><FileBarChart size={14} className="mt-0.5 text-slate-300 group-hover:text-cyan-300" /><span><span className="block text-[10px] font-semibold text-slate-200">{report}</span><span className="mt-1 block text-[9px] text-slate-600">{activeTab === "Scheduled" ? "Recurring · auto-distributed" : "Available on demand"}</span></span></button>)}</div>{filteredReports.length === 0 && <div className="px-3.5 py-8 text-center text-[10px] text-slate-600">No report types match this search.</div>}</section></main>;
}

function RequestsSnapshotPage({ notify }: { notify: Notify }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [requests, setRequests] = useState([
    { request: "REQ—5521", category: "Working Hour Regularization", requester: "Sofia Herrera", date: "2026—08—19", submitted: "2026—08—20", status: "Pending" },
    { request: "REQ—5522", category: "Leave Cancellation", requester: "Liam Chen", date: "2026—08—25", submitted: "2026—08—21", status: "Pending" },
    { request: "REQ—5498", category: "Compensatory Leave", requester: "Fatima Al-Sayed", date: "2026—08—15", submitted: "2026—08—16", status: "Approved" },
    { request: "REQ—5499", category: "Leave Regularization", requester: "Daniel Osei", date: "2026—08—10", submitted: "2026—08—11", status: "Rejected" },
  ]);
  const categories = Array.from(new Set(requests.map((item) => item.category)));
  const filtered = requests.filter((item) => `${item.request} ${item.category} ${item.requester}`.toLowerCase().includes(search.toLowerCase()) && (statusFilter === "All Statuses" || item.status === statusFilter) && (categoryFilter === "All Categories" || item.category === categoryFilter));
  const updateStatus = (request: string, status: "Approved" | "Rejected") => {
    setRequests((current) => current.map((item) => item.request === request ? { ...item, status } : item));
    notify(`${request} marked ${status.toLowerCase()}.`, status === "Approved" ? "success" : "warning");
  };
  const statusBadge = (status: string) => status === "Pending" ? "bg-amber-500/15 text-amber-300" : status === "Approved" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-300";
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="NEXORA VIEW · MODULE 8" title="Requests" description="Self-service for on-duty regularization, leave regularization/cancellation, compensatory leave, and personal visitor scheduling." actions={<Button onClick={() => notify("New request workflow opened.", "info")} icon={Plus} kind="primary" testId="button-requests-new">New Request</Button>} /><section className="control-surface overflow-hidden rounded-[8px]" data-testid="section-requests"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Requests</h2></div><div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 bg-[#101d2d] px-3.5 py-2.5"><div className="relative min-w-[135px] flex-1 sm:max-w-[330px]"><Search size={13} className="absolute left-2.5 top-2.5 text-slate-600" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-8 w-full rounded-[4px] border border-slate-800 bg-[#0b1522] pl-8 pr-3 text-[10px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/60" placeholder="Search by requester or ID..." data-testid="input-requests-search" /></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-8 rounded-[4px] border border-slate-800 bg-[#0b1522] px-2 text-[10px] text-slate-300 outline-none focus:border-cyan-500/60" data-testid="select-request-status"><option>All Statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option></select><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-8 min-w-[140px] rounded-[4px] border border-slate-800 bg-[#0b1522] px-2 text-[10px] text-slate-300 outline-none focus:border-cyan-500/60" data-testid="select-request-category"><option>All Categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] border-collapse text-left text-[10px]"><thead className="bg-[#152337] text-[9px] font-semibold tracking-[.08em] text-slate-500"><tr>{["REQUEST ID", "CATEGORY", "REQUESTER", "DATE", "SUBMITTED", "STATUS", ""].map((header) => <th key={header} className="px-3 py-2.5">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-800/70">{filtered.map((item) => <tr key={item.request} className="text-slate-300 transition-colors hover:bg-slate-800/35"><td className="px-3 py-2.5 font-semibold text-slate-200">{item.request}</td><td className="px-3 py-2.5">{item.category}</td><td className="px-3 py-2.5">{item.requester}</td><td className="mono px-3 py-2.5">{item.date}</td><td className="mono px-3 py-2.5">{item.submitted}</td><td className="px-3 py-2.5"><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${statusBadge(item.status)}`}>{item.status}</span></td><td className="px-3 py-2.5"><div className="flex gap-1"><button type="button" disabled={item.status !== "Pending"} onClick={() => updateStatus(item.request, "Approved")} className="rounded border border-slate-700 p-1 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30" aria-label={`Approve ${item.request}`}><Check size={12} /></button><button type="button" disabled={item.status !== "Pending"} onClick={() => updateStatus(item.request, "Rejected")} className="rounded border border-slate-700 p-1 text-rose-400 hover:bg-rose-500/10 disabled:opacity-30" aria-label={`Reject ${item.request}`}><X size={12} /></button></div></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="px-3.5 py-8 text-center text-[10px] text-slate-600">No requests match this view.</div>}</div></section></main>;
}

function RequestsPage({ notify }: { notify: Notify }) {
  const rows = [
    { request: "REQ—5521", category: "Working Hour Regularization", requester: "Sofia Herrera", date: "2026—08—19", submitted: "2026—08—20", status: "Pending" },
    { request: "REQ—5522", category: "Leave Cancellation", requester: "Liam Chen", date: "2026—08—25", submitted: "2026—08—21", status: "Pending" },
    { request: "REQ—5498", category: "Compensatory Leave", requester: "Fatima Al-Sayed", date: "2026—08—15", submitted: "2026—08—16", status: "Approved" },
    { request: "REQ—5499", category: "Leave Regularization", requester: "Daniel Osei", date: "2026—08—10", submitted: "2026—08—11", status: "Rejected" },
  ];
  return <ModuleTablePage notify={notify} module="Requests" title="Requests" eyebrow="HRS TECH VIEW · MODULE 8" description="Self-service for on-duty regularization, leave regularization/cancellation, compensatory leave, and personal visitor scheduling." action="New Request" columns={[{ key: "request", label: "REQUEST ID" }, { key: "category", label: "CATEGORY" }, { key: "requester", label: "REQUESTER" }, { key: "date", label: "DATE" }, { key: "submitted", label: "SUBMITTED" }, { key: "status", label: "STATUS" }]} rows={rows} searchPlaceholder="Search by requester or ID..." />;
}

function AnalyticsPage() {
  const bars = [42, 62, 55, 72, 84, 48, 37];
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="HRS TECH VIEW · MODULE 9" title="Dashboard Analytics" description="Nine purpose-built analytics surfaces — risk, alarms, flow, headcount, visitors, time-series, credentials, people, and system health." /><div className="grid gap-2.5 lg:grid-cols-2"><AnalyticsCard title="RISK VISION AI" subtitle="Consolidated Vulnerability Score" value="62" suffix="/100" tone="warning" /><DonutCard /></div><div className="mt-2.5 grid gap-2.5 md:grid-cols-3"><ChartCard title="FLOW VISION" subtitle="Week Flow" bars={bars} /><AnalyticsCard title="LIVE COUNT ()" subtitle="Current Headcount" value="341" detail="Facilities 210 · Security 14 · Visitors 9" /><AnalyticsCard title="GUEST TRACK" subtitle="Visitors Today" value="1   1   1" detail="Inside     Overstaying     Expected" /></div><div className="mt-2.5 grid gap-2.5 md:grid-cols-4">{["CHRONO VISION", "CRED VISION", "PEOPLE VISION", "SYSTEM VISION"].map((title, index) => <ChartCard key={title} title={title} subtitle={["Time-series trend", "Credential analysis", "People analysis", "Device health"][index]} bars={bars.slice(index % 3, index % 3 + 5)} />)}</div></main>;
}

function AnalyticsCard({ title, subtitle, value, suffix, detail, tone = "normal" }: { title: string; subtitle: string; value: string; suffix?: string; detail?: string; tone?: "normal" | "warning" }) {
  return <div className="control-surface rounded-[7px] p-3.5"><div className="mono text-[9px] font-semibold tracking-[.12em] text-cyan-400">{title}</div><div className="mt-1 text-[10px] font-semibold text-slate-200">{subtitle}</div><div className={`mt-3 text-[25px] font-semibold tracking-tight ${tone === "warning" ? "text-amber-400" : "text-slate-100"}`}>{value}<span className="text-[11px] text-slate-500">{suffix}</span></div>{detail && <div className="mt-1 text-[9px] text-slate-600">{detail}</div>}</div>;
}

function ChartCard({ title, subtitle, bars }: { title: string; subtitle: string; bars: number[] }) {
  return <div className="control-surface rounded-[7px] p-3.5"><div className="mono text-[9px] font-semibold tracking-[.12em] text-cyan-400">{title}</div><div className="mt-1 text-[10px] font-semibold text-slate-200">{subtitle}</div><div className="mt-3 flex h-12 items-end gap-1">{bars.map((height, index) => <div key={`${title}-${index}`} className={`flex-1 rounded-t-[2px] ${index === bars.length - 2 ? "bg-cyan-400" : "bg-[#07534e]"}`} style={{ height: `${height}%` }} />)}</div></div>;
}

function DonutCard() {
  return <div className="control-surface rounded-[7px] p-3.5"><div className="mono text-[9px] font-semibold tracking-[.12em] text-cyan-400">ALARM VISION</div><div className="mt-1 text-[10px] font-semibold text-slate-200">Events by Severity (7 days)</div><div className="mt-3 flex items-center gap-5"><div className="relative flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "conic-gradient(#13d7a1 0 57%, #1689e8 57% 76%, #ffb62b 76% 91%, #f33c68 91% 100%)" }}><div className="flex h-10 w-10 flex-col items-center justify-center rounded-full bg-[#101a28]"><strong className="text-[14px] text-slate-100">132</strong><span className="text-[7px] text-slate-600">TOTAL</span></div></div><div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[9px] text-slate-500"><span className="text-rose-400">■ Critical</span><span>8</span><span className="text-amber-300">■ Warning</span><span>23</span><span className="text-sky-400">■ Attention</span><span>41</span><span className="text-emerald-400">■ Normal</span><span>60</span></div></div></div>;
}

function SettingsPage({ notify }: { notify: Notify }) {
  const rows = [
    { privilege: "Super Admin", type: "General", modules: "All", status: "Active" },
    { privilege: "Security Operator", type: "General", modules: "Monitoring, Alarms, Area Control", status: "Active" },
    { privilege: "HR Administrator", type: "General", modules: "Users, Attendance, Requests", status: "Active" },
    { privilege: "Auditor (Read-only)", type: "General", modules: "Reports, Audit Logs", status: "Active" },
    { privilege: "2023 Legacy Front Desk", type: "Group", modules: "Visitors", status: "Inactive" },
  ];
  return <ModuleTablePage notify={notify} module="Master Configuration" title="Settings" eyebrow="HRS TECH VIEW · MODULE 10" description="Platform-wide master data, access/attendance policy defaults, and UI personalization." action="New Privilege" tabs={["Privileges", "Card Format", "Holidays", "Personalization"]} columns={[{ key: "privilege", label: "PRIVILEGE" }, { key: "type", label: "TYPE" }, { key: "modules", label: "MODULES" }, { key: "status", label: "STATUS" }]} rows={rows} searchPlaceholder="Search privileges..." />;
}

function SettingsSnapshotPage({ notify }: { notify: Notify }) {
  const [activeTab, setActiveTab] = useState("Privileges");
  const [multiLanguage, setMultiLanguage] = useState(false);
  const [landingPage, setLandingPage] = useState("Dashboard Analytics");
  const tabs = ["Privileges", "Card Format", "Holidays", "Personalization"];
  const privileges = [["Super Admin", "General", "All", "Active"], ["Security Operator", "General", "Monitoring, Alarms, Area Control", "Active"], ["HR Administrator", "General", "Users, Attendance, Requests", "Active"], ["Auditor (Read-only)", "General", "Reports, Audit Logs", "Active"], ["2023 Legacy Front Desk", "Group", "Visitors", "Inactive"]];
  const cardFormats = [["Standard 26-bit Wiegand", "HID Prox", "26", "104"], ["DESFire EV2 Corporate", "MIFARE DESFire EV2", "34", "—"], ["Legacy Facility Format", "HID Prox", "37", "221"]];
  const holidays = [["National Holidays", "Global HQ", "12"], ["East Annex Regional", "East Annex", "15"]];
  const renderTable = (headers: string[], rows: string[][]) => <div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left text-[10px]"><thead className="bg-[#152337] text-[9px] font-semibold tracking-[.08em] text-slate-500"><tr>{headers.map((header) => <th key={header} className="px-3 py-2.5">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-800/70">{rows.map((row) => <tr key={row[0]} className="text-slate-300 transition-colors hover:bg-slate-800/35">{row.map((cell, index) => <td key={`${row[0]}-${index}`} className={`px-3 py-3 ${index === 0 ? "font-semibold text-slate-200" : ""}`}>{cell === "Active" ? <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[9px] font-semibold text-emerald-400">{cell}</span> : cell === "Inactive" ? <span className="rounded-full bg-slate-700/60 px-2 py-1 text-[9px] text-slate-400">{cell}</span> : cell === "General" || cell === "Group" ? <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[9px] font-semibold text-blue-400">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>;
  const toggle = (value: boolean, onChange: () => void, label: string) => <button type="button" onClick={onChange} className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-[#12cdb7]" : "bg-slate-700"}`} aria-label={label}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${value ? "left-6" : "left-1"}`} /></button>;
  const content = activeTab === "Privileges" ? renderTable(["PRIVILEGE", "TYPE", "MODULES", "STATUS"], privileges) : activeTab === "Card Format" ? renderTable(["FORMAT NAME", "CARD TYPE", "BIT LENGTH", "FACILITY CODE"], cardFormats) : activeTab === "Holidays" ? renderTable(["HOLIDAY GROUP", "REGION", "DATES CONFIGURED"], holidays) : <div className="space-y-3 p-3.5"><div className="flex items-center justify-between border-b border-slate-800/70 pb-3"><div><div className="text-[10px] font-semibold text-slate-300">Multi-Language Console</div><div className="mt-1 text-[9px] text-slate-600">Enable localized UI for administrator accounts</div></div>{toggle(multiLanguage, () => { setMultiLanguage((value) => !value); notify(`Multi-language console ${multiLanguage ? "disabled" : "enabled"}.`, "success"); }, "Toggle multi-language console")}</div><label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">Organization display name<input defaultValue="NEXORA — Meridian Corporate HQ" className="mt-2 h-9 w-full rounded-[4px] border border-slate-700 bg-[#0d1725] px-3 text-[11px] normal-case tracking-normal text-slate-200 outline-none focus:border-cyan-500/60" /></label><label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">Default landing page<select value={landingPage} onChange={(event) => setLandingPage(event.target.value)} className="mt-2 h-9 w-full rounded-[4px] border border-cyan-500 bg-[#0d1725] px-2 text-[11px] normal-case tracking-normal text-slate-200 outline-none"><option>Dashboard Analytics</option><option>User Management</option><option>Real-Time Monitoring</option></select></label></div>;
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="NEXORA VIEW · MODULE 10" title="Settings" description="Platform-wide master data, access/attendance policy defaults, and UI personalization." actions={<Button onClick={() => notify(`New ${activeTab} workflow opened.`, "info")} icon={Plus} kind="primary" testId="button-settings-new-privilege">New Privilege</Button>} /><section className="control-surface overflow-hidden rounded-[8px]" data-testid="section-master-configuration"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Master Configuration</h2></div><div className="flex gap-4 overflow-x-auto border-b border-slate-800/80 bg-[#0f1b2b] px-3.5 pt-2.5">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-0.5 pb-2.5 text-[10px] ${activeTab === tab ? "border-cyan-400 font-semibold text-cyan-300" : "border-transparent text-slate-500 hover:text-slate-300"}`} data-testid={`tab-settings-${tab.toLowerCase().replaceAll(" ", "-")}`}>{tab}</button>)}</div>{content}</section></main>;
}

function MonitoringPage({ notify }: { notify: Notify }) {
  const devices = [["Controllers", "38/40 online"], ["Interfaces", "12/12 online"], ["Readers", "64/66 online"], ["Inputs", "44/48 online"], ["Outputs", "48/48 online"]];
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="SECURITY VIEW · MODULE 11" title="Real-Time Monitoring" description="Live security operations console — device status, map visualization, and emergency mode controls." /><div className="control-surface mb-2.5 flex flex-wrap items-center gap-2 rounded-[7px] p-2.5"><Button onClick={() => notify("Evacuation mode enabled for HQ — North Wing.", "warning")} kind="danger" testId="button-evacuation">Evacuation</Button><Button onClick={() => notify("Lockdown mode enabled.", "warning")} kind="danger" testId="button-lockdown">Lockdown</Button><Button onClick={() => notify("Maintenance mode selected.", "info")} testId="button-maintenance">Maintenance</Button><Button onClick={() => notify("Live monitoring reset.", "success")} icon={RefreshCw} testId="button-monitoring-reset">Reset</Button><select className="ml-auto h-8 rounded-[4px] border border-slate-700 bg-[#0d1725] px-2 text-[10px] text-slate-300" data-testid="select-monitoring-scope"><option>Scope: Branch — HQ North Wing</option><option>Scope: All branches</option></select></div><div className="grid gap-2.5 lg:grid-cols-[1.05fr_1fr]"><section className="control-surface overflow-hidden rounded-[7px]"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Facility Map</h2></div><div className="m-3 h-[250px] rounded-[6px] border border-slate-800 bg-[#172638] relative overflow-hidden"><div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(#28415a 1px, transparent 1px), linear-gradient(90deg, #28415a 1px, transparent 1px)", backgroundSize: "48px 48px" }} />{["18% 28%", "42% 22%", "65% 38%", "30% 62%", "76% 68%", "55% 52%"].map((position, index) => <span key={position} className={`absolute h-2.5 w-2.5 rounded-full border-2 border-[#172638] ${index % 3 === 1 ? "bg-rose-400" : index % 3 === 2 ? "bg-amber-400" : "bg-cyan-400"}`} style={{ left: position.split(" ")[0], top: position.split(" ")[1] }} />)}</div></section><section className="control-surface overflow-hidden rounded-[7px]"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Live Device Status</h2></div><div className="divide-y divide-slate-800/70 px-3.5">{devices.map(([label, value], index) => <div key={label} className="flex items-center justify-between py-2.5 text-[10px]"><span className="flex items-center gap-2 text-slate-300"><i className={`h-2 w-2 rounded-full ${index === 1 ? "bg-emerald-400" : "bg-amber-400"}`} />{label}</span><span className="mono text-[9px] text-slate-500">{value}</span></div>)}</div></section></div></main>;
}

function ControllersPage({ notify }: { notify: Notify }) {
  const rows = [
    { controller: "North Wing Panel", id: "CTRL—4142", model: "Mercury AERO", branch: "HQ — North Wing", readers: "8", points: "4", status: "Online" },
    { controller: "Server Room Panel", id: "CTRL—4143", model: "HID VertX", branch: "HQ — Basement", readers: "2", points: "2", status: "Online" },
    { controller: "Loading Dock Panel", id: "CTRL—4150", model: "Mercury AERO", branch: "HQ — Loading Dock", readers: "3", points: "6", status: "Offline" },
    { controller: "East Annex Panel", id: "CTRL—4161", model: "HID Edge", branch: "East Annex", readers: "6", points: "3", status: "Tamper" },
  ];
  return <ModuleTablePage notify={notify} module="Controllers" title="Controller Management" eyebrow="SECURITY VIEW · MODULE 12" description="Registration, configuration, hardware replacement, and reader/I-O inventory for physical access controllers." action="Register Controller" columns={[{ key: "controller", label: "CONTROLLER" }, { key: "model", label: "MODEL" }, { key: "branch", label: "BRANCH" }, { key: "readers", label: "READERS" }, { key: "points", label: "I/O POINTS" }, { key: "status", label: "STATUS" }]} rows={rows} searchPlaceholder="Search by controller name or ID" />;
}

function AreasPage({ notify }: { notify: Notify }) {
  const areas = [["Server Room A", "2", "8", "Real (Hard)"], ["R&D Lab Zone", "5", "12", "Real (Soft)"], ["Main Lobby", "18", "88", "Timed"]];
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="SECURITY VIEW · MODULE 13" title="Area Control" description="Real & timed anti-passback enforcement, occupancy control, and air lock/mantrap configuration." /><section className="control-surface rounded-[7px] p-3.5"><h2 className="text-[12px] font-semibold text-slate-200">Areas & Occupancy</h2><div className="mt-3 grid gap-2.5 md:grid-cols-3">{areas.map(([name, current, capacity, mode]) => <div key={name} className="rounded-[7px] border border-slate-800 bg-[#0e1928] p-3"><div className="flex justify-between text-[10px] font-semibold text-slate-300"><span>{name}</span><span className="rounded bg-sky-500/15 px-2 py-1 text-[8px] text-sky-300">{mode}</span></div><div className="mt-3 text-[17px] font-semibold text-slate-100">{current} <span className="text-[10px] text-slate-600">/ {capacity}</span></div><div className="mt-2 h-1 rounded-full bg-slate-800"><div className="h-1 rounded-full bg-cyan-400" style={{ width: `${Number(current) / Number(capacity) * 100}%` }} /></div></div>)}</div></section><div className="mt-2.5 grid gap-2.5 lg:grid-cols-2"><section className="control-surface rounded-[7px] p-3.5"><h2 className="text-[12px] font-semibold text-slate-200">Anti-Passback Configuration</h2><label className="mt-4 block text-[9px] uppercase tracking-[.1em] text-slate-600">Reader<select className="mt-1 h-8 w-full rounded border border-slate-700 bg-[#101e2e] px-2 text-[10px] text-slate-300"><option>Server Room A — In</option></select></label><div className="mt-4 text-[9px] uppercase tracking-[.1em] text-slate-600">Area control response<div className="mt-2 flex gap-1"><button onClick={() => notify("Soft response selected.", "info")} className="rounded bg-slate-800 px-3 py-1.5 text-[9px] text-slate-400">Soft</button><button onClick={() => notify("Hard response selected.", "success")} className="rounded bg-cyan-400 px-3 py-1.5 text-[9px] font-semibold text-[#062d31]">Hard</button></div></div><div className="mt-4 rounded bg-[#152337] p-2.5 text-[9px] text-slate-500">Two-user badge-in within the debounce window is logged as a card-not-shown/tailgating event.</div></section><section className="control-surface rounded-[7px] p-3.5"><h2 className="text-[12px] font-semibold text-slate-200">Air Lock / Mantrap</h2><div className="mt-4 flex items-center justify-between text-[10px] text-slate-300">Enable air lock <button onClick={() => notify("Air lock setting updated.", "success")} className="h-4 w-8 rounded-full bg-cyan-400 p-0.5"><span className="ml-auto block h-3 w-3 rounded-full bg-[#062d31]" /></button></div><div className="mt-5 text-[9px] uppercase tracking-[.1em] text-slate-600">Threshold mode<div className="mt-2 rounded bg-cyan-400 px-3 py-1.5 text-[9px] font-semibold text-[#062d31]">Single Adjacent Area</div></div><label className="mt-5 block text-[9px] uppercase tracking-[.1em] text-slate-600">Door pair<select className="mt-1 h-8 w-full rounded border border-slate-700 bg-[#101e2e] px-2 text-[10px] text-slate-300"><option>Lobby Vestibule (Door A / Door B)</option></select></label></section></div></main>;
}

function LogicalAreasPage() {
  const areas = [["Server Room A", "2", "Daniel Osei, Fatima Al-Sayed"], ["R&D Lab Zone", "5", "Sofia Herrera, +4 more"], ["Main Lobby", "18", "18 employees, 1 visitor"], ["East Annex Floor 2", "7", "7 employees"], ["Loading Dock", "3", "Jonas Berg, +2 contractors"], ["NOC", "1", "Daniel Osei"]];
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="SECURITY VIEW · MODULE 14" title="Logical Area Control" description="Software-level area modeling for occupancy visibility — Who's Where tracking and area grouping." /><section className="control-surface rounded-[7px] p-3.5"><h2 className="text-[12px] font-semibold text-slate-200">Who's Where</h2><div className="relative mt-3 max-w-[330px]"><Search size={13} className="absolute left-2.5 top-2.5 text-slate-600" /><input className="h-8 w-full rounded border border-slate-800 bg-[#0b1522] pl-8 text-[10px] text-slate-300" placeholder="Search by area or user..." /></div><div className="mt-3 grid gap-2.5 md:grid-cols-3">{areas.map(([name, count, detail]) => <div key={name} className="relative rounded-[7px] border border-slate-800 bg-[#0e1928] p-3"><span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-400" /><div className="text-[10px] font-semibold text-slate-300">{name}</div><div className="mt-3 text-[17px] font-semibold text-slate-100">{count}</div><div className="mt-1 text-[9px] text-slate-600">{detail}</div></div>)}</div></section></main>;
}

function AlarmsPage({ notify }: { notify: Notify }) {
  const [activeTab, setActiveTab] = useState("Alarm Class");
  const [alarmClass, setAlarmClass] = useState("Critical");
  const [profile, setProfile] = useState("Standard 3-Level");
  const classes = [["Critical", "Immediate response required", "bg-rose-400"], ["Warning", "Response required within shift", "bg-amber-400"], ["Attention", "Review during routine patrol", "bg-blue-400"], ["Normal", "Informational only", "bg-emerald-400"]];
  const content = activeTab === "Alarm Class" ? <div className="grid gap-2.5 p-3.5 md:grid-cols-2 xl:grid-cols-4">{classes.map(([label, detail, color]) => <button key={label} onClick={() => notify(`${label} alarm class selected.`, label === "Critical" ? "warning" : "info")} className="rounded-[7px] border border-slate-800 bg-[#0e1928] p-3 text-left hover:border-cyan-500/40"><div className="flex items-center gap-2 text-[10px] font-semibold text-slate-200"><span className={`h-2 w-2 rounded-sm ${color}`} />{label}</div><div className="mt-2 text-[9px] text-slate-600">{detail}</div></button>)}</div> : activeTab === "Escalation" ? <div className="p-3"><div className="mb-2 rounded-[6px] border border-slate-700 bg-[#172438] px-3 py-2.5 text-[9px] text-slate-500"><ShieldAlert size={13} className="mr-2 inline" />Escalate-to-User and Escalate-to-Facility can run independently or combined, across up to 5 sequential levels.</div><div className="space-y-2">{[["1", "Fatima Al-Sayed (Security Operator)", "Escalates after 5 min without acknowledgment"], ["2", "Priya Nair (Security Manager)", "Escalates after 10 min without acknowledgment"], ["3", "Facility-wide broadcast", "Escalates after 15 min without acknowledgment"], ["!", "Terminal fallback", "If all levels time out: unacknowledged facility-wide broadcast + super-admin notification"]].map(([level, title, detail]) => <div key={title} className={`relative rounded-[6px] border ${level === "!" ? "border-rose-500" : "border-slate-800"} bg-[#172438] px-3 py-2.5 pl-8`}><span className="absolute left-2 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[8px] font-bold text-[#062d31]">{level}</span><div className={`text-[10px] font-semibold ${level === "!" ? "text-rose-300" : "text-slate-200"}`}>{title}</div><div className="mt-1 text-[9px] text-slate-500">{detail}</div></div>)}</div></div> : activeTab === "Instructions & Remarks" ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] border-collapse text-left text-[10px]"><thead className="bg-[#152337] text-[9px] tracking-[.08em] text-slate-500"><tr><th className="px-3 py-2.5">INSTRUCTION SET</th><th className="px-3 py-2.5">APPLIES TO</th><th className="px-3 py-2.5">LAST UPDATED</th></tr></thead><tbody className="divide-y divide-slate-800/70"><tr><td className="px-3 py-3 font-semibold text-slate-200">Door Forced Open — Standard Response</td><td className="px-3 py-3">All perimeter doors</td><td className="mono px-3 py-3">2026—07—02</td></tr><tr><td className="px-3 py-3 font-semibold text-slate-200">Server Room Tamper — Escalated</td><td className="px-3 py-3">Server Room A, B</td><td className="mono px-3 py-3">2026—06—18</td></tr></tbody></table></div> : <div className="space-y-3 p-3.5"><label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">Alarm class<select value={alarmClass} onChange={(event) => setAlarmClass(event.target.value)} className="mt-2 h-9 w-full rounded-[4px] border border-cyan-500 bg-[#0d1725] px-2 text-[11px] normal-case tracking-normal text-slate-200 outline-none"><option>Critical</option><option>Warning</option><option>Attention</option><option>Normal</option></select></label><label className="block text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">Escalation profile<select value={profile} onChange={(event) => setProfile(event.target.value)} className="mt-2 h-9 w-full rounded-[4px] border border-cyan-500 bg-[#0d1725] px-2 text-[11px] normal-case tracking-normal text-slate-200 outline-none"><option>Standard 3-Level</option><option>Immediate Facility-wide</option><option>Silent Log Only</option></select></label><div className="rounded-[6px] border border-slate-700 bg-[#172438] px-3 py-2.5 text-[9px] text-slate-500"><ShieldAlert size={13} className="mr-2 inline" />Door Held Open and Door Forced Open are tracked as distinct alarm conditions with independent policy assignment.</div></div>;
  return <main className="mx-auto max-w-[1420px] px-4 pb-10 pt-[78px] sm:px-6 lg:px-8"><SectionHeading eyebrow="SECURITY VIEW · MODULE 15" title="Alarm Management" description="Classification, escalation, standard messaging, and policy assignment for security alarms." actions={<Button onClick={() => notify("New alarm class opened.", "info")} icon={Plus} kind="primary" testId="button-new-alarm">New</Button>} /><section className="control-surface overflow-hidden rounded-[7px]" data-testid="section-alarm-configuration"><div className="border-b border-slate-800/80 px-3.5 py-3"><h2 className="text-[12px] font-semibold text-slate-200">Alarm Configuration</h2></div><div className="flex gap-4 overflow-x-auto border-b border-slate-800/80 bg-[#0f1b2b] px-3.5 pt-2.5">{["Alarm Class", "Escalation", "Instructions & Remarks", "Alarm Policy"].map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 pb-2.5 text-[10px] ${activeTab === tab ? "border-cyan-400 font-semibold text-cyan-300" : "border-transparent text-slate-500 hover:text-slate-300"}`}>{tab}</button>)}</div>{content}</section></main>;
}

function InfoTile({ icon: Icon, label, value, detail, tone = "normal" }: { icon: LucideIcon; label: string; value: string; detail: string; tone?: "normal" | "good" }) {
  return <div className="control-surface flex items-center gap-3 rounded-[6px] p-3.5"><div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-slate-800/70 text-slate-500"><Icon size={15} /></div><div><div className="text-[9px] tracking-[.08em] text-slate-600">{label}</div><div className={`mt-1 text-[11px] font-semibold ${tone === "good" ? "text-emerald-400" : "text-slate-200"}`}>{value}</div><div className="mt-0.5 text-[9px] text-slate-600">{detail}</div></div></div>;
}

function UnavailablePage({ label, notify }: { label: string; notify: Notify }) {
  return <main className="mx-auto flex min-h-[100dvh] max-w-[1420px] items-center justify-center px-5 pt-[54px]"><div className="control-surface max-w-[420px] rounded-[7px] p-8 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[5px] bg-cyan-500/10 text-cyan-400"><MonitorCog size={20} /></div><h1 className="mt-4 text-[16px] font-semibold text-slate-100">{label}</h1><p className="mt-2 text-[11px] leading-5 text-slate-500">This module is staged for the HRS Tech operations environment. User Management and Platform Requirements are ready in this build.</p><Button onClick={() => notify("Returning to User Management.", "info")} kind="primary" testId="button-return-users">Return to User Management</Button></div></main>;
}

function DashboardShell() {
  const [sidebarCompact, setSidebarCompact] = useState(true);
  const [notice, setNotice] = useState<{ message: string; tone: NoticeTone } | null>(null);
  const notify: Notify = (message, tone = "success") => {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 3200);
  };
  return (
    <div className="dashboard-shell hairline-grid min-h-[100dvh] bg-[#09111d]">
      <Topbar onMenu={() => setSidebarCompact(false)} notify={notify} />
      <Sidebar compact={sidebarCompact} onClose={() => setSidebarCompact(true)} notify={notify} />
      {!sidebarCompact && <button className="fixed inset-0 z-30 bg-[#050a11]/55 md:hidden" onClick={() => setSidebarCompact(true)} aria-label="Close navigation overlay" data-testid="button-close-navigation-overlay" />}
      <div className="min-h-[100dvh] md:pl-[232px]">
        <Switch>
          <Route path="/users"><UserManagementPage notify={notify} /></Route>
          <Route path="/mobile-users"><MobileUsersPage notify={notify} /></Route>
          <Route path="/credentials"><CredentialsPage notify={notify} /></Route>
          <Route path="/access"><AccessPage notify={notify} /></Route>
          <Route path="/attendance"><AttendancePage notify={notify} /></Route>
          <Route path="/visitors"><VisitorsPage notify={notify} /></Route>
          <Route path="/reports"><ReportsSnapshotPage notify={notify} /></Route>
          <Route path="/requests"><RequestsSnapshotPage notify={notify} /></Route>
          <Route path="/analytics"><AnalyticsPage /></Route>
          <Route path="/settings"><SettingsSnapshotPage notify={notify} /></Route>
          <Route path="/monitoring"><MonitoringPage notify={notify} /></Route>
          <Route path="/controllers"><ControllersPage notify={notify} /></Route>
          <Route path="/areas"><AreasPage notify={notify} /></Route>
          <Route path="/logical-areas"><LogicalAreasPage /></Route>
          <Route path="/alarms"><AlarmsPage notify={notify} /></Route>
          <Route path="/requirements"><RequirementsPage notify={notify} /></Route>
          <Route path="/users/:rest"><UnavailablePage label="User record" notify={notify} /></Route>
          <Route><UnavailablePage label="Operations module" notify={notify} /></Route>
        </Switch>
      </div>
      {notice && <div className={`fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-[5px] border px-3.5 py-2.5 text-[10px] shadow-2xl ${notice.tone === "warning" ? "border-amber-500/30 bg-[#281e11] text-amber-200" : notice.tone === "info" ? "border-slate-600 bg-[#182638] text-slate-200" : "border-emerald-500/30 bg-[#102a28] text-emerald-200"}`} role="status" data-testid="status-action-notice"><span className={`h-1.5 w-1.5 rounded-full ${notice.tone === "warning" ? "bg-amber-300" : notice.tone === "info" ? "bg-slate-300" : "bg-emerald-300"}`} />{notice.message}</div>}
    </div>
  );
}

function RootRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/users");
  }, [setLocation]);
  return null;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}><Switch><Route path="/" component={RootRedirect} /><Route path="/users" component={DashboardShell} /><Route path="/mobile-users" component={DashboardShell} /><Route path="/credentials" component={DashboardShell} /><Route path="/access" component={DashboardShell} /><Route path="/attendance" component={DashboardShell} /><Route path="/visitors" component={DashboardShell} /><Route path="/reports" component={DashboardShell} /><Route path="/requests" component={DashboardShell} /><Route path="/analytics" component={DashboardShell} /><Route path="/settings" component={DashboardShell} /><Route path="/monitoring" component={DashboardShell} /><Route path="/controllers" component={DashboardShell} /><Route path="/areas" component={DashboardShell} /><Route path="/logical-areas" component={DashboardShell} /><Route path="/alarms" component={DashboardShell} /><Route path="/requirements" component={DashboardShell} /><Route component={DashboardShell} /></Switch></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;