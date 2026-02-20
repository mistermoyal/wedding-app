import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { intervalToDuration } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number, currency: "ILS" | "EUR" = "ILS", rate: number = 0.25) {
  const convertedAmount = currency === "EUR" ? amount * rate : amount;
  const symbol = currency === "EUR" ? "€" : "₪";

  return `${convertedAmount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${symbol}`;
}

export function formatCountdown(targetDate: Date) {
  const now = new Date();
  if (targetDate < now) return "Passé";

  const duration = intervalToDuration({ start: now, end: targetDate });

  const months = duration.months || 0;
  const totalDays = duration.days || 0;
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  const parts = [];
  if (duration.years) parts.push(`${duration.years} an${duration.years > 1 ? 's' : ''}`);
  if (months) parts.push(`${months} mois`);
  if (weeks) parts.push(`${weeks} semaine${weeks > 1 ? 's' : ''}`);
  if (days) parts.push(`${days} jour${days > 1 ? 's' : ''}`);

  // Si c'est pour demain ou aujourd'hui
  if (parts.length === 0) {
    if (duration.hours) parts.push(`${duration.hours}h`);
    if (duration.minutes) parts.push(`${duration.minutes}m`);
    if (parts.length === 0) return "Aujourd'hui !";
  }

  return parts.join(', ');
}
