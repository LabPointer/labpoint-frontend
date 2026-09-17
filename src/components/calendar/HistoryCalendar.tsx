import { getDaysInMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCallback, useEffect, useRef, useState } from "react";
import { AgendaEventRow } from "#/components/calendar/AgendaEventRow";
import { MonthEventChip } from "#/components/calendar/MonthEventChip";
import { EventCalendar, type EventCalendarApi } from "#/components/reui/event-calendar/event-calendar.tsx";
import { EventCalendarContent } from "#/components/reui/event-calendar/event-calendar-content.tsx";
import type { EventCalendarI18nOverrides } from "#/components/reui/event-calendar/event-calendar-i18n.tsx";
import { EventCalendarNav, EventCalendarToolbar } from "#/components/reui/event-calendar/event-calendar-nav.tsx";
import type {
  CalendarEvent,
  CalendarView,
  EventCalendarRangeInfo,
} from "#/components/reui/event-calendar/event-calendar-types.tsx";
import { Card, CardContent } from "#/components/ui/card.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import type { ReservationEventData, ReserveHistoryDTO } from "#/lib/types/reservation-types";
import { apiToCalendarEvents, toYearMonth } from "#/lib/utils/reservation-utils";
import { useApi } from "#/lib/utils/restapi";

// ---------------------------------------------------------------------------
// i18n PT-BR
// ---------------------------------------------------------------------------

const PT_BR_I18N: EventCalendarI18nOverrides = {
  labels: {
    today: "Hoje",
    previous: "Anterior",
    next: "Próximo",
    allDay: "Dia inteiro",
    more: (count) => `+${count} mais`,
    noEvents: "Sem reservas",
    loading: "Carregando reservas...",
    selectView: "Selecionar visualização",
    goToDate: "Ir para data",
    dropNotAllowed: "Não é possível mover aqui",
    continues: "continua",
    timeFrom: (time) => `A partir de ${time}`,
    timeUntil: (time) => `Até ${time}`,
    timeRange: (from, to) => `${from} – ${to}`,
    resources: "Recursos",
    week: (n) => `S${n}`,
    event: "reserva",
    events: (count) => (count === 1 ? "1 reserva" : `${count} reservas`),
    addEvent: "Nova reserva",
    moreCompact: (count) => `+${count}`,
    toggleDayEvents: (count, expanded) => (expanded ? `Recolher ${count} reservas` : `Expandir ${count} reservas`),
    eventDetails: (title) => `Detalhes: ${title}`,
  },
  viewNames: {
    month: "Mês",
    week: "Semana",
    day: "Dia",
    days: (count) => `${count} dias`,
    agenda: "Agenda",
    resource: "Grade de Horários",
  },
  formats: {
    monthTitle: "MMMM yyyy",
    dayTitle: "EEEE, d 'de' MMMM 'de' yyyy",
    monthDayHeader: "EEE",
    monthDayHeaderNarrow: "EEEEE",
    agendaDayHeader: "EEEE, d 'de' MMMM",
    timeGridDayHeader: "EEE d",
    agendaDayNumber: "d",
    agendaWeekday: "EEE",
    moreDayHeader: "EEEE, d 'de' MMMM",
    monthCellAriaLabel: "PPPP",
    dayAria: "PPPP",
    timeGutter: "HH:mm",
    timeGutterMinute: "HH:mm",
    eventTime: "HH:mm",
    monthCellDay: "d",
  },
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

/**
 * Calendário de histórico de reservas.
 *
 * - Busca reservas via GET /reserve?yearMonth=YYYY-MM
 * - Exibe nas views Mês e Agenda (somente)
 * - View Agenda cobre apenas o mês selecionado (dia 1 ao último)
 * - Eventos não são arrastáveis
 * - Chips do mês abrem popup com detalhes
 * - Linhas da agenda têm botão "!" que abre modal com detalhes
 */
export function HistoryCalendar() {
  const api = useApi();
  const apiRef = useRef<EventCalendarApi<ReservationEventData> | null>(null);

  // Mês atualmente visível — rastreado para buscar a API e ajustar agendaDayCount
  const [activeMonth, setActiveMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [, setCurrentView] = useState<CalendarView>("month");
  const [events, setEvents] = useState<CalendarEvent<ReservationEventData>[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // ---------------------------------------------------------------------------
  // Busca de dados
  // ---------------------------------------------------------------------------
  const fetchReservations = useCallback(
    async (month: Date) => {
      setLoading(true);
      try {
        const { data, error } = await api.GET("/reserve", {
          params: { query: { yearMonth: toYearMonth(month) } },
        });

        if (error || !data) {
          setEvents([]);
          return;
        }

        setEvents(apiToCalendarEvents(data as ReserveHistoryDTO));
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
        setInitialLoaded(true);
      }
    },
    [api],
  );

  // Carga inicial
  useEffect(() => {
    fetchReservations(activeMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Detecta mudança de período no calendário (mês/navegação)
  // ---------------------------------------------------------------------------
  const handleRangeChange = useCallback(
    (info: EventCalendarRangeInfo) => {
      const newMonth = startOfMonth(info.date);
      const newMonthKey = toYearMonth(newMonth);
      const currentKey = toYearMonth(activeMonth);

      if (newMonthKey !== currentKey) {
        setActiveMonth(newMonth);
        fetchReservations(newMonth);

        // Na agenda: posicionar sempre no dia 1 do novo mês
        if (info.view === "agenda") {
          requestAnimationFrame(() => {
            apiRef.current?.goTo(newMonth);
          });
        }
      }
    },
    [activeMonth, fetchReservations],
  );

  // ---------------------------------------------------------------------------
  // Ao mudar para agenda, garante âncora no dia 1 do mês
  // ---------------------------------------------------------------------------
  const handleViewChange = useCallback(
    (view: CalendarView) => {
      setCurrentView(view);
      if (view === "agenda") {
        requestAnimationFrame(() => {
          apiRef.current?.goTo(startOfMonth(activeMonth));
        });
      }
    },
    [activeMonth],
  );

  // ---------------------------------------------------------------------------
  // agendaDayCount: cobre exatamente do dia 1 ao último do mês
  // ---------------------------------------------------------------------------
  const agendaDayCount = getDaysInMonth(activeMonth);

  // ---------------------------------------------------------------------------
  // renderEvent — chip para a view de Mês (renderizado dentro do wrapper do chip)
  // ---------------------------------------------------------------------------
  const renderMonthEvent = useCallback(
    ({ occurrence }: { occurrence: { event: CalendarEvent<ReservationEventData> } }) => {
      const data = occurrence.event.data;
      if (!data) return undefined;
      return <MonthEventChip data={data} />;
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // renderAgendaEvent — linha para a view de Agenda
  // ---------------------------------------------------------------------------
  const renderAgendaEvent = useCallback(
    ({ occurrence }: { occurrence: { event: CalendarEvent<ReservationEventData> } }) => {
      const data = occurrence.event.data;
      if (!data) return undefined;
      return <AgendaEventRow data={data} />;
    },
    [],
  );

  // Skeleton na primeira carga
  if (!initialLoaded) {
    return (
      <div className="w-full p-4">
        <Card className="w-full py-0">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-140 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <Card className="w-full py-0">
        <CardContent className="p-0">
          <EventCalendar<ReservationEventData>
            events={events}
            defaultView="month"
            views={["month", "agenda"]}
            defaultDate={activeMonth}
            agendaDayCount={agendaDayCount}
            loading={loading}
            locale={ptBR}
            i18n={PT_BR_I18N}
            weekStartsOn={0}
            // Desabilita todas as interações de drag/resize/criação de slot
            interactions={{ drag: false, resize: false, selectSlot: false }}
            apiRef={apiRef}
            onRangeChange={handleRangeChange}
            onViewChange={handleViewChange}
            renderEvent={renderMonthEvent}
            renderAgendaEvent={renderAgendaEvent}
            className="h-[640px] w-full"
          >
            {/* Barra de navegação — sem botões de Settings e New Event */}
            <div className="flex flex-wrap items-center gap-2 pe-2">
              <EventCalendarNav className="min-w-0 flex-1" />
              {/* EventCalendarToolbar vazio: mantém o layout sem adicionar botões */}
              <EventCalendarToolbar />
            </div>
            <EventCalendarContent />
          </EventCalendar>
        </CardContent>
      </Card>
    </div>
  );
}
