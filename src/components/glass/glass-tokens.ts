// One material configuration for the app; LiquidLens owns all optical rendering.
export const glassMaterial = {
  refraction: 18,
  bezel: 16,
  blur: 2,
  saturation: 1.25,
  specular: 0.65,
  tintHue: 212,
  tintOpacity: 0.08,
  quality: 360,
  tilt: false,
} as const

export const glassGeometry = {
  navigation: { radius: 24, bezel: 16 },
  button: { radius: 12, bezel: 8, refraction: 12 },
  dialog: { radius: 24, bezel: 18 },
} as const

export const glassAppearance = {
  light: { specular: glassMaterial.specular },
  dark: { specular: 0.30 },
} as const
