export interface SpaceQuery {
    query: string
    resources: string[]
    capacity: number
}

export interface SpaceInfo {
    name: string
    capacity: number
    resources: string[]
}