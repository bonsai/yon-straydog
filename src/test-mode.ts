export function isTestMode(): boolean {
  return location.hostname.includes('vercel.app') || location.hash.includes('debug')
}
