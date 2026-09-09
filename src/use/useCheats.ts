import { onMounted, onUnmounted, ref } from 'vue'
import useEconomy from '@/use/useEconomy'
import { toggleDebug } from '@/use/useMatch'

// `cheat` stays a top-level localStorage flag — it's an explicit dev toggle
// that gates the whole keyboard-shortcut module, so we don't want it living
// inside the gameplay save blob (where a cloud restore could re-enable
// cheats on a clean device).
const storedCheat = localStorage.getItem('cheat') || 'false'
const isCheat = ref<boolean>(JSON.parse(storedCheat))

// ─── Always-on key-sequence cheat: type "cmarc" to flip debug mode. ──────
//
// Sits OUTSIDE the `useCheats` factory so it works even when the regular
// cheat module is gated off — flipping `isDebug` is itself the entry point
// to dev tooling (perf meter, etc.).
//
// Exported + idempotent so a boot-time caller (App.vue setup) can guarantee
// it installs at app start. A bare `import useCheats` is tree-shaken in
// production when the default export is never called, so the sequence
// listener has to be attached from executed setup code.
let debugUnlockInstalled = false
export const installDebugUnlock = (): void => {
  if (typeof window === 'undefined' || debugUnlockInstalled) return
  debugUnlockInstalled = true
  const target = 'cmarc'
  let buf = ''
  const isTypingTarget = (el: EventTarget | null): boolean => {
    if (!(el instanceof HTMLElement)) return false
    const tag = el.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    return el.isContentEditable
  }
  window.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target)) { buf = ''; return }
    const k = e.key.toLowerCase()
    // Non-character keys (Shift, Tab, arrow keys) don't reset the buffer
    // outright — they just don't extend it — so the cheat survives a stray
    // modifier press. Anything else of length 1 gets appended.
    if (k.length !== 1) return
    buf = (buf + k).slice(-target.length)
    if (buf === target) {
      buf = ''
      toggleDebug()
    }
  })
}
// Best-effort module-level install for dev (vite serve keeps side-effects);
// App.vue also calls installDebugUnlock() in setup so production builds — where
// this bare side-effect may be dropped — still attach the listener.
installDebugUnlock()

const useCheats = () => {
  if (!isCheat.value) {
    return { isCheat }
  }

  const { addCoins } = useEconomy()

  // Dev shortcuts for glyphyx: coins for the skins, and the things a reviewer
  // needs to reach a late node in ten seconds — the whole roster, every skin,
  // an instant win, a node skip.
  //
  //   Ctrl+Alt+Shift+K   +500 coins
  //   Ctrl+Alt+Shift+N   next node
  //   Ctrl+Alt+Shift+R   retry this node
  //   Ctrl+Alt+Shift+U   unlock every rune
  //   Ctrl+Alt+Shift+S   own every skin
  //   Ctrl+Alt+Shift+W   win the current match instantly
  //   Ctrl+Alt+Shift+<n> jump to node n — type the digits, e.g. 1 then 5 for
  //                      node 15 (see the buffer below).
  //
  // The battle is reached through DYNAMIC imports, never static ones.
  // `useCheats` is called from `App.vue`, which is on the eager boot path — a
  // static import would drag the whole game model into the entry chunk and
  // delay first paint for every player, to serve a dev-only feature that
  // 99.99% of them never trigger. Fetching it on the keypress costs a few ms
  // exactly once, for the developer.
  const withBattle = (fn: (battle: typeof import('@/use/useBattle')) => void): void => {
    void import('@/use/useBattle').then(fn).catch((e) => {
      console.warn('[CHEAT] could not load the battle module', e)
    })
  }
  const withCampaign = (fn: (campaign: typeof import('@/use/useCampaign')) => void): void => {
    void import('@/use/useCampaign').then(fn).catch((e) => {
      console.warn('[CHEAT] could not load the campaign module', e)
    })
  }

  /**
   * Hand the live battle to the console as `window.__battle`.
   *
   * Reaching the singleton from devtools with a bare `import('@/use/useBattle')`
   * does NOT work during development: Vite serves an HMR-updated module under a
   * versioned URL, so the import resolves to a second, inert copy and every
   * mutation lands on an object nothing is rendering. The only reliable handle
   * is one the running app publishes itself.
   *
   * Dev-only, and only after the cheat sequence has been typed.
   */
  const publishDebugHandle = (): void => {
    if (typeof window === 'undefined') return
    withBattle((mod) => {
      ;(window as unknown as Record<string, unknown>).__battle = mod.battle
      console.warn('[CHEAT] window.__battle is live (inspect / drive the running match).')
    })
  }
  publishDebugHandle()

  const cheatsMap: Record<string, () => void> = {
    'ctrl+shift+alt+k': () => {
      addCoins(500)
      console.warn('[CHEAT] +500 coins.')
    },
    'ctrl+shift+alt+n': () => withBattle((mod) => {
      mod.battle.nextNode()
      console.warn('[CHEAT] Skipped to the next node.')
    }),
    'ctrl+shift+alt+r': () => withBattle((mod) => {
      mod.battle.retryNode()
      console.warn('[CHEAT] Node restarted.')
    }),
    'ctrl+shift+alt+u': () => withCampaign((campaign) => {
      void import('@/game/rules').then(({ RUNE_TYPES }) => {
        for (const t of RUNE_TYPES) campaign.unlockRune(t)
        console.warn('[CHEAT] Every rune unlocked.')
      })
    }),
    'ctrl+shift+alt+s': () => {
      void Promise.all([import('@/use/useSkins'), import('@/game/rules')]).then(([skins, rules]) => {
        for (const id of rules.SKIN_IDS) skins.grantSkin(id)
        console.warn('[CHEAT] Every skin owned.')
      })
    },
    'ctrl+shift+alt+w': () => withBattle((mod) => {
      mod.__winMatchNow()
      console.warn('[CHEAT] Match won.')
    })
  }

  const heldKeys = new Set<string>()
  const MODIFIER_KEYS = new Set(['control', 'shift', 'alt', 'meta'])

  const normalizeKey = (e: KeyboardEvent): string | null => {
    const codeMatch = e.code.match(/^Digit(\d)$/)
    if (codeMatch) return codeMatch[1]!
    const k = e.key.toLowerCase()
    if (MODIFIER_KEYS.has(k)) return null
    return k
  }

  const buildShortcut = (e: KeyboardEvent): string => {
    const parts: string[] = []
    if (e.ctrlKey || e.metaKey) parts.push('ctrl')
    if (e.shiftKey) parts.push('shift')
    if (e.altKey) parts.push('alt')
    const held = [...heldKeys].sort()
    return [...parts, ...held].join('+')
  }

  // Node jumps read a DIGIT BUFFER rather than a single key so any node is
  // reachable, including three-digit ones out in the later chapters.
  const NODE_COMMIT_MS = 700
  let nodeBuffer = ''
  let nodeTimer: ReturnType<typeof setTimeout> | null = null

  const cancelNodeTimer = (): void => {
    if (nodeTimer === null) return
    clearTimeout(nodeTimer)
    nodeTimer = null
  }

  const commitNodeJump = (): void => {
    cancelNodeTimer()
    const typed = nodeBuffer
    nodeBuffer = ''
    if (typed === '') return

    const target = Number.parseInt(typed, 10)
    if (!Number.isFinite(target) || target < 1) return

    // A jump past the unlocked frontier is what a reviewer wants; unlock the
    // way first so `startNode`'s clamp does not bounce it.
    withCampaign((campaign) => {
      if (target > campaign.bestNode.value + 1) {
        campaign.bestNode.value = target - 1
      }
      withBattle((mod) => {
        mod.battle.startNode(target)
        console.warn(`[CHEAT] Jumped to node ${target}.`)
      })
    })
  }

  /** All three modifiers down — the gesture that arms the digit buffer. */
  const nodeJumpArmed = (e: KeyboardEvent): boolean =>
    (e.ctrlKey || e.metaKey) && e.altKey && e.shiftKey

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = normalizeKey(e)

    // Digits under the full modifier set feed the node buffer and go no
    // further — they must not also be matched as a `cheatsMap` shortcut.
    if (key !== null && nodeJumpArmed(e) && /^[0-9]$/.test(key)) {
      e.preventDefault()
      // Cap the length so a leaned-on key cannot build a number that overflows
      // into nonsense; four digits is well past the end of any real campaign.
      if (nodeBuffer.length < 4) nodeBuffer += key
      cancelNodeTimer()
      nodeTimer = setTimeout(commitNodeJump, NODE_COMMIT_MS)
      return
    }

    if (key) heldKeys.add(key)
    const shortcut = buildShortcut(e)
    if (cheatsMap[shortcut]) {
      e.preventDefault()
      cheatsMap[shortcut]!()
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    const key = normalizeKey(e)
    if (key) heldKeys.delete(key)

    // Letting go of the gesture commits immediately, so the jump feels like the
    // release of a chord rather than a wait. The timer above is the fallback for
    // someone who types the number and keeps holding the keys.
    const k = e.key.toLowerCase()
    if (nodeBuffer !== '' && (k === 'control' || k === 'meta' || k === 'alt' || k === 'shift')) {
      commitNodeJump()
    }
  }

  const handleBlur = () => {
    heldKeys.clear()
    // A half-typed number must not fire when the window comes back.
    cancelNodeTimer()
    nodeBuffer = ''
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: false })
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
  })

  onUnmounted(() => {
    cancelNodeTimer()
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', handleBlur)
  })

  return { isCheat }
}

export default useCheats
