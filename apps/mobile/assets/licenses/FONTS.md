# Fonts

Inter and Inter Tight (SIL Open Font License 1.1, `inter-OFL.txt`); the files are in `../fonts`, in the weights Penny uses.

Each file's internal family and PostScript name is set to its file name (`Inter_400Regular`, …),
so `fontFamily: "Inter_400Regular"` resolves the same way on Android (file name) and iOS
(PostScript name). The design system's `tailwind-preset.js` and `src/lib/theme.ts` use these names.

After adding or changing a font, run `bunx react-native-asset` from `apps/mobile` to copy it into
`android/` and `ios/`.
