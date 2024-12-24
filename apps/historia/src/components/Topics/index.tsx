import React from 'react'

interface TopicsProps {
  topics?: { title?: string }[]
}

export const Topics: React.FC<TopicsProps> = ({ topics }) => {
  if (!topics || topics.length === 0) return null

  return (
    <p className="mt-2 text-sm">
      Topics: {topics.map((topic, index) => topic.title).join(', ')}
    </p>
  )
}
