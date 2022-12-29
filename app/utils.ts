import { useMemo } from 'react'

import { useMatches } from '@remix-run/react'
import type { Transition } from '@remix-run/react/dist/transition'

import type { User } from '~/models/user.server'


const DEFAULT_REDIRECT = '/'

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  // eslint-disable-next-line no-undef
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== 'string') {
    return defaultRedirect
  }

  if (!to.startsWith('/') || to.startsWith('//')) {
    return defaultRedirect
  }

  return to
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(
    () => matchingRoutes.find(r => r.id === id),
    [matchingRoutes, id]
  )
  return route?.data
}

function isUser(user: any): user is User {
  return user && typeof user === 'object' && typeof user.email === 'string'
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData('root')
  if (!data || !isUser(data.user)) {
    return undefined
  }
  return data.user
}

export function useUser(): User {
  const maybeUser = useOptionalUser()
  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.'
    )
  }
  return maybeUser
}

export function validateEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length > 3 && email.includes('@')
}

export function truncate(str: string, length: number, useWordBoundary: boolean) {
  if (!str || str.length <= length) { return str }
  const subString = str.slice(0, length - 2) // the original check - less 2 so zero based + '...' will respect length
  return (useWordBoundary
    ? subString.slice(0, subString.lastIndexOf(' '))
    : subString) + '...'
};

export function isBusy(transition: Transition) {
  const loading = {
    actionRedirect: true,
    actionReload: true,
  }

  return transition.state === 'submitting'
    ? true
    : transition.state === 'loading'
      ? loading[transition.type as keyof typeof loading]
      : false
}
