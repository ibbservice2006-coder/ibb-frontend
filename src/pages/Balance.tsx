import { useState, useSyncExternalStore } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import PublicNavigation from "@/components/PublicNavigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingFallback from "@/components/LoadingFallback";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { WalletBalanceCards } from "@/components/wallet/WalletBalanceCards";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import { DepositForm } from "@/components/wallet/DepositForm";
import { Navigate, useSearchParams } from "react-router-dom";
import { useMemberSession, memberLoginHref } from "@/components/member-preview/member-navigation";
import { memberUrl } from "@/components/member-preview/ui";

const desktopQuery = "(min-width: 1280px)";
const subscribeToDesktop = (onChange: () => void) => {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const isDesktopScreen = () => window.matchMedia(desktopQuery).matches;
const serverDesktopScreen = () => false;

const ExistingWalletContent = () => {
  const { balance, totalDeposits, totalSpent, transactions, profileId, isLoading, refetch } = useWallet();
  const [showDepositForm, setShowDepositForm] = useState(false);

  return <>
    <WalletBalanceCards balance={balance} totalDeposits={totalDeposits} totalSpent={totalSpent} isLoading={isLoading} onDeposit={() => setShowDepositForm(true)} />
    <TransactionHistory transactions={transactions} isLoading={isLoading} />
    <DepositForm open={showDepositForm} onOpenChange={setShowDepositForm} profileId={profileId} onSuccess={refetch} />
  </>;
};

const Balance = () => {
  const isDesktop = useSyncExternalStore(subscribeToDesktop, isDesktopScreen, serverDesktopScreen);
  const [searchParams] = useSearchParams();
  const uiSession = useMemberSession();
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const balanceDestination = memberUrl("shuttle/balance");
  const showPaymentPreview = isDesktop && searchParams.get("preview") === "payment-ui-v1";

  if (showPaymentPreview) return <Navigate to={uiSession ? balanceDestination : memberLoginHref(balanceDestination)} replace />;
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to={uiSession ? balanceDestination : memberLoginHref(balanceDestination)} replace />;

  return (
    <>
      <Helmet>
        <title>Balance & Payments - IBB Shuttle Service</title>
        <meta name="description" content="Manage your wallet balance and payments for IBB Shuttle Service" />
      </Helmet>

      <div className="luxury-preview balance-home-shell contents">
        {isDesktop ? <Header restoreOriginalOnSmallScreens /> : <Header />}
        {isDesktop ? <PublicNavigation /> : <Navigation />}
      </div>

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.nav.balancePayments}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your account balance, view transaction history, and make payments.
            </p>
          </div>
          <ExistingWalletContent />
        </div>
      </main>

      <div className="luxury-preview balance-home-shell contents">
        <Footer />
      </div>
    </>
  );
};

export default Balance;
