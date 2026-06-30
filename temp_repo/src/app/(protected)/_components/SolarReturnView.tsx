'use client'

import { PlanetaryReturnView } from './PlanetaryReturnView'

interface Props {
  subjectId: string
}

export function SolarReturnView({ subjectId }: Props) {
  return <PlanetaryReturnView subjectId={subjectId} returnType="solar" />
}
