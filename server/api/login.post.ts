import { useApi } from "~~/shared/utils/restapi"

interface LoginBodyRequest {
    registration: string,
    password: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBodyRequest>(event)
  const { registration, password } = body
  
  const api = useApi()

  const res = await api.POST("/auth/login", {
    body: {
      registration,
      password,
    },
  })

  if (res.response.status !== 200 || !res.data) {
    setResponseStatus(event, res.response.status === 200 ? 400 : res.response.status)
    return { success: false }
  }

  setCookie(event, 'session_jwt', res.data.token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2
  })

  // Cookie de flag para o frontend saber que está logado
  setCookie(event, 'is_logged', 'true', {
    httpOnly: false, // OBRIGATÓRIO ser false para o middleware de rota ler no cliente
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2
  })

  setResponseStatus(event, 204)
  return { success: true }
})