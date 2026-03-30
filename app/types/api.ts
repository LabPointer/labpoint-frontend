export interface Space {
    name: string;
    capacity: number;
    resources: string[];
}

export interface Reservation {
    id: string;
    createdAt: string;
    date: string;
    startAt: string;
    endAt: string;
    spaceName: string;
}