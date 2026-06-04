<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const route = useRoute()

const api = useApi()

const schema = z.object({
    username: z.string().min(5, 'Nome de usuario deve ter pelo menos 5 caracteres').max(32, "Nome de usuario nao pode ter mais de 32 caracteres"),
    email: z.email('Email invalido').max(320, 'Email nao pode ser acima de 320 caracteres'),
    registration: z.string().min(5, 'Matricula deve ter pelo menos 5 caracteres').max(16, "Matricula nao deve ter no maximo 16 caracteres"),
    password: z.string().min(5, 'Senha deve ter pelo menos 5 caracteres').max(16, "Senha deve ter no maximo 16 caracteres"),
    passwordConfirm: z.string().min(5, 'Senha deve ter pelo menos 5 caracteres'),
    role: z.enum(['ADMIN', 'USER'])
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    username: undefined,
    email: undefined,
    registration: undefined,
    password: undefined,
    passwordConfirm: undefined,
    role: undefined
})

const formRef = ref()
const toast = useToast()

const isLoading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (event.data.password !== event.data.passwordConfirm) {
        toast.error({
            title: 'Erro',
            message: 'Senhas nao coincidem!',
            color: 'red',
            position: 'bottomCenter',
            timeout: 3000,
        })
        return
    }

    console.log(event.data)
    
    isLoading.value = true
    api.POST("/auth/register", {
        body: {
            username: event.data.username,
            email: event.data.email,
            registration: event.data.registration,
            password: event.data.password,
            role: event.data.role
        }
    })
    .then(res => {
        const { status } = res.response

        if (status !== 201) {
            toast.error({
                title: 'Erro',
                message: 'Erro ao registrar usuario!',
                color: 'red',
                position: 'bottomCenter',
                timeout: 3000,
            })
            return
        }      

        toast.success({
            title: 'Sucesso',
            message: 'Cadastro realizado com sucesso!',
            color: 'green',
            position: 'bottomCenter',
            timeout: 1000,
            onClosing: () => {
                navigateTo('/')
            }
        })
    }).catch((error) => {
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
                <UFormField label="Nome de usuário" name="username">
                    <UInput v-model="state.username" class="w-full" :disabled="isLoading" />
                </UFormField>

                <UFormField label="Email" name="email">
                    <UInput v-model="state.email" type="email" class="w-full" :disabled="isLoading" />
                </UFormField>

                <UFormField label="Matrícula" name="registration">
                    <UInput v-model="state.registration" class="w-full" :disabled="isLoading" />
                </UFormField>

                <UFormField label="Senha" name="password">
                    <UInput v-model="state.password" type="password" class="w-full" :disabled="isLoading" />
                </UFormField>

                <UFormField label="Confirmação de senha" name="passwordConfirm">
                    <UInput v-model="state.passwordConfirm" type="password" class="w-full" :disabled="isLoading" />
                </UFormField>

                <UFormField label="Cargo" name="role">
                    <USelect v-model="state.role" :items="['ADMIN', 'USER']" class="w-full"
                        :disabled="isLoading" />
                </UFormField>

                <NuxtLink to="/" class="cursor-pointer text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 font-medium">Voltar a pagina de login?</NuxtLink>
            </UForm>

            <template #footer>
                <div class="flex justify-end gap-x-4">
                    <UButton variant="subtle" color="neutral" @click="onReset" class="cursor-pointer"
                        :loading="isLoading">
                        Resetar
                    </UButton>

                    <UButton type="submit" form="login-form" color="primary" @click="formRef?.submit()"
                        class="cursor-pointer" :loading="isLoading">
                        Cadastrar
                    </UButton>
                </div>
            </template>
        </UCard>
    </section>
</template>
