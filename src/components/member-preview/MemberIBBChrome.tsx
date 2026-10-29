import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicNavigation from "@/components/PublicNavigation";
import { useLevel2Language } from "@/hooks/useLevel2Language";
import type { Language } from "@/contexts/LanguageContext";
import { memberUrl } from "./ui";

type MemberLanguage = Language;

export interface MemberIBBHeaderProps {
  signedIn: boolean;
  canDeposit?: boolean;
  language: MemberLanguage;
  onLanguageChange: (language: MemberLanguage) => void;
}

export function MemberIBBHeader({
  signedIn,
  canDeposit,
  language,
  onLanguageChange,
}: MemberIBBHeaderProps) {
  const { setLanguage } = useLevel2Language();

  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  return (
    <div className="luxury-preview balance-home-shell contents">
      <Header restoreOriginalOnSmallScreens />
      <PublicNavigation
        memberContext={{
          signedIn,
          loginHref: memberUrl("login"),
          accountHref: memberUrl("profile"),
          balanceHref: canDeposit ? memberUrl("shuttle/balance") : undefined,
          shuttleHref: `/${language}/shuttle`,
          onLanguageChange: (nextLanguage: Language) => {
            onLanguageChange(nextLanguage);
          },
        }}
      />
    </div>
  );
}

export function MemberIBBFooter() {
  return (
    <div className="luxury-preview balance-home-shell contents">
      <Footer />
    </div>
  );
}
