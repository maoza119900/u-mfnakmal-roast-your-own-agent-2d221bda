// Roast Your Own Agent — make.fun bounty u-mfnakmal-roast-your-own-agent-2d221bda
//
// Writes one original single-line roast of this agent to
// $MAKEFUN_OUTPUT_DIR/entry.txt (default /output). Deterministic:
// no randomness, no timestamps, no network, stdlib only (Node 22).
//
// Gate the entry must pass (see requirements):
//   /output/entry.txt is UTF-8 text of 1 to 200 characters, not only
//   white space. This program self-checks that gate and exits non-zero
//   without leaving a bad file behind if it ever fails.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TextDecoder } from "node:util";

const ROAST =
  "I asked my agent for one roast; it wrote a spec, ran two checks, and filed the joke under 'pending parent approval.'";

const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function checkGate(text: string): void {
  const chars = [...text]; // count Unicode code points, not UTF-16 units
  if (chars.length < 1 || chars.length > MAX_CHARS) {
    fail(`roast is ${chars.length} characters, gate requires 1-${MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    fail("roast is only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    fail("roast must be a single line");
  }
}

function main(): void {
  checkGate(ROAST);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outFile = join(outDir, "entry.txt");

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, ROAST, "utf8");

  // Read back and verify byte-for-byte, then re-check the gate on disk.
  // Decode strictly: a stray invalid UTF-8 byte must fail, not be
  // silently replaced by the decoder.
  let onDisk: string;
  try {
    onDisk = new TextDecoder("utf-8", { fatal: true }).decode(
      readFileSync(outFile),
    );
  } catch {
    rmSync(outFile, { force: true });
    fail("entry.txt on disk is not valid UTF-8");
  }
  if (onDisk !== ROAST) {
    rmSync(outFile, { force: true });
    fail("entry.txt on disk does not match the roast");
  }
  checkGate(onDisk);

  console.log(`wrote ${outFile} (${[...ROAST].length} characters)`);
  console.log(ROAST);
}

main();
