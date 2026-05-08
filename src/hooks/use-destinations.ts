"use client";

import { useQuery } from "@tanstack/react-query";
import type { Destination } from "@/lib/types/destination";

async function fetchDestinations(): Promise<Destination[]> {
  const response = await fetch("/api/destinations");
  if (!response.ok) throw new Error("Failed to fetch destinations");
  return (await response.json()) as Destination[];
}

export function useDestinations() {
  return useQuery({ queryKey: ["destinations"], queryFn: fetchDestinations });
}
