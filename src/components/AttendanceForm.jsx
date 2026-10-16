import { useState } from 'react'
import { supabase, GUESTBOOK_TABLE } from '../lib/supabase'

const WA_NUMBER = '6283807000708'

export default function AttendanceForm() {
  const [nama, setNama] = useState('')
  const [kehadiran, setKehadiran] = useState('Hadir')
  const [jumlah, setJumlah] = useState('')
  const [ucapan, setUcapan] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nama.trim() || !ucapan.trim()) return

    const namaTrim = nama.trim()
    const ucapanTrim = ucapan.trim()

    setErrorMsg('')
    setSubmitting(true)
    const { error } = await supabase.from(GUESTBOOK_TABLE).insert([
      {
        nama: namaTrim,
        kehadiran,
        jumlah_tamu: jumlah ? parseInt(jumlah, 10) : null,
        ucapan: ucapanTrim
      }
    ])
    setSubmitting(false)

    if (!error) {
      setNama('')
      setKehadiran('Hadir')
      setJumlah('')
      setUcapan('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      const waMessage =
        `Assalamu'alaikum, saya *${namaTrim}* mengkonfirmasi kehadiran: *${kehadiran}*` +
        (jumlah ? ` (${jumlah} tamu)` : '') +
        `.\n\nUcapan: ${ucapanTrim}`
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`, '_blank')
    } else {
      setErrorMsg('Gagal mengirim. Periksa koneksi Anda.')
    }
  }

  return (
    <div className="attendance-stack">
      <h2 className="attendance-title">Konfirmasi Kehadiran</h2>

      <form className="attendance-form" onSubmit={handleSubmit}>
        <div className="attendance-field">
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>

        <div className="attendance-field">
          <select value={kehadiran} onChange={(e) => setKehadiran(e.target.value)}>
            <option value="Hadir">Hadir</option>
            <option value="Tidak Hadir">Tidak Hadir</option>
            <option value="Mungkin">Mungkin Hadir</option>
          </select>
        </div>

        <div className="attendance-field">
          <input
            type="number"
            placeholder="Jumlah Tamu"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            min="1"
          />
        </div>

        <div className="attendance-field">
          <textarea
            placeholder="Ucapan & Doa"
            value={ucapan}
            onChange={(e) => setUcapan(e.target.value)}
            rows="3"
            required
          />
        </div>

        <button type="submit" className="attendance-submit" disabled={submitting}>
          {submitting ? 'Mengirim...' : 'Kirim'}
        </button>

        {success && <p className="attendance-success">Terima kasih! Ucapan telah terkirim.</p>}
        {errorMsg && <p className="attendance-error">{errorMsg}</p>}
      </form>
    </div>
  )
}
