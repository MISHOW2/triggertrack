import PageHeader from '../components/PageHeader'

const SECTIONS = [
  ['Data collected', 'TriggerTrack stores your diary entries on this device. It does not create an account, collect a name or email, or upload your health information.'],
  ['Data storage', 'Entries are saved in this app’s local browser or device database. If you delete the app or clear app data, the entries are deleted.'],
  ['Backups', 'Export creates a JSON file on your device. Import restores an exported file. The backup contains health information and you choose where to store or share it.'],
  ['No tracking', 'The app uses no analytics, advertising, account services, or tracking SDKs. It makes no health-data network requests.'],
  ['Offline use', 'Core logging and viewing work locally and do not wait for a network connection.'],
  ['Feedback', 'Feedback is sent only through the email app you choose. Do not include health details in feedback.'],
  ['Not medical advice', 'TriggerTrack records observations and may show patterns. These are clues, not proof, diagnosis, or treatment advice.'],
]

export default function PolicyScreen({ onNavigate }) {
  return (
    <>
      <PageHeader title="Privacy policy" subtitle="Local-only · Version 1.0" onBack={() => onNavigate('settings')} />
      <div className="flex flex-col gap-3">
        {SECTIONS.map(([title, detail]) => (
          <section key={title} className="rounded-3xl border border-line bg-card p-4">
            <h2 className="font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
          </section>
        ))}
      </div>
    </>
  )
}
