<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const route = useRoute()

const api = useApi()

const schema = z.object({
    registration: z.string('Matricula invalida'),
    password: z.string('Senha invalida').min(6, 'Senha deve ter pelo menos 6 caracteres')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    registration: undefined,
    password: undefined
})

const formRef = ref()
const toast = useToast()

const isLoading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
    isLoading.value = true
    api.POST("/auth/login", {
        body: {
            registration: event.data.registration,
            password: event.data.password
        }
    })
    .then(res => {
        const { status } = res.response

        if (status !== 200 || !res.data) {
            toast.error({
                title: 'Erro',
                message: 'Matricula ou senha invalidos!',
                color: 'red',
                position: 'bottomCenter',
                timeout: 3000,
            })
            return
        }

        const authInfo = res.data;
        setAuthInfo({
            ...authInfo,
            expireIn: authInfo.tokenExpireIn?.toString() || ""
        } satisfies z.infer<typeof authInfoSchema>)        

        toast.success({
            title: 'Sucesso',
            message: 'Login realizado com sucesso!',
            color: 'green',
            position: 'bottomCenter',
            timeout: 1000,
            onClosing: () => {
                navigateTo('/home')
            }
        })
    }).catch(error => {
        toast.error({
            title: 'Erro',
            message: `Falha ao tentar realizar login!\n${error}`,
            color: 'red',
            position: 'bottomCenter',
            timeout: 3000,
        })
    })
    .finally(() => isLoading.value = false)
}

function onReset() {
    state.registration = undefined
    state.password = undefined
    formRef.value.clear()
}
</script>

<template>
    <section class="w-full flex justify-center">
        <UCard title="Labpoint" description="Bem vindo(a)" class="w-full max-w-md" :ui="{
            root: 'rounded-md bg-white/10 dark:bg-neutral-950/50 dark:backdrop-brightness-160 ring ring-indigo-700/10 dark:ring-violet-400/15 shadow-md shadow-violet-900/10 dark:shadow-violet-500/20',
            title: 'font-bold text-3xl text-blue-600 dark:text-blue-400 text-center',
            description: 'text-center text-base'
        }">
            <UForm :ref="formRef" id="login-form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Matrícula" name="matricula">
                    <UInput v-model="state.registration" class="w-full" :disabled="isLoading" />
                </UFormField>

                <UFormField label="Senha" name="password">
                    <UInput v-model="state.password" type="password" class="w-full" :disabled="isLoading" />
                </UFormField>

                <div class="flex justify-between items-center">
                    <UButton label="Esqueceu a senha?" variant="link" color="info" class="px-0 cursor-pointer"
                        :disabled="isLoading" />

                    <NuxtLink to="/register" class="cursor-pointer text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 font-medium">Criar uma conta?</NuxtLink>
                </div>
            </UForm>

            <template #footer>
                <div class="flex justify-end gap-x-4">
                    <UButton variant="subtle" color="neutral" @click="onReset" class="cursor-pointer"
                        :loading="isLoading">
                        Resetar
                    </UButton>

                    <UButton type="submit" form="login-form" color="primary" @click="formRef?.submit()"
                        class="cursor-pointer" :loading="isLoading">
                        Entrar
                    </UButton>
                </div>
            </template>
        </UCard>
    </section>
</template>
