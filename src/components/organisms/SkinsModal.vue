<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import SkinsPanel from '@/components/organisms/SkinsPanel.vue'

/**
 * The skin shop on its own — a thin frame around `SkinsPanel`.
 *
 * The shop proper is `ShopModal` (power runes + skins in two tabs); this
 * wrapper stays for any caller that only wants the materials.
 */
const model = defineModel<boolean>({ required: true })
const { t } = useI18n()
</script>

<template lang="pug">
  FModal(v-model="model" :title="t('skins.title')")
    SkinsPanel
</template>
