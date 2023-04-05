export function formatDate(date = new Date()) {
	const y = date.getFullYear()
	const m = date.getMonth() + 1 + ''
	const d = date.getDate() + ''
	const h = date.getHours() + ''
	const mi = date.getMinutes() + ''
	const s = date.getSeconds() + ''
	return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')} ${h.padStart(2, '0')}:${mi.padStart(2, '0')}:${s.padStart(2, '0')}`
}