// Per-project settings for `pnpm deploy:poki`.
//
// `team` and `gameId` come straight out of the P4D URL of the game's Versions
// page:
//   https://app.poki.dev/<team>/games/<gameId>/versions

export default {
  team: 'hyperg8',
  gameId: '64cc791d-ca0f-444b-9126-0187a33c4243',
  gameName: 'Glyphyx',

  // The project's OWN build script, so the build flags live in exactly one
  // place: `--mode poki --base=./` belong to `build:poki`, and a copy of them
  // here would quietly stop matching the day that script changes.
  //
  // Its `tar -a -cf ... && move` tail does not matter. Whatever that writes
  // lands at `dist/glyphyx-poki.zip`; the packer below excludes `.zip` from
  // the archive and then overwrites that same path with a real one, so the
  // zip that gets uploaded is always this pipeline's, never tar's.
  build: 'pnpm build:poki',
  dist: 'dist',
  zip: 'dist/glyphyx-poki.zip',

  /** Pack `dist` into `zip` with the pipeline's own zip writer instead of
   *  trusting the build script's `tar -a -cf`, which silently produces a TAR
   *  named `.zip` whenever GNU tar wins the PATH. Leave this on. */
  repack: true,
  /** Extra files to keep out of the upload (backups and nested zips are
   *  already excluded). `public-backup/` lives outside `dist`, but the image
   *  compressor can also drop `<name>-original.webp` siblings INSIDE the art
   *  folders when it is run by hand without `--backup-dir`; the default
   *  exclude already covers those, and this catches the art pipeline's own
   *  scratch files if any ever land in a build. */
  zipExclude: name => /\.(map|psd)$/i.test(name),

  /** What the version is called in P4D. Keep the version number in it — it is
   *  the only thing tying a live build back to a commit. */
  versionName: version => `Glyphyx ${version}`,

  /** Extra hosts the gates and the runtime sweep should accept. Anything here
   *  needs a matching per-URL approval in P4D → Settings → CSP.
   *
   *  EMPTY ON PURPOSE. Poki forbids external runtime requests, so
   *  `.env.poki.local` blanks `VITE_LEADERBOARD_URL` and the board ships as a
   *  build-time snapshot baked into the bundle. If a host ever needs adding
   *  here, check first that it is not a leaderboard URL leaking back in. */
  allowHosts: [],

  qa: {
    playMs: 45000,          // how long the harness actually plays before judging
    adWaitMs: 120000,       // how long to wait for a commercial break
  },

  /** Surfaces this game actually has. They decide whether a checklist step is
   *  "not applicable" or a real question — a game WITH usernames must not have
   *  its profanity-filter step reported as n/a.
   *
   *  `usernames: false` is a statement about what SHIPS: `setPlayerName` exists
   *  in `usePlayerIdentity`, but nothing in the game calls it. A leaderboard
   *  name is either minted anonymously (`Oracle587941`) or handed over by a
   *  portal SDK that moderates its own. There is no field a player can type
   *  into, so there is nothing for a profanity filter to guard. */
  declares: {
    usernames: false,
    chat: false,
  },

  /** Expressions evaluated INSIDE the game's iframe during the QA pass. */
  hooks: {
    /** A snapshot that must survive a reload. Key names plus value lengths,
     *  rather than values: a timestamp or a session id changes on every boot
     *  and would fail a save that is working perfectly.
     *
     *  Glyphyx keeps everything in ONE blob under `glyphyx_state` (every field
     *  `gx_`-prefixed, see `src/keys.ts`), so what this really watches is that
     *  blob growing as the run progresses and coming back the same size. */
    readProgress: `(() => {
      const skip = /^(poki_|inspector-|_ga|debug|fps)/
      const out = {}
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (!k || skip.test(k)) continue
        out[k] = (localStorage.getItem(k) || '').length
      }
      return out
    })()`,

    /** Open the game's rewarded-ad flow. A rewarded break can only be started
     *  by the player, so there is no generic way to do this — point it at
     *  whatever the game exposes, or leave it null and the step is reported
     *  as unproven rather than silently ticked.
     *
     *  NULL HERE, and it cannot be otherwise: the `window.__glyphyx` seams are
     *  `import.meta.env.DEV`-only and do not exist in a `vite build` bundle,
     *  which is the very artifact being QA'd. The rewarded surfaces (the shop's
     *  skin/rank cards, the defeat screen's gold reward button) need a real
     *  player to reach them. Expect this step to come back unproven. */
    triggerRewarded: null,
  },
}
