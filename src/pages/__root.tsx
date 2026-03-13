import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Navbar from '@components/navbar'
import Footer from '@/components/footerbar'

export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar/>
      <Outlet/>
      <Footer />
      {
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
      }
    </>
  ),
})