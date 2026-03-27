import GlobalFooter from '@/components/layout/GlobalFooter';

interface LandingFooterProps {
  onSignIn: () => void;
}

export default function LandingFooter({ onSignIn }: LandingFooterProps) {
  void onSignIn;
  return <GlobalFooter />;
}
