// ─── yandexPlugin no-op stub (non-Yandex builds only) ───────────────────────
//
// Replaces `@/utils/yandexPlugin` on every build except Yandex's own, via
// `resolve.alias` in `vite.config.ts`. The real module hardcodes Yandex's ad
// URLs (`an.yandex.ru/system/context.js`, `yandex.ru/ads/system/context.js`).
//
// WHY THIS EXISTS, when `YandexProvider` was already stubbed for the same
// reason: the provider is not the only door. `main.ts` reaches the plugin
// directly with `await import('@/utils/yandexPlugin')` inside its Yandex arm,
// and a dynamic import in a dead branch still puts the module in the GRAPH —
// Rollup emits the chunk on every build even though nothing will ever fetch
// it. The Poki release audit found `yandexPlugin-*.js` shipping in the Poki
// bundle with both ad URLs in it (2026-09-12).
//
// That matters most on Poki, which forbids external runtime requests outright
// and grades the build on them: every host needs individual approval in P4D →
// Settings → CSP plus a player-facing privacy policy. A foreign ad-network URL
// sitting in the bundle is dead weight at best and a review question at worst.
// Nothing ever CALLED it — `resolveAdProvider` takes the first matching arm
// and the Yandex flag is false — so this removes a string and a chunk, not a
// behaviour.
//
// Matches the real module's FULL export surface, including the types the
// `platforms/yandex` barrel re-exports. No SDK-URL literal anywhere in here.

import { ref } from 'vue'
import type { Ref } from 'vue'

export interface YandexPlayer {
  getUniqueID: () => string
  getName: () => string
  getMode: () => string
  getData: (keys?: string[]) => Promise<Record<string, unknown>>
  setData: (data: Record<string, unknown>, flush?: boolean) => Promise<void>
}

export interface YandexSdk {
  environment: { i18n: { lang: string } }
  features?: Record<string, unknown>
  adv?: Record<string, unknown>
  getPlayer?: (opts?: Record<string, unknown>) => Promise<YandexPlayer>
}

export const isYandexSdkActive: Ref<boolean> = ref(false)
export const isYandexAdsBlocked: Ref<boolean> = ref(false)
export const yandexLocale: Ref<string | null> = ref(null)

/** Resolves immediately: there is no SDK on this build to wait for. */
export const yandexPlugin = (): Promise<void> => Promise.resolve()

export const getYandexPlayer = (): YandexPlayer | null => null
export const getYandexSdk = (): YandexSdk | null => null
export const yandexLoadingReady = (): void => {}
export const yandexGameplayStart = (): void => {}
export const yandexGameplayStop = (): void => {}

/** No ad layer here, so a rewarded request is an honest "no reward". */
export const showRewardedAdYA = (): Promise<boolean> => Promise.resolve(false)
export const showMidgameAdYA = (_onImpression?: () => void): Promise<void> => Promise.resolve()

const useYandex = (): {
  isYandexSdkActive: Ref<boolean>
  isYandexAdsBlocked: Ref<boolean>
  yandexLocale: Ref<string | null>
} => ({ isYandexSdkActive, isYandexAdsBlocked, yandexLocale })

export default useYandex
