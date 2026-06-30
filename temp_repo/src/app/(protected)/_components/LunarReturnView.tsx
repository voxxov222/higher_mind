'use client'

import { PlanetaryReturnView } from './PlanetaryReturnView'

interface Props {
  subjectId: string
}

export function LunarReturnView({ subjectId }: Props) {
  return <PlanetaryReturnView subjectId={subjectId} returnType="lunar" />
}
