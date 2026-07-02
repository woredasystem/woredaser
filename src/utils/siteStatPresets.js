import {
  Users,
  Building2,
  Briefcase,
  MapPin,
  Heart,
  TrendingUp,
  Award,
  Globe,
  BarChart3,
  Landmark,
} from 'lucide-react'

export const STAT_ICON_OPTIONS = [
  { key: 'users', Icon: Users, label: { am: 'ህዝብ', en: 'People' } },
  { key: 'building', Icon: Building2, label: { am: 'ሕንጻ', en: 'Building' } },
  { key: 'briefcase', Icon: Briefcase, label: { am: 'ስራ', en: 'Services' } },
  { key: 'map', Icon: MapPin, label: { am: 'ካርታ', en: 'Map' } },
  { key: 'heart', Icon: Heart, label: { am: 'ልብ', en: 'Heart' } },
  { key: 'trending', Icon: TrendingUp, label: { am: 'እድገት', en: 'Growth' } },
  { key: 'award', Icon: Award, label: { am: 'ሽልማት', en: 'Award' } },
  { key: 'globe', Icon: Globe, label: { am: 'ዓለም', en: 'Globe' } },
  { key: 'chart', Icon: BarChart3, label: { am: 'ግራፍ', en: 'Chart' } },
  { key: 'landmark', Icon: Landmark, label: { am: 'መስሪያ ቤት', en: 'Institution' } },
]

export const STAT_THEME_OPTIONS = [
  {
    key: 'blue',
    iconText: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
    iconRing: 'ring-blue-100',
    suffix: 'text-blue-500',
    bar: 'from-blue-500 to-cyan-400',
    strip: 'from-blue-50 to-slate-50',
  },
  {
    key: 'indigo',
    iconText: 'text-indigo-600',
    iconBg: 'bg-indigo-500/10',
    iconRing: 'ring-indigo-100',
    suffix: 'text-indigo-500',
    bar: 'from-indigo-500 to-violet-400',
    strip: 'from-indigo-50 to-slate-50',
  },
  {
    key: 'emerald',
    iconText: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    iconRing: 'ring-emerald-100',
    suffix: 'text-emerald-500',
    bar: 'from-emerald-500 to-teal-400',
    strip: 'from-emerald-50 to-slate-50',
  },
  {
    key: 'amber',
    iconText: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
    iconRing: 'ring-amber-100',
    suffix: 'text-amber-500',
    bar: 'from-amber-500 to-orange-400',
    strip: 'from-amber-50 to-slate-50',
  },
  {
    key: 'rose',
    iconText: 'text-rose-600',
    iconBg: 'bg-rose-500/10',
    iconRing: 'ring-rose-100',
    suffix: 'text-rose-500',
    bar: 'from-rose-500 to-pink-400',
    strip: 'from-rose-50 to-slate-50',
  },
  {
    key: 'violet',
    iconText: 'text-violet-600',
    iconBg: 'bg-violet-500/10',
    iconRing: 'ring-violet-100',
    suffix: 'text-violet-500',
    bar: 'from-violet-500 to-purple-400',
    strip: 'from-violet-50 to-slate-50',
  },
]

const iconMap = Object.fromEntries(STAT_ICON_OPTIONS.map((o) => [o.key, o.Icon]))
const themeMap = Object.fromEntries(STAT_THEME_OPTIONS.map((t) => [t.key, t]))

export function getStatIcon(key) {
  return iconMap[key] || BarChart3
}

export function getStatTheme(key) {
  return themeMap[key] || themeMap.blue
}

export const DEFAULT_STAT_ITEMS = [
  {
    label_am: 'ህዝብ',
    label_en: 'Population',
    label_om: 'Ummata',
    value: 128450,
    suffix: '+',
    icon: 'users',
    theme: 'blue',
    sort_order: 0,
  },
  {
    label_am: 'ብሎኮች',
    label_en: 'Blocks',
    label_om: 'Blookii',
    value: 14,
    suffix: '',
    icon: 'building',
    theme: 'indigo',
    sort_order: 1,
  },
  {
    label_am: 'አገልግሎቶች',
    label_en: 'Services',
    label_om: 'Tajaajiloota',
    value: 58,
    suffix: '+',
    icon: 'briefcase',
    theme: 'emerald',
    sort_order: 2,
  },
]

export function mapStatRow(row) {
  return {
    id: row.id,
    label_am: row.label_am,
    label_en: row.label_en || '',
    label_om: row.label_om || '',
    value: Number(row.value) || 0,
    suffix: row.suffix || '',
    icon: row.icon || 'chart',
    theme: row.theme || 'blue',
    sort_order: Number(row.sort_order) || 0,
    is_active: row.is_active !== false,
  }
}
