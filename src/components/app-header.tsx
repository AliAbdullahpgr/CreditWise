import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import Logo from "@/components/logo";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
            <Link href="/">
                <Logo />
            </Link>
        </div>
        <SidebarTrigger className="hidden md:flex" />
        <div className="hidden md:block">
            <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
      </div>
      <div className="ml-auto">
        <UserNav />
      </div>
    </header>
  );
}
