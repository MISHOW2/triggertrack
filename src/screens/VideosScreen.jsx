import { useMemo, useState } from 'react'
import { Bookmark, BookmarkCheck, Clapperboard, Play, Search, Users, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import useLocalStorage from '../hooks/useLocalStorage'
import { KEYS } from '../data/storage'
import { VIDEO_CATEGORIES, VIDEO_LIST } from '../utils/videoList'

export default function VideosScreen() {
  const [followedChannels, setFollowedChannels] = useLocalStorage(KEYS.videoFollows, [])
  const [savedVideos, setSavedVideos] = useLocalStorage(KEYS.videoSaved, [])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [playingId, setPlayingId] = useState(null)
  const followed = Array.isArray(followedChannels) ? followedChannels : []
  const saved = Array.isArray(savedVideos) ? savedVideos : []

  const visibleVideos = useMemo(() => {
    const search = query.trim().toLocaleLowerCase()
    return VIDEO_LIST.filter((video) => {
      if (selectedCategory !== 'All' && video.category !== selectedCategory) return false
      if (!search) return true
      return [video.title, video.channel, video.description, video.category].some((value) =>
        value?.toLocaleLowerCase().includes(search),
      )
    })
  }, [query, selectedCategory])

  const toggleFollow = (channelKey) => {
    setFollowedChannels((current) => {
      const channels = Array.isArray(current) ? current : []
      return channels.includes(channelKey) ? channels.filter((key) => key !== channelKey) : [...channels, channelKey]
    })
  }

  const toggleSaved = (videoId) => {
    setSavedVideos((current) => {
      const ids = Array.isArray(current) ? current : []
      return ids.includes(videoId) ? ids.filter((id) => id !== videoId) : [...ids, videoId]
    })
  }

  return (
    <>
      <PageHeader title="Videos" subtitle="Hand-picked information for gut health, stress, and evening routines." />

      <label className="mb-5 flex min-h-14 items-center gap-3 rounded-full border border-line bg-card px-4 shadow-sm">
        <Search size={19} className="shrink-0 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search videos"
          aria-label="Search videos"
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
        />
      </label>

      <div className="no-scrollbar -mx-4 mb-5 flex snap-x gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter videos by topic">
        {VIDEO_CATEGORIES.map((category) => {
          const selected = selectedCategory === category
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selected}
              className={`min-h-11 shrink-0 snap-start rounded-full border px-4 text-sm font-semibold transition-colors ${
                selected ? 'border-teal bg-teal text-white' : 'border-line bg-card text-ink'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>

      {visibleVideos.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-line bg-card px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-soft text-teal">
            <Clapperboard size={22} aria-hidden />
          </div>
          <h2 className="font-bold">{VIDEO_LIST.length === 0 ? 'No videos have been added yet' : 'No videos found'}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            {VIDEO_LIST.length === 0
              ? 'Reviewed videos will appear here. The catalog is added by hand, and nothing loads from YouTube until you press play.'
              : 'Try a different search or topic.'}
          </p>
        </section>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleVideos.map((video) => {
            const isFollowing = followed.includes(video.channelKey)
            const isSaved = saved.includes(video.id)
            const isPlaying = playingId === video.id

            return (
              <article key={video.id} className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
                <div className={`relative aspect-video overflow-hidden ${video.thumbnail ? 'bg-chip' : categoryTone(video.category)}`}>
                  {video.thumbnail && (
                    <img
                      src={video.thumbnail}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  {isPlaying ? (
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-ink">
                        {video.category}
                      </span>
                      {video.duration && (
                        <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs font-bold text-white">
                          {video.duration}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPlayingId(video.id)}
                        aria-label={`Play ${video.title}`}
                        className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sage shadow-md"
                      >
                        <Play size={24} fill="currentColor" aria-hidden />
                      </button>
                    </>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="font-bold">{video.title}</h2>
                  <p className="mt-1 text-xs font-semibold text-ink">{video.channel}</p>
                  {video.description && <p className="mt-2 text-sm leading-6 text-muted">{video.description}</p>}
                </div>

                <div className="flex items-center justify-between border-t border-line px-4 py-2">
                  <button
                    type="button"
                    onClick={() => toggleFollow(video.channelKey)}
                    aria-pressed={isFollowing}
                    className="flex min-h-11 items-center gap-2 text-sm font-semibold text-sage"
                  >
                    <Users size={17} aria-hidden />
                    {isFollowing ? 'Following channel' : 'Follow channel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSaved(video.id)}
                    aria-pressed={isSaved}
                    className="flex min-h-11 items-center gap-2 text-sm font-semibold text-sage"
                  >
                    {isSaved ? <BookmarkCheck size={17} aria-hidden /> : <Bookmark size={17} aria-hidden />}
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                  {isPlaying && (
                    <button
                      type="button"
                      onClick={() => setPlayingId(null)}
                      aria-label={`Stop ${video.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-chip"
                    >
                      <X size={17} aria-hidden />
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <section className="mt-5 rounded-2xl bg-chip p-4 text-sm text-muted">
        <p>
          Videos are educational and not medical advice. No analytics or tracking scripts are added. Playing a video contacts
          YouTube, which may receive your connection details.
        </p>
        <p className="mt-2">Channel follows and saved videos are stored only in this browser.</p>
      </section>
    </>
  )
}

function categoryTone(category) {
  if (category === 'Stress') return 'bg-gradient-to-br from-sage to-teal'
  if (category === 'Evening routine') return 'bg-gradient-to-br from-amber to-sage'
  if (category === 'Tea') return 'bg-gradient-to-br from-teal to-sage'
  return 'bg-gradient-to-br from-teal to-sage'
}
