import { useState, useEffect } from 'react'

const TARGET_DATE = new Date('2026-08-03T08:00:00+07:00')

function getTimeLeft() {
  const total = TARGET_DATE.getTime() - Date.now()
  const clamped = total > 0 ? total : 0

  const days = Math.floor(clamped / (1000 * 60 * 60 * 24))
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((clamped / (1000 * 60)) % 60)
  const seconds = Math.floor((clamped / 1000) % 60)

  return { days, hours, minutes, seconds }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  const items = [
    { value: time.days, label: 'days' },
    { value: time.hours, label: 'hours' },
    { value: time.minutes, label: 'minutes' },
    { value: time.seconds, label: 'second' }
  ]

  return (
    <div className="countdown-timer">
      <h2 className="countdown-title">MENGHITUNG HARI</h2>
      <div className="countdown-grid">
        {items.map((item) => (
          <div className="countdown-item" key={item.label}>
            <span className="countdown-value">{pad(item.value)}</span>
            <span className="countdown-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
