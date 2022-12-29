
import type * as React from 'react'

import type { LinksFunction, LoaderArgs, MetaFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from '@remix-run/react'

import * as ToastPrimitive from '@radix-ui/react-toast'
import cx from 'classnames'

import { getUser } from './session.server'
import { getThemeSession } from './theme.server'
import ErrorLayout from './ui/layouts/error-layout'

import { NonFlashOfWrongThemeEls, ThemeProvider, useTheme } from '~/ui/theme/theme-provider'
import type { Theme } from '~/ui/theme/theme-provider'

import appStyles from '~/styles/shared/css/app.css'
import tailwindStyles from '~/styles/shared/css/tailwind.css'

import type { User } from '~/models/user.server'

export type LoaderData = {
  theme: Theme | null
  user: User | null
  ENV: object | null
}

interface DocumentProps {
  children: React.ReactNode
  title?: string
}

/**
 * links
 * @returns 
 */
export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwindStyles },
    { rel: 'stylesheet', href: appStyles },
  ]
}

/**
 * meta
 * @returns 
 */
export const meta: MetaFunction = () => ({
  title: 'Infonomic Remix Workbench App',
})

/**
 * loader
 * @param param0 
 * @returns 
 */
export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const themeSession = await getThemeSession(request)
  const user = await getUser(request)

  const data: LoaderData = {
    theme: themeSession.getTheme(),
    user: user,
    ENV: {
      RECAPTCHA_ENABLED: process.env.RECAPTCHA_ENABLED,
      RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
    },
  }
  return json(data)
}

const Document = ({ children, title }: DocumentProps) => {
  const t = useTheme()
  const data = useLoaderData<LoaderData>()

  return (
    <html lang="en" className={cx(t.theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="description" content="A Remix demo app with Radix UI, headless UI and Tailwind CSS." />
        <meta name="msapplication-TileColor" content="#f59e0b" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=10" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png?v=10" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=10" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=10" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=10" />
        <link rel="icon" href="/favicon.ico?v=10" />
        <link rel="manifest" href="/manifest.webmanifest?v=10" crossOrigin="use-credentials" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg?v=10" color="#501c76" />
        <link rel="icon" href="/favicon.ico?v=10" />

        <NonFlashOfWrongThemeEls ssrTheme={Boolean(data.theme)} />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body className="bg-white selection:bg-amber-400 dark:bg-gray-900 dark:selection:text-black">
        {children}
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

const ErrorDocument = ({ children, title }: DocumentProps) => {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="msapplication-TileColor" content="#f59e0b" />
        <meta name="description" content="A Remix demo app with Radix UI, headless UI and Tailwind CSS." />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=10" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png?v=10" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=10" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=10" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=10" />
        <link rel="icon" href="/favicon.ico?v=10" />
        <link rel="manifest" href="/manifest.webmanifest?v=10" crossOrigin="use-credentials" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg?v=10" color="#501c76" />
        <link rel="icon" href="/favicon.ico?v=10" />

        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body className="bg-white dark:bg-gray-900">
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  const data = useLoaderData<LoaderData>()
  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <Document>
        <ToastPrimitive.Provider>
          <Outlet />
          <ToastPrimitive.Viewport />
        </ToastPrimitive.Provider>
      </Document>
    </ThemeProvider >
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  // TODO: Configure logger
  // eslint-disable-next-line no-console
  console.error(error)
  return (
    <ThemeProvider specifiedTheme={null}>
      <ErrorDocument title="Error! - Infonomic Remix Workbench App">
        <ErrorLayout>
          <div>
            <h1>There was an error</h1>
            <p>{error.message}</p>
            <p>Oops. Something went wrong. We&apos;re looking into it.</p>
          </div>
        </ErrorLayout>
      </ErrorDocument>
    </ThemeProvider>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  let message
  switch (caught.status) {
    case 401:
      message = <p>Oops! Looks like you tried to visit a page that you do not have access to.</p>
      break
    case 404:
      message = <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      break

    default:
      throw new Error(caught.data || caught.statusText)
  }

  return (
    <ThemeProvider specifiedTheme={null}>
      <ErrorDocument title={`${caught.status} ${caught.statusText}`}>
        <ErrorLayout>
          <h1>
            {caught.status}: {caught.statusText}
          </h1>
          {message}
        </ErrorLayout>
      </ErrorDocument>
    </ThemeProvider>
  )
}
