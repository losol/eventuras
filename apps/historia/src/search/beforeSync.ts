import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

export const beforeSyncWithSearch: BeforeSync = async ({ originalDoc, searchDoc, payload }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, topics, title, meta } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    topics: [],
  }

  if (topics && Array.isArray(topics) && topics.length > 0) {
    // get full topics and keep a flattened copy of their most important properties
    try {
      const mappedTopics = topics.map((topic) => {
        const { id, title } = topic

        return {
          relationTo: 'topics',
          id,
          title,
        }
      })

      modifiedDoc.topics = mappedTopics
    } catch (err) {
      console.error(
        `Failed. Topic not found when syncing collection '${collection}' with id: '${id}' to search.`,
      )
    }
  }

  return modifiedDoc
}
