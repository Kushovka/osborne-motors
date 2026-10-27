export const getTestEventCode = () => {
  if (typeof window === "undefined") return null
  const value = new URLSearchParams(window.location.search).get("test_event_code")?.trim()
  return value && /^[A-Za-z0-9_-]{1,64}$/.test(value) ? value : null
}
