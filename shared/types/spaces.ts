//export type ResourceInfo = ("TELAO" | "COMPUTADORES" | "TUBOS_DE_ENSAIO")[]

export type SpaceQuery = {
    query: string
    resources: number[]
    capacity: number
}

export type SpaceInfo = {
    id: number
    name: string
    capacity: number
    resources: string[]
}

export type Schedules = "M_AULA_1" | "M_AULA_2" | "M_AULA_3" | "M_AULA_4" | "M_AULA_5" | "V_AULA_1" | "V_AULA_2" | "V_AULA_3" | "V_AULA_4" | "V_AULA_5" | "N_AULA_1" | "N_AULA_2" | "N_AULA_3" | "N_AULA_4"