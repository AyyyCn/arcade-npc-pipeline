import { survey } from "./director.js";
// The director's search runs off the main thread so the night keeps playing while it thinks.
self.onmessage = async ({ data }) => {
  try {
    const report = await survey(data.seed, async (nights) =>
      self.postMessage({ seed: data.seed, nights }),
    );
    self.postMessage({ seed: data.seed, report });
  } catch (error) {
    self.postMessage({ seed: data.seed, error: error.message });
  }
};
