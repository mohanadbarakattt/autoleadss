-- WhatsApp connection + shared-inbox tables (autoleadss schema).
--
-- Replaces the Supabase tables that were not carried over in the Phase 2 Neon
-- migration (see src/saas/db/whatsapp.ts). Applied by hand for now, like the
-- rest of the autoleadss schema.

CREATE TABLE IF NOT EXISTS autoleadss.whatsapp_connections (
  id              text PRIMARY KEY,
  clerk_user_id   text NOT NULL REFERENCES public.users(clerk_user_id),
  funnel_id       text NOT NULL,
  phone_number_id text NOT NULL,
  waba_id         text,
  display_phone   text,
  -- Meta credentials. access_token is a SECRET: it is never returned to the
  -- browser (see api/whatsapp/connection.ts, which strips it on read).
  access_token    text NOT NULL,
  verify_token    text NOT NULL,
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- One live connection per phone number, so an inbound webhook resolves to
-- exactly one workspace.
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_connections_phone_idx
  ON autoleadss.whatsapp_connections (phone_number_id);

CREATE INDEX IF NOT EXISTS whatsapp_connections_user_idx
  ON autoleadss.whatsapp_connections (clerk_user_id);

CREATE TABLE IF NOT EXISTS autoleadss.whatsapp_messages (
  id              text PRIMARY KEY,
  connection_id   text NOT NULL REFERENCES autoleadss.whatsapp_connections(id) ON DELETE CASCADE,
  clerk_user_id   text NOT NULL,
  -- The customer's phone. Conversation identity is (connection_id, wa_from).
  wa_from         text NOT NULL,
  direction       text NOT NULL CHECK (direction IN ('in','out')),
  body            text NOT NULL,
  -- Meta's message id, used for idempotency: webhooks are re-delivered on any
  -- non-2xx, so without this a retry duplicates the message AND double-bills.
  provider_msg_id text,
  status          text NOT NULL DEFAULT 'received',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_messages_provider_idx
  ON autoleadss.whatsapp_messages (provider_msg_id)
  WHERE provider_msg_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS whatsapp_messages_convo_idx
  ON autoleadss.whatsapp_messages (connection_id, wa_from, created_at DESC);
