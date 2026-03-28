"use client";

import { useEffect } from "react";
import { migrateBrowserStorage } from "@/lib/storage-migration";

/** Runs once per browser: migrates legacy localStorage/sessionStorage keys to Sukgo. */
export default function StorageMigration() {
  useEffect(() => {
    migrateBrowserStorage();
  }, []);
  return null;
}
