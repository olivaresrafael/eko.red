import siteMetadata from '@/data/siteMetadata'
import dynamic from 'next/dynamic'

const GiscusComponent = dynamic(
  () => {
    return import('@/components/comments/Giscus')
  },
  { ssr: false }
)

// Solo giscus (Disqus/Utterances eliminados 2026-09-24). Con
// siteMetadata.comment.enabled = false no se renderiza nada.
const Comments = () => {
  const comment = siteMetadata?.comment
  if (!comment || !comment.enabled || !comment.provider) return null
  return <div id="comment">{comment.provider === 'giscus' && <GiscusComponent />}</div>
}

export default Comments
