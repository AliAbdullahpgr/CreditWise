import Logo from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
       <div className="absolute top-4 left-4">
         <Link href="/">
          <Logo />
         </Link>
       </div>
      {children}
    </div>
  );
}
