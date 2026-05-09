import { HeroSection } from "@/components/HeroSection";
import { ModalAutoOpener } from "@/components/ModalAutoOpener";

type Props = {
  searchParams: { callbackUrl?: string; error?: string };
};

export default function Home({ searchParams }: Props) {
  // If NextAuth redirected here with a callbackUrl or error, auto-open the sign-in modal
  const shouldOpenModal = !!searchParams.callbackUrl || !!searchParams.error;

  return (
    <div className="relative">
      <HeroSection />
      <ModalAutoOpener shouldOpen={shouldOpenModal} />
    </div>
  );
}
