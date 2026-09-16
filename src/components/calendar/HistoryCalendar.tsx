import { useApi } from "#/lib/utils/restapi"


export function HistoryCalendar() {
    const api = useApi();

    {/*Implementar o a api de busca por mes e ano para mostrar no calendario por mes e no modo agenda*/}
    api.GET("/reserve", {
        params: {
            query: { yearMonth: "" }
        }
    })
    return (
        <div>
            <h1>History Calendar</h1>
        </div>
    )
}
