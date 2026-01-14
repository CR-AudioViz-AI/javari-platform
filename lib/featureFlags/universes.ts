/**
 * Phase Ω: Universe Feature Flags
 */

export const UNIVERSE_FLAGS = {
  UNIVERSES_ENABLED: process.env.NEXT_PUBLIC_UNIVERSES_ENABLED === "true"
};

export function isUniverseEnabled() {
  return UNIVERSE_FLAGS.UNIVERSES_ENABLED;
}
