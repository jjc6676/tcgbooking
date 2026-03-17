import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://77f38677e5469089d3b9a8d12547f91b@o4511059175014400.ingest.us.sentry.io/4511059183796224",
  tracesSampleRate: 0.1,
});
