import { useState } from 'react'
import { Clapperboard, Play, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import useLocalStorage from '../hooks/useLocalStorage'
import { KEYS } from '../data/storage'
import { VIDEO_LIST } from '../utils/videoList'

export default function VideosScreen() {
  const [followedChannels, setFollowedChannels] = useLocalStorage(KEYS.videoFollows, [])
  const [followingOnly, setFollowingOnly] = useState(false)
  const [playingId, setPlayingId] = useState(null)
  const followed = Array.isArray(followedChannels) ? followedChannels : []
  const visibleVideos = VIDEO_LIST.filter((video) => !followingOnly || followed.includes(video.channelKey))

  const toggleFollow = (channelKey) => {
    setFollowedChannels((current) => {
      const channels = Array.isArray(current) ? current : []
      return channels.includes(channelKey) ? channels.filter((key) => key !== channelKey) : [...channels, channelKey]
    })
  }

  return (
    <>
      <PageHeader title="Videos" subtitle="Curated videos for learning about reflux and LPR" />

      {VIDEO_LIST.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-line bg-card p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sage-soft text-sage">
            <Clapperboard size={22} aria-hidden />
          </div>
          <h2 className="font-bold">No videos have been added yet</h2>
          <p className="mt-2 text-sm text-muted">
            Curated videos will appear here after they have been reviewed. Nothing is loaded from YouTube until you choose to play a
            video.
          </p>
        </section>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {followed.length} {followed.length === 1 ? 'channel' : 'channels'} followed on this device
            </p>
            <button
              type="button"
              onClick={() => setFollowingOnly((current) => !current)}
              aria-pressed={followingOnly}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                followingOnly ? 'border-sage bg-sage text-white' : 'border-line bg-card text-ink'
              }`}
            >
              {followingOnly ? 'Showing followed' : 'Show followed'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {visibleVideos.map((video) => {
              const isFollowing = followed.includes(video.channelKey)
              const isPlaying = playingId === video.id

              return (
                <article key={video.id} className="overflow-hidden rounded-3xl border border-line bg-card">
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{video.channel}</p>
                    <h2 className="mt-1 font-bold">{video.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPlayingId(isPlaying ? null : video.id)}
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-sage px-4 font-semibold text-white"
                      >
                        {isPlaying ? <X size={17} aria-hidden /> : <Play size={17} aria-hidden />}
                        {isPlaying ? 'Stop video' : 'Play'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFollow(video.channelKey)}
                        aria-pressed={isFollowing}
                        className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink"
                      >
                        {isFollowing ? 'Following channel' : 'Follow channel'}
                      </button>
                    </div>
                  </div>

                  {isPlaying && (
                    <div className="aspect-video bg-black">
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          {followingOnly && visibleVideos.length === 0 && (
            <p className="mt-4 rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">
              No videos from followed channels yet. Follow a channel from any video to see it here.
            </p>
          )}
        </>
      )}

      <section className="mt-5 rounded-2xl bg-chip p-4 text-sm text-muted">
        <p>
          Videos are educational and not medical advice. No analytics or tracking scripts are added. Playing a video contacts
          YouTube, which may receive your connection details.
        </p>
        <p className="mt-2">Channel follows are saved only in this browser and are not synced.</p>
      </section>
    </>
  )
}
