// The ONLY file that talks to a server. Authentication is live; diary sync remains mocked.
//
// To enable real diary sync, replace the remaining stub functions with API calls.
//
//   push(changes)   -> resolves when the server has stored every change (idempotent by id)
//   deleteAccount() -> resolves when the account and all its data are deleted
//   sendFeedback(f) -> resolves when the feedback is received

export const isMockRemote = true
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function authRequest(path, body) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    const error = new Error('Unable to reach the sign-in server.')
    error.userMessage = "We couldn't reach the sign-in server. Please try again."
    throw error
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'Sign-in request failed.')
    error.userMessage = data.error || 'Sign-in request failed. Please try again.'
    throw error
  }
  return data
}

export async function requestCode(email) {
  await authRequest('/auth/login', { email })
}

export async function verifyCode(email, code) {
  const session = await authRequest('/auth/verify', { email, code })
  return { ...session, email, at: new Date().toISOString() }
}

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
