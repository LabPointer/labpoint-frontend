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

export const Schedules: Map<string, string> = new Map<string, string>([
    ["M_AULA_1", "Manhã - 7:30 às 8:30"],
    ["M_AULA_2", "Manhã - 8:30 às 9:30"],
    ["M_AULA_3", "Manhã - 9:30 às 10:30"],
    ["M_AULA_4", "Manhã - 10:30 às 11:30"],
    ["M_AULA_5", "Manhã - 11:30 às 12:30"],
    ["V_AULA_1", "Tarde - 13:30 às 14:30"],
    ["V_AULA_2", "Tarde - 14:30 às 15:30"],
    ["V_AULA_3", "Tarde - 15:30 às 16:30"],
    ["V_AULA_4", "Tarde - 16:30 às 17:30"],
    ["V_AULA_5", "Tarde - 17:30 às 18:30"],
    ["N_AULA_1", "Noite - 18:30 às 19:30"],
    ["N_AULA_2", "Noite - 19:30 às 20:30"],
    ["N_AULA_3", "Noite - 20:30 às 21:30"],
    ["N_AULA_4", "Noite - 21:30 às 22:30"]
]);