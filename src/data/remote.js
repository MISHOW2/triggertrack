// The ONLY file that talks to a server. Right now it is a stand-in (no backend yet),
// so every call succeeds after a short delay and nothing leaves the phone.
//
// To go live: replace the bodies below with calls to your API (Supabase or your own),
// keeping the same function names and return shapes. Screens and the sync engine stay unchanged.
//
//   push(changes)   -> resolves when the server has stored every change (idempotent by id)
//   deleteAccount() -> resolves when the account and all its data are deleted
//   sendFeedback(f) -> resolves when the feedback is received

export const isMockRemote = true

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function push(changes) {
  await wait(500)
  return { applied: changes.map((c) => c.id) }
}

export async function deleteAccount() {
  await wait(600)
}

export async function sendFeedback() {
  await wait(500)
}
