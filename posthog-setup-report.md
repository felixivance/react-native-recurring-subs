<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurly React Native (Expo) app. Here is a summary of all changes made:

- **`posthog-react-native`** and **`react-native-svg`** (required peer dep) installed via pnpm.
- **`app.config.js`** created (converting `app.json` to JS) to expose `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from the `.env` file via `Constants.expoConfig.extra`.
- **`.env`** updated with the PostHog project token and host values.
- **`src/config/posthog.ts`** created — initialises the PostHog client with batching, lifecycle capture, and graceful no-op when the token is missing.
- **`app/_layout.tsx`** — `PostHogProvider` wraps the entire app (outside `ClerkProvider`), screen tracking via `posthog.screen()` is active on every route change, and autocapture is enabled for touches.
- **`app/(auth)/sign-in.tsx`** — `posthog.identify()` + `posthog.capture('user_signed_in')` on successful sign-in (both password and MFA/client-trust paths); `posthog.capture('user_sign_in_failed')` on error.
- **`app/(auth)/sign-up.tsx`** — `posthog.identify()` + `posthog.capture('user_signed_up')` after email verification completes; `posthog.capture('user_sign_up_failed')` on error.
- **`app/(tabs)/settings.tsx`** — `posthog.capture('user_signed_out')` before sign-out, `posthog.reset()` on success.
- **`app/(tabs)/index.tsx`** — `posthog.capture('subscription_card_expanded')` fires when a user expands a subscription card on the home dashboard.
- **`app/subscriptions/[id].tsx`** — `posthog.capture('subscription_viewed')` fires in a `useEffect` when the subscription detail screen mounts.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully completed sign-in | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | Sign-in attempt failed (Clerk error) | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User completed sign-up and email verification | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | Sign-up attempt failed (Clerk error) | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User triggered sign-out from settings | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expanded a subscription card on home | `app/(tabs)/index.tsx` |
| `subscription_viewed` | User navigated to a subscription detail page | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://us.posthog.com/project/454580/dashboard/1670296)
- [Daily Sign-ins (Unique Users)](https://us.posthog.com/project/454580/insights/IZ7a4RsN)
- [Sign-up → Sign-in Conversion Funnel](https://us.posthog.com/project/454580/insights/HaZTxDad)
- [Auth Failures Over Time](https://us.posthog.com/project/454580/insights/tm1GiZn2)
- [Subscription Engagement](https://us.posthog.com/project/454580/insights/yDDVRJZ5)
- [Sign-outs Over Time](https://us.posthog.com/project/454580/insights/SybmYXNj)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
