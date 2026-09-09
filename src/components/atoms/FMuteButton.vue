<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import { mobileCheck } from '@/utils/function'
import { isMobilePortrait, isMobileLandscape } from '@/use/useUser'
import { isMuted, toggleMute } from '@/use/useCrazyMuteSync'
import { isMobileAudioMuted, toggleMobileAudioMute } from '@/use/useMobileAudioMute'

/**
 * The mute toggle. Two behaviours behind one button:
 *
 *   Desktop — a VOLUME mute: zeroes the stored sound + music volumes (Web
 *             Audio gain works there) and restores them on unmute.
 *   Mobile  — a hard SILENCE toggle: the OS rocker owns the device level, so
 *             the button suspends the whole audio layer instead, letting the
 *             player run their own music app.
 *
 * The glyph comes from the shared set rather than an emoji, so it renders the
 * same on every OS and reads as part of the HUD's own vocabulary.
 */
const { t } = useI18n()
const onMobile = mobileCheck()
</script>

<template lang="pug">
  div.flex.flex-col.items-end.gap-1
    button.mute-btn.rounded-full.backdrop-blur-sm.transition-all.cursor-pointer(
      v-if="!onMobile"
      type="button"
      class="bg-black/20 hover:bg-black/40 pointer-events-auto"
      :aria-label="t('options.soundEffects')"
      :aria-pressed="isMuted"
      @click="toggleMute"
    )
      GameIcon.mute-btn__icon(:name="isMuted ? 'sound-off' : 'sound'")
    button.mute-btn.rounded-full.backdrop-blur-sm.transition-all.cursor-pointer(
      v-else-if="isMobilePortrait || isMobileLandscape"
      type="button"
      class="bg-black/20 hover:bg-black/40 pointer-events-auto"
      :aria-label="t('options.soundEffects')"
      :aria-pressed="isMobileAudioMuted"
      @click="toggleMobileAudioMute"
    )
      GameIcon.mute-btn__icon(:name="isMobileAudioMuted ? 'sound-off' : 'sound'")
</template>

<style scoped lang="sass">
// Sized deliberately, a step BELOW the action buttons beside it — a rarely
// touched toggle — while still clearing a comfortable thumb.
.mute-btn
  display: inline-flex
  align-items: center
  justify-content: center
  width: clamp(2.25rem, 9.2vw, 2.6rem)
  height: clamp(2.25rem, 9.2vw, 2.6rem)
  min-width: 2.25rem
  min-height: 2.25rem
  padding: 0
  border: 2px solid rgba(255, 255, 255, 0.18)
  color: #fff

  &:active
    transform: translateY(1px) scale(0.94)

  // Nested to outrank `GameIcon`'s own `.game-icon` rule.
  .mute-btn__icon
    width: 52%
    height: 52%
    filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.8))
</style>
