import GlobalFooter from '@/components/layout/GlobalFooter';

interface LandingFooterProps {
  onSignIn: () => void;
}

export default function LandingFooter({ onSignIn }: LandingFooterProps) {
  void onSignIn;
  return (
    <GlobalFooter
      ctaLabel="Run a simulation"
      ctaHref="/pricing"
      oneLiner="Business simulation engine — 10 specialists debating your decisions in seconds."
    />
  );
}
