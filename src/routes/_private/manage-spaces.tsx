import { ManageSpaceCard } from "#/components/manage-space/ManageSpaceCard"
import { ManageSpaceSearchBar } from "#/components/manage-space/ManageSpaceSearchBar"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute('/_private/manage-spaces')({
  component: RouteComponent,
})

function RouteComponent() {
  

  return (
    <>
      <section className="container mb-8">
        <ManageSpaceSearchBar />
      </section>
      <section className="container gap-8 flex flex-col">
        <h1 className="text-sm font-bold">8 espaço(s) encontrado(s) · 7 ativo(s) · 1 inativo(s)</h1>
        <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-center gap-6">
          <ManageSpaceCard />
          <ManageSpaceCard />
          <ManageSpaceCard />
        </div>
      </section>
    </>
  )
}
