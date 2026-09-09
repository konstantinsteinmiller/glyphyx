import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// One route. The game boots straight into the arena — there is no menu and
// nothing else a hash could point at. Anything unknown falls back to it rather
// than rendering an empty page.
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'main', component: () => import('@/views/GameScene.vue') }
]

// The art pipeline's two benches, DEV ONLY. `import.meta.env.DEV` is a build
// constant, so in a portal build this whole block — and the two views behind
// the dynamic imports — is dead code Rollup drops: no route, no chunk, no way
// for a hash to reach them.
//
//   /#/art-sheets  bakes every drawable onto the reference lattice and exports
//                  the sheets, prompts and index into art-sheets/
//   /#/playground  every drawable in motion, painted-vs-drawn on one button
if (import.meta.env.DEV) {
  routes.push(
    { path: '/art-sheets', name: 'art-sheets', component: () => import('@/views/ArtSheets.vue') },
    { path: '/playground', name: 'playground', component: () => import('@/views/Playground.vue') }
  )
}

routes.push({ path: '/:pathMatch(.*)*', redirect: '/' })

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
