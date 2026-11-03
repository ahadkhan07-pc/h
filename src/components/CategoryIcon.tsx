import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Shirt,
  HeartPulse,
  GraduationCap,
  Film,
  Users,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Laptop,
  Coins,
  Gift,
  PlusCircle,
  ShieldCheck,
  Building2,
  Gem,
  Wallet,
  Coffee,
  Phone,
  Plane,
  Zap,
  Tag,
  CreditCard,
  CircleDollarSign,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Shirt,
  HeartPulse,
  GraduationCap,
  Film,
  Users,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Laptop,
  Coins,
  Gift,
  PlusCircle,
  ShieldCheck,
  Building2,
  Gem,
  Wallet,
  Coffee,
  Phone,
  Plane,
  Zap,
  Tag,
  CreditCard,
  CircleDollarSign,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  size = 20,
  color,
}) => {
  const IconComponent = ICON_MAP[name] || Tag;
  return <IconComponent size={size} className={className} style={color ? { color } : undefined} />;
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
