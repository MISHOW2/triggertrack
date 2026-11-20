export const VIDEO_CATEGORIES = ['All', 'Gut health', 'Stress', 'Evening routine', 'Tea']

export const VIDEO_LIST = []

export function validateVideoList(videos) {
  const issues = []
  const ids = new Set()

  videos.forEach((video, index) => {
    const id = typeof video?.id === 'string' ? video.id.trim() : ''
    if (!id) {
      issues.push(`Video at index ${index} is missing an id`)
    } else if (ids.has(id)) {
      issues.push(`Video list has a duplicate id: ${id}`)
    } else {
      ids.add(id)
    }

    for (const field of ['title', 'channel', 'channelKey', 'category']) {
      if (typeof video?.[field] !== 'string' || !video[field].trim()) {
        issues.push(`Video at index ${index} is missing ${field}`)
      }
    }

    if (video?.thumbnail && (!video.thumbnail.startsWith('/') || video.thumbnail.startsWith('//'))) {
      issues.push(`Video at index ${index} must use a local thumbnail path`)
    }
  })

  return issues
}

for (const issue of validateVideoList(VIDEO_LIST)) {
  console.warn(`[TriggerTrack] ${issue}`)
}
