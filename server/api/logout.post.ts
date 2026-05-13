
export default defineEventHandler(async (event) => {
  setCookie(event, 'session_jwt', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })

  setCookie(event, 'is_logged', '', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })

  setResponseStatus(event, 204)
  return { success: true }
})