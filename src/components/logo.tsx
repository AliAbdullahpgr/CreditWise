import { Landmark } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Landmark className="h-6 w-6 text-primary" />
      <span className="font-bold text-xl font-headline">CreditWise</span>
    </div>
  );
}
