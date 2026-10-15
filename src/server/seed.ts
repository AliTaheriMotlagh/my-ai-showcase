import "server-only";
import { randomInt } from "node:crypto";

/** A fresh random seed per page view, so Explore and Flow shuffle differently on every visit. */
export const newFeedSeed = (): number => randomInt(1_000_000);
