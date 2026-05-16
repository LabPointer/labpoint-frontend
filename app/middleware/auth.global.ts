
export default defineNuxtRouteMiddleware((to) => {
  const authInfo = useCookie('auth-info')
  
  if ((!authInfo.value || authInfo.value.length === 0) && (to.path !== '/' && to.path !== '/register')) {
    return navigateTo('/')
  }

  if (authInfo.value && to.path === '/') {
    return navigateTo('/home')
  }
})
