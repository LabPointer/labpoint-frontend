import z from "zod";

export const UserRole = z.enum(["OWNER", "ADMIN", "USER"]);
export const SpaceResources = z.enum(["Todos os equipamentos", "Notebooks", "Televisao", "Telao", "Tubos de ensaio"]);
export type SubjectData = {
    id: number;
    name: string;
}
export type CacheData = {
    id: number;
    name: string;
}