import { z } from "zod"

export const authInfoSchema = z.object({
    username: z.string(),
    role: z.string(),
    expireIn: z.string()
})

export type AuthInfo = z.infer<typeof authInfoSchema>

export const getAuthInfo = () => {
    const authInfoCookie = useCookie<AuthInfo | undefined>('auth-info')
    return authInfoCookie.value
}

export const setAuthInfo = (authInfo: AuthInfo) => {
    const expireDate = new Date(authInfo.expireIn)
    const maxAge = Math.floor((expireDate.getTime() - Date.now()) / 1000)

    const authInfoCookie = useCookie<AuthInfo>('auth-info', {
        maxAge: maxAge > 0 ? maxAge : 60 * 60 * 2, // fallback to 2h
        sameSite: 'lax',
    })
    authInfoCookie.value = authInfo
}

export const removeAuthInfo = () => {
    const authInfoCookie = useCookie('auth-info')
    authInfoCookie.value = undefined
}