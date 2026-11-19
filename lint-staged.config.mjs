import { lstatSync } from "node:fs";

// Prettier errors on explicitly passed symlinks (e.g. .claude/skills/*), which would block commits.
const notSymlink = (file) => !lstatSync(file).isSymbolicLink();

export default {
  "*": (files) => {
    const targets = files.filter(notSymlink);
    return targets.length
      ? `prettier --write --ignore-unknown ${targets.map((f) => JSON.stringify(f)).join(" ")}`
      : [];
  },
};
