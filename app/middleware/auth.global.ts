
export default defineNuxtRouteMiddleware((to) => {
  const logged = useCookie('is_logged')
  
  if (!logged.value && to.path !== '/') {
    return navigateTo('/')
  }

  if (logged.value && to.path === '/') {
    return navigateTo('/home')
  }
})
