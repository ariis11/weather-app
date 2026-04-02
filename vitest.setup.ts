import { afterEach, vi } from "vitest";

afterEach(() => {
  vi.clearAllMocks();    // clears call history / instances on all vi.mock() mocks
  vi.restoreAllMocks();  // restores vi.spyOn() spies to their original implementation
  vi.unstubAllGlobals(); // removes vi.stubGlobal() overrides (e.g. fetch)
});
