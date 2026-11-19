import { createFileRoute } from "@tanstack/react-router";
import { useMe } from "#/lib/queries/accounts";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { QueryBoundary } from "@/components/shared/QueryBoundary";

export const Route = createFileRoute("/_private/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const me = useMe();

  return (
    <section className="container">
      <QueryBoundary
        isPending={me.isPending}
        isError={me.isError}
        error={me.error}
        isEmpty={!me.data}
        loadingText="Carregando perfil..."
      >
        {me.data && <ProfileForm key={me.data.id} account={me.data} />}
      </QueryBoundary>
    </section>
  );
}
