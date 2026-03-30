export interface SpaceCardProps {
    type?: string
    title: string
    capacity: number
    resources: string[]
    icon?: string
}

export interface SpaceQuery {
    query: string
    resources: string[]
    capacity: number
}

export interface SpaceInfo {
    id: string
    name: string
    description: string
    capacity: number
    resources: string[]
    icon?: string
}