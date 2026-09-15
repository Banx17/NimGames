import { WalletIcon } from "@/components/shell/icons";
import { WalletAuth } from "@/components/auth/WalletAuth";

export default function WalletPage() {
  return (
    <section className="flex flex-col items-center gap-4 px-4 py-12">
      <WalletIcon className="h-10 w-10 text-nim-text-muted" />
      <WalletAuth />
    </section>
  );
}
