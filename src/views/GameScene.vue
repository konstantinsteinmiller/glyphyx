<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import useBattle, { type BattleEvent, type MatchSummary } from '@/use/useBattle'
import useCampaign from '@/use/useCampaign'
import useEconomy from '@/use/useEconomy'
import useStreak from '@/use/useStreak'
import useSkins from '@/use/useSkins'
import { activeSkin } from '@/use/useSkins'
import { createArenaRenderer } from '@/use/useArenaArt'
import { attachArenaInput } from '@/use/useArenaInput'
import { __winMatchNow, setDragMetrics } from '@/use/useBattle'
import { renderScaleTier } from '@/use/useVfx'
import { playFx } from '@/use/useGameAudio'
import { useMusic } from '@/use/useSound'
import { useScreenshake } from '@/use/useScreenshake'
import { frameStart, frameEnd, phaseStart, phaseEnd } from '@/use/usePerfProbe'
import { isGamePaused, isAdShowing, isVisibilityHidden, isPlatformPaused } from '@/use/useGamePause'
import {
  showPacedInterstitial, adInFlight, canOfferReward, claimReward
} from '@/use/useAdGate'
import { signalGameplayLoaded, triggerHappytime } from '@/use/useCrazyGames'
import { syncGameplayLifecycle, isGameplayLive } from '@/use/useGameplayLifecycle'
import { isAnyModalOpen } from '@/use/useModalState'
import { isMobileLandscape, isShortViewport } from '@/use/useUser'
import { playFirstStartInterstitial } from '@/use/useFirstStartInterstitial'
import { leaderboardEnabled } from '@/use/useLeaderboard'
import { getState, setState } from '@/use/useGlyphyxState'
import { AIMED_KEY, GOAL_SEEN_KEY, RESULTS_SEEN_KEY, TUTORIAL_KEY } from '@/keys'
import { spawnCoinExplosion } from '@/use/useCoinExplosion'
import { tooltipWantedFor } from '@/use/useRuneUses'
import { CHEST_AUTO_CONTINUE_MS, REWARD_MULTIPLIER, type NodeConfig, type RuneType, chestIsGift, LESSON_HANDOVER_MS } from '@/game/rules'

import StreakFlame from '@/components/game/StreakFlame.vue'
import RuneForge from '@/components/game/RuneForge.vue'
import StageBadge from '@/components/game/StageBadge.vue'
import EnemyBadge from '@/components/game/EnemyBadge.vue'
import ControlHint, { type HintId } from '@/components/game/ControlHint.vue'
import RuneTooltip from '@/components/game/RuneTooltip.vue'
import TurnBanner from '@/components/game/TurnBanner.vue'
import ChestOverlay from '@/components/game/ChestOverlay.vue'
import NextUnlockTeaser from '@/components/game/NextUnlockTeaser.vue'
import RewardAdIcon from '@/components/atoms/RewardAdIcon.vue'
import FHudButton from '@/components/atoms/FHudButton.vue'
import FMuteButton from '@/components/atoms/FMuteButton.vue'
import FReward from '@/components/atoms/FReward.vue'
import FButton from '@/components/atoms/FButton.vue'
import CoinBadge from '@/components/organisms/CoinBadge.vue'
import OptionsModal from '@/components/organisms/OptionsModal.vue'
import RankBadge from '@/components/atoms/RankBadge.vue'
import ShopButton from '@/components/organisms/ShopButton.vue'
import GoalIntro from '@/components/game/GoalIntro.vue'
import LeaderboardModal from '@/components/organisms/LeaderboardModal.vue'
import IconCoin from '@/components/icons/IconCoin.vue'

/**
 * ─── The scene ──────────────────────────────────────────────────────────────
 *
 * One canvas, one RAF loop, one thin HUD. The scene owns three things and
 * delegates everything else:
 *
 *   INPUT     — `useArenaInput` turns pointer events into the battle's drag
 *               protocol; the scene only mounts and unmounts it.
 *   THE LOOP  — the pause gate, the fixed order (`battle.tick` then
 *               `renderer.draw`), the measured HUD insets the board fits into.
 *   THE FLOW  — match end → ad → the chest on a screen of its own (when the
 *               node was cleared for the first time) → result screen (title,
 *               rank, coins, the ×3, actions) → next node / play again.
 *
 * The ad ORDERING in `presentResult` is deliberate and is the thing most likely
 * to be broken by a well-meaning simplification: the interstitial is requested
 * and AWAITED before the first overlay — chest or result — is revealed. Showing the overlay first
 * lets the victory jingle play for a beat and then get guillotined by the ad —
 * which is exactly what portal QA rejects builds for.
 */

const { t, locale } = useI18n()
const battle = useBattle()
const { currentNode, nodeConfigFor, bestNode } = useCampaign()
const { addCoins } = useEconomy()
const { startBattleMusic, stopBattleMusic } = useMusic()
const { shakeStyle } = useScreenshake()

// ─── Canvas + render loop ───────────────────────────────────────────────────

const canvasRef = ref<HTMLCanvasElement | null>(null)
const topBarRef = ref<HTMLElement | null>(null)
const bottomBarRef = ref<HTMLElement | null>(null)
let renderer: ReturnType<typeof createArenaRenderer> | null = null
let detachInput: (() => void) | null = null
let rafId = 0
let lastT = 0
let cssW = 0
let cssH = 0
let dpr = 1

/** HUD insets, measured rather than guessed, so the board never sits under the
 *  top bar or the hand under the bottom row on a short phone. */
/**
 * A landscape PHONE: wider than tall and short. The one layout where vertical
 * space is the whole problem, so the bottom bar stops being an inset — its
 * buttons live in the corners, and a board that is bounded by the height sits
 * in the middle of the width, clear of both corners. Measured live rather than
 * from `isMobileLandscape`, which is gated on a UA sniff and would leave a
 * narrow desktop window with the phone's board size.
 */
const isLandscapeCompact = (): boolean =>
  typeof window !== 'undefined' && window.innerWidth > window.innerHeight && window.innerHeight <= 480

const measureInsets = (): { top: number; bottom: number; left: number; right: number } => ({
  top: (topBarRef.value?.getBoundingClientRect().height ?? 0) + (isLandscapeCompact() ? 2 : 6),
  bottom: isLandscapeCompact() ? 0 : (bottomBarRef.value?.getBoundingClientRect().height ?? 0) + 4,
  left: 0,
  right: 0
})

// ─── Overlay state ──────────────────────────────────────────────────────────
//
// Declared up here, ahead of the render loop and the pause watcher that read
// them: the watcher runs IMMEDIATELY inside setup, and a `const` below it is
// still in its temporal dead zone at that moment — the scene threw
// "Cannot access 'showResult' before initialization" on its first mount.
const showResult = ref(false)
/** The chest's own screen, shown BEFORE the result when a node was first cleared. */
const showChest = ref(false)
/** Either post-match screen is up: the clock stops, the HUD locks, no hint shows. */
const overlayUp = computed(() => showChest.value || showResult.value || showGoalIntro.value)
const showOptions = ref(false)
/** The shop (power runes + skins) lives behind its own HUD button; the result screen opens its skins tab. */
const shopRef = ref<InstanceType<typeof ShopButton> | null>(null)
/**
 * The goal, shown once without a word: on the first REAL conquest match a
 * mini board lights eight tiles up to a crown. Persisted so it never replays.
 */
const goalSeen = ref(getState<boolean>(GOAL_SEEN_KEY, false) === true)
const showGoalIntro = ref(false)
const onGoalIntroDone = (): void => {
  goalSeen.value = true
  setState(GOAL_SEEN_KEY, true)
}
const showLeaderboard = ref(false)

/**
 * How much room the strip under the top bar has before the board begins —
 * where the control pill and the rune card live. Measured with the insets,
 * so on a short phone the scene knows when only one of the two can fit.
 */
const stripRoomPx = ref(Infinity)

const applyInsets = (): void => {
  if (!renderer || cssW === 0) return
  renderer.resize(cssW, cssH, dpr, measureInsets())
  const topBottom = topBarRef.value?.getBoundingClientRect().bottom ?? 0
  stripRoomPx.value = renderer.layout().board.y - topBottom
}

const resize = (): void => {
  const canvas = canvasRef.value
  if (!canvas || !renderer) return
  // Clamp DPR by QUALITY TIER, not to a constant: fill cost scales with the
  // square of this number, and it is the single biggest lever on a slow phone.
  // `min` renders BELOW the device's own pixel grid on purpose — a soft 30 fps
  // reads as a game, a crisp 10 fps does not.
  const dprCap = renderScaleTier.value === 'min'
    ? 0.8
    : renderScaleTier.value === 'low'
      ? 1.25
      : renderScaleTier.value === 'medium' ? 1.5 : 2
  dpr = renderScaleTier.value === 'min'
    ? Math.min(window.devicePixelRatio || 1, 1) * dprCap
    : Math.min(window.devicePixelRatio || 1, dprCap)
  cssW = window.innerWidth
  cssH = window.innerHeight
  canvas.width = Math.round(cssW * dpr)
  canvas.height = Math.round(cssH * dpr)
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  applyInsets()
}

const loop = (now: number): void => {
  rafId = requestAnimationFrame(loop)
  frameStart(now)
  const dt = lastT ? Math.min(now - lastT, 120) : 16
  lastT = now

  // The pause gate covers ads, hidden tabs, platform SDK pauses and open
  // modals. The RENDER loop keeps running (so the frame under an ad isn't a
  // frozen artefact) but the match clock does not advance.
  if (!isGamePaused.value && !overlayUp.value) {
    phaseStart('step')
    battle.tick(now, dt)
    phaseEnd('step')
  }

  phaseStart('draw')
  renderer?.draw(battle.view, dt, now)
  phaseEnd('draw')
  frameEnd()
}

// Every reason the planning clock must stop, in one place. `isAnyModalOpen`
// already ORs into `isGamePaused` through the app pause, but naming it keeps
// the intent readable.
watch(
  () => isGamePaused.value || overlayUp.value || isAnyModalOpen.value,
  (paused) => battle.setPaused(paused),
  { immediate: true }
)

// `renderScaleTier` picks the DPR cap above, so committing it has to re-size
// the canvas — otherwise the cheaper setting only lands on the next orientation
// change. It fires at most three times a session by construction.
watch(renderScaleTier, () => resize())

// A new stone means new pebble sprites.
watch(activeSkin, () => renderer?.invalidate())

// ─── The renderer's words ───────────────────────────────────────────────────

const applyLabels = (): void => {
  battle.setLabels({
    level: (n) => t('canvas.level', { n }),
    combo: (n) => t('canvas.combo', { n }),
    clash: t('canvas.clash'),
    victory: t('canvas.victory'),
    defeat: t('canvas.defeat'),
    reveal: t('canvas.reveal'),
    suddenDeath: t('canvas.suddenDeath'),
    turn: (n) => t('canvas.turn', { n }),
    you: t('canvas.you'),
    foe: t('canvas.foe'),
    reroll: t('canvas.reroll'),
    lastTurn: t('canvas.lastTurn')
  })
}
watch(locale, applyLabels)

// ─── HUD data ───────────────────────────────────────────────────────────────

/** The node on screen: the running match's, or the one the save points at. */
const nodeCfg = computed<NodeConfig>(() => battle.node.value ?? nodeConfigFor(currentNode.value))
const chapter = computed(() => nodeCfg.value.chapter)
const nodeIndex = computed(() => nodeCfg.value.index)
const enemies = computed(() => nodeCfg.value.enemies)
const leadFactionName = computed(() => {
  const lead = enemies.value[0]
  return lead ? t(`factions.${lead.faction}`) : ''
})

const coinBadgeRef = ref<InstanceType<typeof CoinBadge> | null>(null)
const coinBadgeEl = computed<HTMLElement | null>(() => coinBadgeRef.value?.rootEl ?? null)

// ─── The stage banner ───────────────────────────────────────────────────────

const BANNER_MS = 1600
const bannerShown = ref(false)
const bannerSudden = ref(false)
let bannerTimer: number | null = null

const flashBanner = (sudden: boolean): void => {
  if (bannerTimer !== null) clearTimeout(bannerTimer)
  bannerSudden.value = sudden
  bannerShown.value = true
  bannerTimer = window.setTimeout(() => { bannerShown.value = false }, BANNER_MS)
}

// ─── Control hints ──────────────────────────────────────────────────────────
//
// One at a time, chosen by what the player most needs to know RIGHT NOW, each
// retiring the moment the thing it names has happened. The ghost hand (drawn
// on the canvas by the battle) is the first voice; this pill is the second.

const placedOnce = ref(getState<boolean>(TUTORIAL_KEY, false) === true)
const aimedOnce = ref(getState<boolean>(AIMED_KEY, false) === true)
/** The player has committed on THIS node — retires the node's own lesson. */
const placedThisNode = ref(false)
const conquestHintDone = ref(false)
const siegeHintDone = ref(false)

/**
 * The re-aim window (`LOCK_WINDOW_MS` after a placement) is explained the
 * first few times it opens and never again — a session counter, because a
 * player who has seen it three times has either used it or does not need it.
 */
const CORRECT_HINT_WINDOWS = 3
const lockWindowsSeen = ref(0)
watch(() => battle.lockOpen.value, (open) => {
  if (open) lockWindowsSeen.value += 1
})

/**
 * The rune in the player's hand, explained — while it is still new to them.
 *
 * `activeRune` is whatever is being dragged or is selected for a tap; the
 * card retires per rune once it has been placed `RUNE_TOOLTIP_USES` times
 * (`useRuneUses`), and never shows under an overlay or a modal.
 */
const tooltipRune = computed<RuneType | null>(() => {
  const type = battle.activeRune.value
  if (!type || overlayUp.value || isAnyModalOpen.value) return null
  return tooltipWantedFor[type].value ? type : null
})

/**
 * The strip above the board holds the pill AND the card only when it is tall
 * enough for both (a pill, a two-row card and their gaps need about this
 * much). On a short phone there is no strip to speak of — the tiles begin
 * right under the top bar — so the card takes the STAGE BADGE's slot in the
 * top bar for as long as it shows: the stage number is the one thing nobody
 * needs mid-drag, and the slot is the one place that covers neither a tile
 * nor the hand nor another control.
 */
const STRIP_BOTH_PX = 80
const tightStrip = computed(() => stripRoomPx.value < STRIP_BOTH_PX)
/** The card is up and the strip cannot hold it: it stands in for the stage badge. */
const tipInStage = computed(() => tooltipRune.value !== null && tightStrip.value)
/**
 * The same rule for the PILL. On the shortest phones (375×667 and under) the
 * strip is 18–30 px — less than a pill — so a pill left there sits on the top
 * row of tiles. Below this much room the pill borrows the stage slot too (the
 * card outranks it when both want the slot). Landscape keeps the pill in its
 * own column beside the board, which never competes with the tiles.
 */
const STRIP_PILL_PX = 40
const pillFits = computed(() => isMobileLandscape.value || stripRoomPx.value >= STRIP_PILL_PX)
const hintInStage = computed(() => !pillFits.value && !tipInStage.value && activeHint.value !== null)

const activeHint = computed<HintId | null>(() => {
  if (overlayUp.value || isAnyModalOpen.value || !battle.matchActive.value) return null
  // The window is the one second after a placement, and the only moment the
  // re-aim hint is true — so it outranks everything else while it is open.
  if (battle.lockOpen.value) return lockWindowsSeen.value <= CORRECT_HINT_WINDOWS ? 'correct' : null
  if (battle.phase.value !== 'planning') return null
  // A pebble was selected by a tap: the next tap places it.
  if (battle.selectedHand.value >= 0) return 'tap'
  if (battle.isAiming.value && !aimedOnce.value) return 'aim'
  if (!placedOnce.value) return 'drag'
  const node = battle.node.value
  if (!node || placedThisNode.value) return null
  // Each rune's lesson names the rune, once per node, until the player has
  // placed on it.
  switch (node.tutorial) {
    case 'archer': return 'archer'
    case 'stack': return 'stack'
    case 'mage': return 'mage'
    case 'defense': return 'defense'
    case 'support': return 'support'
    case 'cleave': return 'cleave'
    case 'roller': return 'roller'
    case 'bombard': return 'bombard'
    default: break
  }
  if (node.mode === 'siege' && !siegeHintDone.value) return 'siege'
  if (node.objective === 'conquest' && !conquestHintDone.value) return 'conquest'
  return null
})

const onPlaced = (): void => {
  placedOnce.value = true
  placedThisNode.value = true
  if (getState<boolean>(AIMED_KEY, false) === true) aimedOnce.value = true
  const node = battle.node.value
  if (node?.mode === 'siege') siegeHintDone.value = true
  if (node?.objective === 'conquest') conquestHintDone.value = true
}

// ─── Result flow ────────────────────────────────────────────────────────────

/** Short-viewport tier — a landscape phone, or any embed under 500px tall. */
const resultCompact = computed(() => isMobileLandscape.value || isShortViewport.value)

const summary = ref<MatchSummary | null>(null)
/** The chest has been tapped: its loot is on screen and a tap continues. */
const chestOpened = ref(false)
const chestOverlayRef = ref<InstanceType<typeof ChestOverlay> | null>(null)
const rewardCoinRef = ref<HTMLElement | null>(null)

const won = computed(() => summary.value?.result.won === true)

/**
 * "#N of M" — the player's standing on the board, when the board knows it.
 *
 * The score is the best node ever cleared, so the line is about the campaign
 * rather than this one match, and it reads the same after a defeat. Hidden,
 * not "#?", whenever there is nothing to say: no board on this build, nothing
 * cleared yet, or no population count.
 */
const RESULT_AD_DELAY_MS = 500

/**
 * Show an interstitial, if one is due. The pacing rule (121 s between ads, a
 * no-fill refunds the gap) lives in `useAdGate.showPacedInterstitial`; this is
 * the match-end placement, delayed a beat so the verdict lands first.
 */
const maybeShowInterstitial = async (): Promise<void> => {
  await showPacedInterstitial({ delayMs: RESULT_AD_DELAY_MS })
}

/**
 * How many result screens the player has seen, ever. Persisted so the one-shot
 * pointers of the first few screens never come back for a returning player.
 */
const resultsSeen = ref(Number(getState(RESULTS_SEEN_KEY, 0)) || 0)

// A tutorial node's RESULT screen (the no-chest replay path) hands over on its
// own after the same wait the chest step gives the loot. The chest step itself
// keeps its own clock (`ChestOverlay`): the loot stays until the player taps or
// `CHEST_AUTO_CONTINUE_MS` has passed, and its `continue` drives `onNext`.
const AUTO_ADVANCE_MS = CHEST_AUTO_CONTINUE_MS
let autoAdvanceTimer: number | null = null
const cancelAutoAdvance = (): void => {
  if (autoAdvanceTimer !== null) clearTimeout(autoAdvanceTimer)
  autoAdvanceTimer = null
}
const scheduleAutoAdvance = (): void => {
  cancelAutoAdvance()
  autoAdvanceTimer = window.setTimeout(() => {
    autoAdvanceTimer = null
    if (overlayUp.value && won.value) onNext()
  }, AUTO_ADVANCE_MS)
}
/**
 * A lesson cleared for coins alone: no chest, no result screen — the coins
 * fly into the wallet and the next lesson begins after one beat. The same
 * timer as the auto-advance, so either cancels the other.
 */
const scheduleHandover = (): void => {
  cancelAutoAdvance()
  autoAdvanceTimer = window.setTimeout(() => {
    autoAdvanceTimer = null
    if (won.value && !overlayUp.value) onNext()
  }, LESSON_HANDOVER_MS)
}
/** The chest's coins when the chest itself was skipped (coins alone are no ceremony). */
const chestCoinsShown = computed(() => {
  const c = summary.value?.chest
  return c && !chestIsGift(c) ? c.coins : 0
})

/**
 * A match ended. The interstitial first, then the FIRST overlay: the chest on
 * its own screen when the node was cleared for the first time, the result
 * screen otherwise. The result follows the chest from `onChestContinue`.
 */
const presentResult = async (s: MatchSummary): Promise<void> => {
  summary.value = s
  chestOpened.value = false
  if (s.result.won) triggerHappytime()

  // Ad FIRST, overlay second. See the header note.
  await maybeShowInterstitial()

  // The ceremony is for a GIFT — a new rune, a new skin. Coins alone were
  // banked the moment the node was cleared; they show on the result screen.
  if (s.chest && chestIsGift(s.chest)) {
    showChest.value = true
    playFx('chestPop')
    return
  }
  // A lesson with nothing but coins moves straight on: the coins fly into the
  // wallet and the next lesson starts after one beat.
  if (s.node.tutorial && s.result.won) {
    const total = s.coins + (s.chest?.coins ?? 0)
    if (total > 0 && canvasRef.value && coinBadgeEl.value) {
      spawnCoinExplosion({ sourceEl: canvasRef.value, targetEl: coinBadgeEl.value, count: Math.min(40, 12 + Math.round(total / 5)) })
      playFx('countUp', 0.5)
    }
    scheduleHandover()
    return
  }
  await openResultOverlay()
}

/** The result screen proper: the title, the rank, the coins, the ×3, the actions. */
const openResultOverlay = async (): Promise<void> => {
  const s = summary.value
  if (!s) return
  rewardClaimed.value = false
  rewardWasOffered.value = canOfferReward.value
  resultsSeen.value += 1
  setState(RESULTS_SEEN_KEY, resultsSeen.value)
  showChest.value = false
  showResult.value = true
  playFx('uiOpen')

  // The match's own coins fly into the wallet as the screen lands.
  await nextTick()
  const shown = s.coins + chestCoinsShown.value
  if (shown > 0) {
    const el = rewardCoinRef.value
    if (el && coinBadgeEl.value) {
      spawnCoinExplosion({
        sourceEl: el,
        targetEl: coinBadgeEl.value,
        count: Math.min(40, 12 + Math.round(shown / 6))
      })
    }
    playFx('countUp', 0.5)
  }
  if (s.node.tutorial) scheduleAutoAdvance()
}

const onChestOpen = (): void => {
  const s = summary.value
  if (!s?.chest || chestOpened.value) return
  chestOpened.value = true
  playFx('chestOpen')
  if (s.chest.unlockRune || s.chest.unlockSkin) window.setTimeout(() => playFx('unlock'), 260)
  const el = chestOverlayRef.value?.chestEl() ?? null
  if (el && coinBadgeEl.value && s.chest.coins > 0) {
    spawnCoinExplosion({
      sourceEl: el,
      targetEl: coinBadgeEl.value,
      count: Math.min(50, 14 + Math.round(s.chest.coins / 4))
    })
  }
  // Nothing is scheduled here on purpose: the loot STAYS until the overlay's
  // own clock or the player's tap says `continue` — a tutorial node then hands
  // over from `onChestContinue` with no result screen between the lessons.
}

/** The tap after the loot: the result screen — or, on a tutorial node, the next stage. */
const onChestContinue = (): void => {
  const s = summary.value
  if (!s || adInFlight.value) return
  if (s.node.tutorial && won.value) {
    onNext()
    return
  }
  void openResultOverlay()
}

// ─── The ×3, which is the game's income ─────────────────────────────────────
//
// Offered on EVERY result screen, win or lose, because a match that ended badly
// is exactly the match whose coins the player most wants back.

/** Already claimed on THIS result screen — the button is one-shot per match. */
const rewardClaimed = ref(false)
/** Was the offer genuinely available while this screen was up? */
const rewardWasOffered = ref(false)

const rewardBonus = computed(() => (summary.value?.coins ?? 0) * (REWARD_MULTIPLIER - 1))

const showRewardButton = computed(() =>
  showResult.value && !rewardClaimed.value && (summary.value?.coins ?? 0) > 0 && canOfferReward.value
)

const onClaimReward = async (): Promise<void> => {
  if (rewardClaimed.value || adInFlight.value) return
  cancelAutoAdvance()
  const granted = await claimReward(() => {
    rewardClaimed.value = true
    addCoins(rewardBonus.value)
  })
  if (!granted) return
  await nextTick()
  const el = rewardCoinRef.value
  if (el && coinBadgeEl.value) {
    spawnCoinExplosion({
      sourceEl: el,
      targetEl: coinBadgeEl.value,
      count: Math.min(60, 20 + Math.round(rewardBonus.value / 5))
    })
  }
  playFx('countUp', 0.85)
}

watch(canOfferReward, (can) => {
  if (can && showResult.value) rewardWasOffered.value = true
})

const onNext = async (): Promise<void> => {
  if (adInFlight.value) return
  cancelAutoAdvance()
  // The second natural break: a new node from the result screen. A no-op
  // inside the 121 s gap, so it only ever fires when the player lingered.
  await showPacedInterstitial()
  showChest.value = false
  showResult.value = false
  playFx('reset')
  battle.nextNode()
}

const onRetry = (): void => {
  if (adInFlight.value) return
  cancelAutoAdvance()
  showChest.value = false
  showResult.value = false
  playFx('reset')
  battle.retryNode()
}

/** Skins from the result screen — not behind an ad, and not a dead end. */
const onSkinsFromResult = (): void => {
  if (adInFlight.value) return
  cancelAutoAdvance()
  shopRef.value?.open('skins')
}

// ─── Battle events ──────────────────────────────────────────────────────────

let offEvents: (() => void) | null = null

const onBattleEvent = (e: BattleEvent): void => {
  switch (e.kind) {
    case 'matchStart':
      placedThisNode.value = false
      flashBanner(false)
      // The first match whose goal is the eight tiles: show what that means.
      if (e.node.objective === 'conquest' && !e.node.tutorial && !goalSeen.value) showGoalIntro.value = true
      break
    case 'placed':
      onPlaced()
      break
    case 'suddenDeath':
      flashBanner(true)
      break
    case 'matchEnd':
      void presentResult(e.summary)
      break
    default:
      break
  }
}

// ─── Portal gameplay lifecycle ──────────────────────────────────────────────
//
// The scene only reports whether play is live; `useGameplayLifecycle` decides
// which events that becomes per platform.
const isLiveGameplay = computed(() => isGameplayLive({
  matchActive: battle.matchActive.value,
  showResult: overlayUp.value,
  anyModalOpen: isAnyModalOpen.value,
  adShowing: isAdShowing.value,
  visibilityHidden: isVisibilityHidden.value,
  platformPaused: isPlatformPaused.value,
  tutorialActive: false
}))
watch(isLiveGameplay, syncGameplayLifecycle, { immediate: true })

// ─── Keyboard ───────────────────────────────────────────────────────────────

const onKeyDown = (e: KeyboardEvent): void => {
  if (e.code === 'Escape') {
    showOptions.value = false
    showLeaderboard.value = false
  }
}

// ─── Boot ───────────────────────────────────────────────────────────────────

let booting = false

/**
 * Enter the game. `startNode()` with no argument resumes the node the save says
 * the player is on — the visible half of the hydration guarantee. If the cloud
 * read had silently failed, the player would land on 1-1, which is exactly the
 * "treated as a fresh user" bug the save layer's boot-sanity guard prevents.
 */
const boot = async (): Promise<void> => {
  if (booting) return
  booting = true
  try {
    // Moderation-mandated first-play interstitial on the networks that require
    // it; a no-op fast path everywhere else. Before the music starts, by design.
    await playFirstStartInterstitial()
    applyLabels()
    battle.startNode()
    await nextTick()
    resize()
    startBattleMusic()
    // Loading is genuinely finished here: the board exists, the canvas is
    // sized, and the first frame is about to draw.
    signalGameplayLoaded()
  } finally {
    booting = false
  }
}

const onOrientationChange = (): void => { setTimeout(resize, 250) }
let insetTimer = 0

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    renderer = createArenaRenderer(canvas)
    // The layout owns the swipe length; the composable's aim / un-freeze
    // distances are derived from it, so the two never disagree about what a
    // swipe is on this screen size.
    detachInput = attachArenaInput(canvas, renderer, battle, { setDragMetrics })
  }
  offEvents = battle.onEvent(onBattleEvent)
  void boot()
  window.addEventListener('resize', resize)
  window.addEventListener('orientationchange', onOrientationChange)
  window.addEventListener('keydown', onKeyDown)
  rafId = requestAnimationFrame(loop)

  // The HUD's height changes with its content (a streak chip appearing, a
  // wrapped faction name). Re-measuring on a 1 s cadence is two
  // `getBoundingClientRect` reads — cheaper than observing a handful of elements.
  insetTimer = window.setInterval(() => {
    if (cssW === 0) return
    applyInsets()
  }, 1000)

  // Dev seam for the browser tests: the battle, the campaign, the wallet and
  // the renderer's live layout (tile / hand rects for synthetic pointer runs).
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    ;(window as unknown as Record<string, unknown>).__glyphyx = {
      battle,
      campaign: useCampaign(),
      economy: useEconomy(),
      streak: useStreak(),
      skins: useSkins(),
      overlays: { showChest, showResult },
      /** End the match as a win right now — the chest/result flow follows as after a real verdict. */
      winNow: __winMatchNow,
      /** The measured room between the top bar and the tiles (px) — where the pill and the rune card live. */
      stripRoom: stripRoomPx,
      layout: () => renderer?.layout() ?? null
    }
  }
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  cancelAutoAdvance()
  if (bannerTimer !== null) clearTimeout(bannerTimer)
  window.removeEventListener('resize', resize)
  window.removeEventListener('orientationchange', onOrientationChange)
  window.removeEventListener('keydown', onKeyDown)
  clearInterval(insetTimer)
  offEvents?.()
  offEvents = null
  detachInput?.()
  detachInput = null
  renderer?.dispose()
  renderer = null
  stopBattleMusic()
})
</script>

<template lang="pug">
  div.scene
    canvas.scene__canvas(
      ref="canvasRef"
      :style="shakeStyle"
      @contextmenu.prevent
    )

    //- ── HUD overlay ───────────────────────────────────────────────────────
    //- Non-interactive by default; individual controls opt back in.
    div.scene__hud
      div.scene__top(ref="topBarRef")
        //- The player's column: the streak flame, the wallet, and under it
        //- the forge whose coins fly INTO the wallet.
        div.scene__player
          StreakFlame
          CoinBadge(ref="coinBadgeRef")
          RuneForge(:target-el="coinBadgeEl")

        div.scene__stage
          //- On a short phone the rune card borrows this slot while it shows
          //- (see `tipInStage`); the badge is back the moment it goes.
          RuneTooltip.scene__tooltip.is-in-stage(v-if="tipInStage" :type="tooltipRune")
          ControlHint.is-in-stage(v-else-if="hintInStage" :hint="activeHint")
          StageBadge(
            v-else
            :chapter="chapter"
            :node="nodeIndex"
            :player-tiles="battle.playerTiles.value"
            :enemy-tiles="battle.enemyTiles.value"
            :locked="overlayUp || adInFlight"
          )

        div.scene__enemy
          EnemyBadge(
            :enemies="enemies"
            :turn="battle.turn.value"
            :turn-limit="battle.turnLimit.value"
            :sudden-death="battle.suddenDeath.value"
          )

      //- Control primer, centred under the top bar — and under it the card
      //- for the rune in hand, while that rune is still new to the player.
      //- Both live in a strip the board never uses (a column beside it on
      //- wide screens), so neither can cover a tile or the hand.
      div.scene__hint
        ControlHint(v-if="pillFits" :hint="activeHint")
        RuneTooltip.scene__tooltip(v-if="!tightStrip" :type="tooltipRune")

      TurnBanner(
        :show="bannerShown"
        :chapter="chapter"
        :node="nodeIndex"
        :mode="nodeCfg.mode"
        :foe="leadFactionName"
        :sudden-death="bannerSudden"
      )

      //- ── Bottom bar: the corners only — the canvas owns the hand between. ──
      div.scene__bottom(ref="bottomBarRef")
        div.scene__meta
          FMuteButton
          //- Gone entirely on a build with no endpoint: a button that opens an
          //- empty board is worse than no button.
          FHudButton(
            v-if="leaderboardEnabled"
            tone="slate"
            icon="leaderboard"
            :aria-label="t('leaderboard.title')"
            @click="showLeaderboard = true"
          )
          FHudButton(
            tone="slate"
            icon="settings"
            :aria-label="t('options.title')"
            @click="showOptions = true"
          )

        div.scene__skins
          ShopButton(ref="shopRef")

    //- ── The goal, once: eight tiles → a crown ─────────────────────────────
    GoalIntro(v-model="showGoalIntro" @done="onGoalIntroDone")

    //- ── The chest: the reward on a screen of its own ───────────────────────
    //- Before the result overlay in the tree, so the result paints OVER it
    //- during the crossfade between the two.
    ChestOverlay(
      ref="chestOverlayRef"
      v-model="showChest"
      :reward="summary ? summary.chest : null"
      :opened="chestOpened"
      @open="onChestOpen"
      @continue="onChestContinue"
    )

    //- ── Result screen ─────────────────────────────────────────────────────
    FReward(v-model="showResult" :show-continue="false")
      template(#ribbon)
        span.scene__ribbon {{ won ? t('result.victory') : t('result.defeat') }}

      div.result(v-if="summary" :class="{ 'is-compact': resultCompact }")
        div.result__headline
          //- A conquest reads differently from the losing side: "eight tiles
          //- conquered" on a defeat says nothing about WHO conquered them.
          span.result__reason {{ t(`result.reasons.${summary.result.reason === 'conquest' && !summary.result.won ? 'conquestLost' : summary.result.reason}`) }}
          span.result__record(v-if="summary.isRecord") {{ t('result.newRecord') }}
          //- Where the campaign stands on the board — a pill, not a sentence,
          //- and absent entirely when there is nothing honest to say.
          RankBadge.result__rank(:score="bestNode")

        .result__coins(ref="rewardCoinRef")
          IconCoin.result__coin-icon
          span.result__coin-value +{{ summary.coins }}
          span.result__streak(v-if="summary.streakMultiplier > 1") {{ t('result.streakBonus', { n: summary.streakMultiplier }) }}
          span.result__chest-coins(v-if="chestCoinsShown > 0") {{ t('result.chestCoins', { n: chestCoinsShown }) }}

        //- The reason to press the button below: the stage that pays the next
        //- rune, and the stone it pays. On the way to the actions, not after
        //- them — and after a LOSS as much as a win, because a loss is exactly
        //- when a player needs a reason to try the stage again.
        NextUnlockTeaser.result__teaser(:compact="resultCompact")

        //- The ×3, above the actions and visually louder than either of them:
        //- it is the primary income of the game, not a footnote.
        FButton.result__reward(
          v-if="showRewardButton"
          :size="resultCompact ? 'sm' : 'md'"
          type="warning"
          :is-disabled="adInFlight"
          @click="onClaimReward"
        )
          RewardAdIcon.result__reward-icon
          span.result__reward-mult {{ t('result.tripleCoins') }}
          IconCoin.result__reward-coin
          span.result__reward-bonus {{ t('result.tripleBonus', { n: rewardBonus }) }}

        div.result__claimed(v-else-if="rewardClaimed")
          IconCoin.result__claimed-icon
          span {{ t('result.tripleClaimed') }}

        //- Two glyphs: the skin shop, and the one that ends the screen —
        //- forward action LAST and 25 % larger.
        div.result__actions
          FButton(
            icon-only
            icon="gem"
            :size="resultCompact ? 'sm' : 'md'"
            type="secondary"
            :is-disabled="adInFlight"
            :aria-label="t('result.skins')"
            @click="onSkinsFromResult"
          )
          FButton(
            icon-only
            :icon="won ? 'skip-forward' : 'replay'"
            :size="resultCompact ? 'sm' : 'md'"
            type="success"
            :emphasis="1.25"
            :is-disabled="adInFlight"
            :aria-label="won ? t('result.nextStage') : t('result.playAgain')"
            @click="won ? onNext() : onRetry()"
          )

    OptionsModal(:is-open="showOptions" @close="showOptions = false")
    LeaderboardModal(v-if="leaderboardEnabled" v-model="showLeaderboard")
</template>

<style scoped lang="sass">
.scene
  position: relative
  width: 100vw
  height: 100vh
  height: 100dvh
  overflow: hidden
  background-color: #0a1020

.scene__canvas
  position: absolute
  inset: 0
  display: block
  // The canvas owns every gesture; the browser must not steal them for
  // scrolling, pull-to-refresh or double-tap zoom.
  touch-action: none

.scene__hud
  position: absolute
  inset: 0
  pointer-events: none
  display: flex
  flex-direction: column

// ─── Top bar ────────────────────────────────────────────────────────────────
//
// Three columns with the stage badge TRULY centred: `1fr auto 1fr` keeps the
// centre column on the screen's axis however wide the two sides are.

.scene__top
  display: grid
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr)
  align-items: flex-start
  gap: clamp(0.3rem, 2vw, 0.75rem)
  padding: calc(clamp(0.3rem, 1.6vw, 0.6rem) + env(safe-area-inset-top, 0px)) calc(clamp(0.35rem, 2vw, 0.7rem) + env(safe-area-inset-right, 0px)) 0 calc(clamp(0.35rem, 2vw, 0.7rem) + env(safe-area-inset-left, 0px))

.scene__player
  display: flex
  flex-direction: column
  align-items: flex-start
  gap: clamp(0.3rem, 1.6vw, 0.55rem)
  min-width: 0
  pointer-events: auto

.scene__stage
  display: flex
  justify-content: center

// The card in the stage badge's slot: bounded by the column the grid gives it
// (the two side columns keep their chips), wrapping its sentence as needed.
// The pill in the stage slot: shrunk to the slot's width, one line if it can.
.scene__stage :deep(.control-hint.is-in-stage)
  max-width: 100%
  min-height: 0
  padding: 0.2rem 0.55rem
  font-size: 0.9em

.scene__tooltip.is-in-stage
  max-width: min(46vw, 15rem)
  margin-top: 0.1rem

.scene__enemy
  display: flex
  justify-content: flex-end
  min-width: 0

.scene__hint
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.2rem, 1.2vw, 0.5rem)
  margin-top: clamp(0.2rem, 1.4vw, 0.6rem)
  padding-inline: 0.5rem

// On a wide screen the free real estate is the column LEFT of the board (the
// hand stands to its right): the rune card goes there, vertically centred,
// where it can never touch a tile. A narrow desktop window keeps it in the
// strip above the board like a phone does.
@media (min-aspect-ratio: 5/4) and (min-width: 56rem) and (min-height: 30.01rem)
  .scene__tooltip
    position: absolute
    left: calc(0.75rem + env(safe-area-inset-left, 0px))
    top: 50%
    translate: 0 -50%
    width: min(26vw, 17rem)
    max-width: min(26vw, 17rem)
    flex-direction: column
    align-items: flex-start
    z-index: 3

// ─── Bottom bar ─────────────────────────────────────────────────────────────
//
// Corners only. The hand of pebbles is drawn on the canvas BETWEEN these two
// groups, so the bar itself is transparent to the pointer and only the button
// groups opt back in.

.scene__bottom
  margin-top: auto
  display: flex
  align-items: flex-end
  justify-content: space-between
  gap: clamp(0.3rem, 2vw, 0.7rem)
  padding: 0 calc(clamp(0.35rem, 2vw, 0.7rem) + env(safe-area-inset-right, 0px)) calc(clamp(0.4rem, 2.4vw, 0.8rem) + env(safe-area-inset-bottom, 0px)) calc(clamp(0.35rem, 2vw, 0.7rem) + env(safe-area-inset-left, 0px))
  pointer-events: none

.scene__meta
  display: flex
  align-items: flex-end
  gap: clamp(0.2rem, 1.2vw, 0.4rem)
  pointer-events: auto

.scene__skins
  display: flex
  align-items: center
  pointer-events: auto

// ─── Result screen ──────────────────────────────────────────────────────────

.scene__ribbon
  display: block

.result
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.3rem, 1.6vh, 0.85rem)
  width: 100%
  max-width: 26rem
  // Room for the 3px depth plate under the bottom button row.
  padding-bottom: 3px

.result__headline
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.15rem

// Everything on this screen is typed in `vmin`: the axis it runs out of is the
// short one, in both orientations.
.result__reason
  color: #cfe6ff
  font-weight: 900
  text-transform: uppercase
  text-align: center
  font-size: clamp(0.72rem, 3.4vmin, 1.05rem)
  text-shadow: 2px 2px 0 #000

.result__record
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.65rem, 3vmin, 0.95rem)
  text-shadow: 2px 2px 0 #000
  animation: spotlight-pulse 1.1s ease-in-out infinite

// The standing on the board. Placement only: the pill itself is RankBadge's,
// and a second set of borders and colours here would fight it — a parent's
// scoped styles still reach a child component's ROOT element.
.result__rank
  margin-top: 0.15rem

.result__coins
  display: flex
  align-items: center
  gap: 0.4rem

.result__coin-icon
  width: clamp(1.2rem, 5vmin, 1.8rem)
  height: clamp(1.2rem, 5vmin, 1.8rem)
  object-fit: contain

.result__coin-value
  color: #ffd93c
  font-weight: 900
  font-size: clamp(1.1rem, 5vmin, 2rem)
  line-height: 1.1
  text-shadow: 3px 3px 0 #000

.result__streak
  padding: 0.1em 0.5em
  border: 2px solid rgba(255, 154, 74, 0.6)
  border-radius: 999px
  background-color: rgba(30, 12, 6, 0.78)
  color: #ffb347
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.55rem, 2.6vmin, 0.8rem)
  text-shadow: 1px 1px 0 #000

.result__chest-coins
  color: #ffd93c
  font-weight: 900
  font-size: clamp(0.62rem, 2.6vw, 0.85rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.85)

// The carrot sits in the column's own gap and shrinks to its content, so it
// never widens the screen or steals height from the buttons under it.
.result__teaser
  max-width: 100%

// ─── The ×3 ──────────────────────────────────────────────────────────────────
.result__reward
  animation: reward-breathe 2.6s ease-in-out infinite

  :deep(.f-button__text)
    display: inline-flex
    align-items: center
    justify-content: center
    gap: 0.45rem

.result__reward-coin
  flex: 0 0 auto
  width: 1.15em
  height: 1.15em
  object-fit: contain

.result__reward-mult,
.result__reward-bonus
  white-space: nowrap

.result__claimed
  display: inline-flex
  align-items: center
  gap: 0.4rem
  color: #8fe9a6
  font-weight: 900
  font-size: clamp(0.72rem, 3.2vmin, 1rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.75)

.result__claimed-icon
  width: clamp(1rem, 4.6vmin, 1.4rem)
  height: clamp(1rem, 4.6vmin, 1.4rem)
  object-fit: contain

@keyframes reward-breathe
  0%, 100%
    scale: 1
  50%
    scale: 1.045

@keyframes spotlight-pulse
  0%, 100%
    opacity: 1
  50%
    opacity: 0.6

.result__actions
  display: flex
  align-items: center
  justify-content: center
  gap: clamp(0.5rem, 3vmin, 1rem)
  width: 100%

// ─── Landscape phone ────────────────────────────────────────────────────────
//
// Vertical space is the scarce resource: the board needs the middle band, so
// the HUD's two bars get tighter rather than the canvas getting shorter.
@media (orientation: landscape) and (max-height: 30rem)
  .scene__top
    padding-top: calc(0.2rem + env(safe-area-inset-top, 0px))
    gap: 0.3rem

  .scene__player
    flex-direction: row
    align-items: flex-start
    gap: 0.35rem

  // The primer leaves the flow: on a landscape phone the free real estate is
  // the column LEFT of the board, not a row above it — a row above is the one
  // thing that shrinks the board. Pinned there, vertically centred, wrapping.
  .scene__hint
    position: absolute
    left: calc(0.5rem + env(safe-area-inset-left, 0px))
    top: 50%
    translate: 0 -50%
    width: min(30vw, 15rem)
    margin-top: 0
    padding-inline: 0
    align-items: flex-start
    justify-content: center
    gap: 0.35rem
    z-index: 3

  // The card stacks under the pill inside that column: a landscape phone has
  // no second column to spare.
  .scene__tooltip
    position: static
    translate: none
    width: auto
    max-width: 100%

  .scene__bottom
    padding-bottom: calc(0.3rem + env(safe-area-inset-bottom, 0px))

// ─── Short viewport: the result screen gives up its ornament ────────────────
@media (max-height: 34rem)
  .result
    gap: clamp(0.25rem, 1.2vh, 0.5rem)

  .result__record
    font-size: clamp(0.55rem, 2.4vmin, 0.72rem)

  .result__reward
    animation: none
</style>
