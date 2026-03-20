export type Spaces = {
    name: string;
    capacity: number;
    resources: string[];
}

export type Reserves = {
    foundReserves: {
        id: string;
        createdAt: string;
        startAt: string;
        endAt: string;
        spaceName: string;
    }[],
    conflictingReservation: {
        id: string;
        createdAt: string;
        startAt: string;
        endAt: string;
        spaceName: string;
    }
}

export type CreateReserveBody = {
    startAt: string;
    endAt: string;
}