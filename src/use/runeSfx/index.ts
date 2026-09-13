import type { FxSound } from '@/game/cues'
import type { Synth } from '@/use/sfxKit'
import { MELEE_SFX } from './melee'
import { ARCHER_SFX } from './archer'
import { MAGE_SFX } from './mage'
import { DEFENSE_SFX } from './defense'
import { SUPPORT_SFX } from './support'
import { CLEAVE_SFX } from './cleave'
import { ROLLER_SFX } from './roller'
import { BOMBARD_SFX } from './bombard'
import { NUKER_SFX } from './nuker'
import { CROWN_SFX } from './crown'

/**
 * Every rune's recipes, merged — the cues each rune owns (see each file's
 * header). A cue named by two runes is a bug the cue test catches.
 */
export const RUNE_SFX_BY_RUNE = {
  melee: MELEE_SFX, archer: ARCHER_SFX, mage: MAGE_SFX, defense: DEFENSE_SFX, support: SUPPORT_SFX,
  cleave: CLEAVE_SFX, roller: ROLLER_SFX, bombard: BOMBARD_SFX, nuker: NUKER_SFX, crown: CROWN_SFX
} as const

export const RUNE_SFX: Partial<Record<FxSound, Synth>> = Object.assign({}, ...Object.values(RUNE_SFX_BY_RUNE))
