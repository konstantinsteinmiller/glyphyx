import { computed, ref, watch, type Ref } from 'vue'
import { RUNE_TOOLTIP_USES, RUNE_TYPES, type RuneType } from '@/game/rules'
import { RUNE_USES_KEY } from '@/keys'
import { getState, setState } from '@/use/useGlyphyxState'
import { saveDataVersion } from '@/use/useSaveStatus'

/**
 * ─── How often each rune has been placed ────────────────────────────────────
 *
 * A glyph is not self-explanatory, so a rune shows a tooltip while it is
 * selected or carried — until the player has placed it `RUNE_TOOLTIP_USES`
 * times, after which they know what a bow does and the tooltip would only be
 * in the way. Counts live in the save blob (`gx_rune_uses`) so a returning
 * player is not re-taught on every device.
 */

type Uses = Partial<Record<RuneType, number>>

const sanitize = (raw: unknown): Uses => {
  const out: Uses = {}
  if (!raw || typeof raw !== 'object') return out
  for (const t of RUNE_TYPES) {
    const n = Number((raw as Record<string, unknown>)[t])
    if (Number.isFinite(n) && n > 0) out[t] = Math.floor(n)
  }
  return out
}

const uses: Ref<Uses> = ref(sanitize(getState<Uses>(RUNE_USES_KEY, {})))

/** Re-read after a hydrate (the state layer swaps the blob underneath us). */
export const reloadRuneUses = (): void => {
  uses.value = sanitize(getState<Uses>(RUNE_USES_KEY, {}))
}

/** How many times `type` has been placed, ever. */
export const runeUses = (type: RuneType): number => uses.value[type] ?? 0

/** One more placement of `type`. */
export const recordRuneUse = (type: RuneType): void => {
  const next: Uses = { ...uses.value, [type]: runeUses(type) + 1 }
  uses.value = next
  setState(RUNE_USES_KEY, next)
}

/** Should `type` still explain itself when picked up? */
export const tooltipWanted = (type: RuneType): boolean => runeUses(type) < RUNE_TOOLTIP_USES

/** Reactive form of `tooltipWanted`, per type, for templates. */
export const tooltipWantedFor: Record<RuneType, Ref<boolean>> = Object.fromEntries(
  RUNE_TYPES.map((t) => [t, computed(() => (uses.value[t] ?? 0) < RUNE_TOOLTIP_USES)])
) as unknown as Record<RuneType, Ref<boolean>>

// A cloud merge swaps the blob underneath every composable: re-read like the rest.
watch(saveDataVersion, reloadRuneUses)
