import {
  Zap, Target, TrendingUp, MessageCircle, Clock, Shield, Star, Users, Rocket,
  CheckCircle, Phone, Calendar, Sparkles, BarChart, Globe, Heart,
  Building2, ShoppingBag, Stethoscope, UtensilsCrossed, Dumbbell, Briefcase,
  type LucideIcon,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  Zap, Target, TrendingUp, MessageCircle, Clock, Shield, Star, Users, Rocket,
  CheckCircle, Phone, Calendar, Sparkles, BarChart, Globe, Heart,
  Building2, ShoppingBag, Stethoscope, UtensilsCrossed, Dumbbell, Briefcase,
}

export function Icon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const C = MAP[name] ?? Sparkles
  return <C size={size} className={className} />
}
