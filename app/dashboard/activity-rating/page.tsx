"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import ActivityRatingClient from "./ActivityRatingClient";

// Force rebuild for deployment
export default function ActivityRatingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActivityRatingClient />
    </Suspense>
  );
} 