import type { UsageSession } from "#/lib/queries/usage";
import { fmtTime } from "./usage-format";

export type WindowState = { open: boolean; reason?: string };

/** O check-in só vale entre a abertura e o fechamento da janela (mesma regra do backend). */
export function checkInWindow(session: UsageSession, now: number): WindowState {
  if (now < Date.parse(session.checkInOpensAt)) {
    return { open: false, reason: `O check-in abre às ${fmtTime(session.checkInOpensAt)}.` };
  }
  if (now > Date.parse(session.checkInClosesAt)) {
    return { open: false, reason: "O prazo do check-in terminou." };
  }
  return { open: true };
}

/** O check-out abre no início do último horário do turno e fecha 60 min depois do fim dele. */
export function checkOutWindow(session: UsageSession, now: number): WindowState {
  if (now < Date.parse(session.checkOutOpensAt)) {
    return { open: false, reason: `O check-out abre às ${fmtTime(session.checkOutOpensAt)}.` };
  }
  if (now > Date.parse(session.checkOutClosesAt)) {
    return { open: false, reason: "O prazo do check-out terminou: procure a coordenação." };
  }
  return { open: true };
}
