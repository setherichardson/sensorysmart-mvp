"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import ActivityRatingClient from "./ActivityRatingClient";

export default function ActivityRatingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActivityRatingClient />
    </Suspense>
  );
} 