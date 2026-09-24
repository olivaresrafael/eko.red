import { getAllFilesFrontMatter } from '@/lib/mdx'

// Índice liviano para el buscador client-side (components/SearchButton.js).
// Devuelve solo los campos necesarios para filtrar y listar resultados.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const posts = await getAllFilesFrontMatter('blog')

  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600')
  res.status(200).json(
    posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      tags: post.tags,
      date: post.date,
      dateRaw: post.dateRaw,
      images: post.images,
    }))
  )
}
