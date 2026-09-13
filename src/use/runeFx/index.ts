import type { RuneType } from '@/game/rules'
import type { RuneFx } from './types'
import { melee } from './melee'
import { archer } from './archer'
import { mage } from './mage'
import { defense } from './defense'
import { support } from './support'
import { cleave } from './cleave'
import { roller } from './roller'
import { bombard } from './bombard'
import { nuker } from './nuker'
import { crown } from './crown'

/**
 * Every rune's effects, by type — a `Record`, so a new rune type without a
 * module is a compile error here. The renderer's only door into them.
 */
export const RUNE_FX: Readonly<Record<RuneType, RuneFx>> = {
  melee, archer, mage, defense, support, cleave, roller, bombard, nuker, crown
}

export type { FxApi, RuneEvent, RuneFx, RunePalette, SoundAt } from './types'
export { interceptable, intercepted, isRuneEvent, ownerOf } from './types'
