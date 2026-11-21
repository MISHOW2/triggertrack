// The ONLY file that talks to a server. Diary sync remains mocked.
//
// To enable real diary sync, replace the remaining stub functions with API calls.
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
