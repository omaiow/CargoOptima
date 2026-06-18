with open(r'src\app\map\page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    'import { useEffect, useRef } from "react";',
    'import { useEffect, useRef, useMemo } from "react";'
)

old_str = """  const selectedRoute = {
    ...baseRoute,
    fromCoords: (baseRoute.id === "custom" && vehicleConfig.customFromCoords) ? vehicleConfig.customFromCoords : baseRoute.fromCoords,
    toCoords: (baseRoute.id === "custom" && vehicleConfig.customToCoords) ? vehicleConfig.customToCoords : baseRoute.toCoords,
  };"""

new_str = """  const selectedRoute = useMemo(() => ({
    ...baseRoute,
    fromCoords: (baseRoute.id === "custom" && vehicleConfig.customFromCoords) ? vehicleConfig.customFromCoords : baseRoute.fromCoords,
    toCoords: (baseRoute.id === "custom" && vehicleConfig.customToCoords) ? vehicleConfig.customToCoords : baseRoute.toCoords,
  }), [baseRoute, vehicleConfig.customFromCoords, vehicleConfig.customToCoords]);"""

text = text.replace(old_str, new_str)

with open(r'src\app\map\page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done!')
