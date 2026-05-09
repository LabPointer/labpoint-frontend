export type ResourceInfo = ("TELAO" | "COMPUTADORES" | "TUBOS_DE_ENSAIO")[]

export type SpaceQuery = {
    query: string
    resources: ResourceInfo
    capacity: number
}

export type SpaceInfo = {
    name: string
    capacity: number
    resources: string[]
}

export type HorarioData = "M-Aula1" | "M-Aula2" | "M-Aula3" | "M-Aula4" | "M-Aula5" | "V-Aula1" | "V-Aula2" | "V-Aula3" | "V-Aula4" | "V-Aula5" | "N-Aula1" | "N-Aula2" | "N-Aula3" | "N-Aula4"