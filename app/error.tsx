"use client";
import { FullPageState, StatePrimaryBtn, StateSecondaryBtn } from "./components/StateShells";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <FullPageState
      code="Error"
      title="Something went wrong"
      body="An unexpected error interrupted this page. You can try again or return to the product."
      actions={
        <>
          <StatePrimaryBtn label="Try again" onClick={reset} />
          <StateSecondaryBtn label="Go Home" href="/chat" />
        </>
      }
    />
  );
}
