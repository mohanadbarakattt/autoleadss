import { Helmet } from 'react-helmet-async'

/** Structured data rendered through Helmet so it is also baked into the pre-rendered HTML. */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data).replace(/</g, '\\u003c')}</script>
    </Helmet>
  )
}
