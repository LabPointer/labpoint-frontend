<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const route = useRoute()

const schema = z.object({
    matricula: z.string('Matricula invalida'),
    password: z.string('Senha invalida').min(6, 'Senha deve ter pelo menos 6 caracteres')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    matricula: undefined,
    password: undefined
})

const formRef = ref()
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
    toast.success({ 
        title: 'Sucesso', 
        message: 'Login realizado com sucesso!', 
        color: 'green', 
        position: 'bottomCenter', 
        timeout: 1000,
        onClosed: () => {
            navigateTo('/home')
        }
    })
}

function onReset() {
    state.matricula = undefined
    state.password = undefined
    formRef.value.clear()
}
</script>

<template>
    <section class="w-full flex justify-center">
        <UCard title="Labpoint" description="Bem vindo(a)" class="w-full max-w-md" :ui="{
            root: 'rounded-md border-black/15 shadow-md shadow-black/10',
            title: 'font-bold text-3xl text-blue-600 text-center',
            description: 'text-center text-base'
        }">
            <UForm :ref="formRef" id="login-form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Matrícula" name="matricula">
                    <UInput v-model="state.matricula" class="w-full" />
                </UFormField>

                <UFormField label="Senha" name="password">
                    <UInput v-model="state.password" type="password" class="w-full" />
                </UFormField>

                <UButton label="Esqueceu a senha?" variant="link" color="info" class="px-0 cursor-pointer" />
            </UForm>

            <template #footer>
                <div class="flex justify-end gap-x-4">
                    <UButton variant="subtle" color="neutral" @click="onReset" class="cursor-pointer">
                        Resetar
                    </UButton>

                    <UButton type="submit" form="login-form" color="primary" @click="formRef?.submit()"
                        class="cursor-pointer">
                        Entrar
                    </UButton>
                </div>
            </template>
        </UCard>
    </section>
</template>
