"use client";
import { FullPageState, StatePrimaryBtn, StateSecondaryBtn } from "./components/StateShells";

export default function NotFound() {
  return (
    <FullPageState
      code="404"
      title="Page not found"
      body="The page you're looking for does not exist or is no longer available."
      actions={
        <>
          <StatePrimaryBtn label="Open Signux" href="/chat" />
          <StateSecondaryBtn
            label="Go back"
            onClick={() => {
              if (typeof window !== "undefined") window.history.back();
            }}
          />
        </>
      }
    />
  );
}
