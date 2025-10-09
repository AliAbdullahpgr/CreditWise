import { Wallet } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Wallet className="h-6 w-6 text-primary shrink-0" />
      <span className="font-bold text-xl font-headline group-data-[collapsible=icon]:hidden">
        CreditWise
      </span>
    </div>
  );
}
