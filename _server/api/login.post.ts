/*
import { useApi } from "~~/shared/utils/restapi"

interface LoginBodyRequest {
    registration: string,
    password: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBodyRequest>(event)
  const { registration, password } = body
  
  

  setResponseStatus(event, 204)
  return { success: true }
})
*/