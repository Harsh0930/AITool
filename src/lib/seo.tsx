import { useEffect } from 'react'

interface SeoHeadProps {
  title: string
  description: string
  schema?: Record<string, unknown> | Array<Record<string, unknown>>
}

function upsertMeta(name: string, content: string) {
  let element = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

export function SeoHead({ title, description, schema }: SeoHeadProps) {
  useEffect(() => {
    document.title = title
    upsertMeta('description', description)

    const existing = document.getElementById('page-schema')
    if (existing) {
      existing.remove()
    }

    if (schema) {
      const script = document.createElement('script')
      script.id = 'page-schema'
      script.type = 'application/ld+json'
      script.text = JSON.stringify(schema)
      document.head.appendChild(script)
    }

    return () => {
      const script = document.getElementById('page-schema')
      if (script) {
        script.remove()
      }
    }
  }, [description, schema, title])

  return null
}
