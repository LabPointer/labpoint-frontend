export type Spaces = {
    id: string;
    name: string;
    capacity: number;
    resources: string[];
}

export type Reserves = {
    id: string;
    startFrom: string;
    endFrom: string;
    spaceId: string;
}

export type CreateReserveBody = {
    startFrom: string;
    endUntil: string;
}