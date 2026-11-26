import { describe, expect, test } from "bun:test";
import { createVault } from "./vault.ts";

const KEY = Buffer.alloc(32, 7).toString("base64");

describe("vault", () => {
  const vault = createVault(KEY);

  test("opens what it sealed", () => {
    expect(vault.open("alice", vault.seal("alice", "Blue Tokai ☕"))).toBe("Blue Tokai ☕");
    expect(vault.open("alice", vault.seal("alice", ""))).toBe("");
  });

  test("the sealed value doesn't contain the text, and differs every time", () => {
    const a = vault.seal("alice", "Blue Tokai");
    expect(a).not.toContain("Blue Tokai");
    expect(vault.seal("alice", "Blue Tokai")).not.toBe(a);
  });

  test("another user can't open it", () => {
    expect(() => vault.open("bob", vault.seal("alice", "-24900"))).toThrow();
  });

  test("another key can't open it", () => {
    const other = createVault(Buffer.alloc(32, 8).toString("base64"));
    expect(() => other.open("alice", vault.seal("alice", "-24900"))).toThrow();
  });

  test("a changed value doesn't open", () => {
    const sealed = vault.seal("alice", "-24900");
    const bytes = Buffer.from(sealed.slice(3), "base64");
    bytes[14]! ^= 1;
    expect(() => vault.open("alice", `v1:${bytes.toString("base64")}`)).toThrow();
    expect(() => vault.open("alice", "nonsense")).toThrow();
  });

  test("rejects a short key", () => {
    expect(() => createVault(Buffer.alloc(16).toString("base64"))).toThrow();
  });

  test("fingerprints are stable per user, differ across users and don't show the value", () => {
    const ref = "432198765012";
    expect(vault.fingerprint("alice", ref)).toBe(vault.fingerprint("alice", ref));
    expect(vault.fingerprint("bob", ref)).not.toBe(vault.fingerprint("alice", ref));
    expect(vault.fingerprint("alice", ref)).not.toContain(ref);
  });
});
