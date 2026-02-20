"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Users,
  Banknote,
  Calendar,
  TrendingUp,
  Heart,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatMoney, formatCountdown } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

export default function Dashboard() {
  const { currency, rate } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>("");
  const [selectedPayer, setSelectedPayer] = useState<"TOM" | "EVE">("TOM");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d));

    const weddingDate = new Date("2026-08-09T00:00:00Z");
    const timer = setInterval(() => {
      setCountdown(formatCountdown(weddingDate));
    }, 60000); // Mise à jour toutes les minutes car on ne montre plus les secondes

    setCountdown(formatCountdown(weddingDate)); // Init immédiat

    return () => clearInterval(timer);
  }, []);

  if (!data) return <div className="p-8 text-slate-500">Chargement du tableau de bord...</div>;

  const paidPercentage = (data.paidTotal / data.totalBudget) * 100;
  const payerTotalOwed = selectedPayer === "TOM" ? data.tomOwes : data.eveOwes;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de bord</h2>
          <p className="text-slate-500">Bienvenue dans votre planificateur de mariage. Tout se passe à merveille !</p>
        </div>
        <div className="flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-full border border-pink-100 transition-all hover:shadow-sm">
          <Clock className="w-4 h-4 text-pink-500" />
          <span className="text-sm font-semibold text-pink-700">{countdown} restant</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Estimation"
          value={formatMoney(data.totalEstimation, currency, rate)}
          description="Somme des estimations"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Budget Total"
          value={formatMoney(data.totalBudget, currency, rate)}
          description="Contrats signés + extras"
          icon={Banknote}
          color="purple"
        />
        <StatCard
          title="Total Payé"
          value={formatMoney(data.paidTotal, currency, rate)}
          description={`${Math.round(paidPercentage)}% du budget total`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Invités"
          value={data.guestStats.totalInvited}
          description="Adultes + Enfants"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Présents Confirmés"
          value={data.guestStats.totalConfirmed}
          description={`Sur ${data.guestStats.totalInvited} invités`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Taux de RSVP"
          value={`${Math.round(data.guestStats.rsvpRate)}%`}
          description="Réponses reçues"
          icon={Heart}
          color="pink"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 transition-all hover:shadow-md border-slate-200/60">
          <CardHeader>
            <CardTitle>Répartition du Budget</CardTitle>
            <CardDescription>Comment les paiements sont répartis entre Tom et Eve</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600">Total Payé</span>
                <span className="font-bold">{formatMoney(data.paidTotal, currency, rate)} / {formatMoney(data.totalBudget, currency, rate)}</span>
              </div>
              <Progress value={paidPercentage} className="h-3 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <SideBudget
                  side="Tom"
                  paid={data.paidTom}
                  total={data.tomShare}
                  owes={data.tomOwes}
                  color="blue"
                  currency={currency}
                  rate={rate}
                />
              </div>
              <div className="space-y-4">
                <SideBudget
                  side="Eve"
                  paid={data.paidEve}
                  total={data.eveShare}
                  owes={data.eveOwes}
                  color="pink"
                  currency={currency}
                  rate={rate}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 transition-all hover:shadow-md border-slate-200/60">
          <CardHeader>
            <CardTitle>Distribution des Invités</CardTitle>
            <CardDescription>Confirmations par côté</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <GuestSideStats
              side="Tom"
              invited={data.guestStats.tomInvited}
              confirmed={data.guestStats.tomConfirmed}
              color="blue"
            />
            <div className="border-t border-slate-100" />
            <GuestSideStats
              side="Eve"
              invited={data.guestStats.eveInvited}
              confirmed={data.guestStats.eveConfirmed}
              color="pink"
            />
          </CardContent>
        </Card>
      </div>

      {/* Récapitulatif par payeur */}
      <Card className="transition-all hover:shadow-md border-slate-200/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Récapitulatif par payeur</CardTitle>
            <CardDescription>Détail du reste à payer pour {selectedPayer === "TOM" ? "Tom" : "Eve"}</CardDescription>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedPayer("TOM")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${selectedPayer === "TOM" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              TOM
            </button>
            <button
              onClick={() => setSelectedPayer("EVE")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${selectedPayer === "EVE" ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              EVE
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total restant à payer</span>
            <span className={`text-2xl font-black ${selectedPayer === "TOM" ? "text-blue-600" : "text-pink-600"}`}>
              {formatMoney(payerTotalOwed, currency, rate)}
            </span>
          </div>

          <div className="space-y-2">
            {data.vendorBreakdown
              .map((v: any) => ({
                ...v,
                remaining: selectedPayer === "TOM" ? v.tomOwes : v.eveOwes
              }))
              .sort((a: any, b: any) => b.remaining - a.remaining)
              .map((v: any) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <span className="font-semibold text-slate-800">{v.name}</span>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono font-bold ${v.remaining > 0 ? "text-slate-900" : v.totalAmount > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                      {formatMoney(v.remaining, currency, rate)}
                    </span>
                    {v.totalAmount === 0 ? (
                      <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[10px] font-bold uppercase">En attente</Badge>
                    ) : v.remaining > 0 ? (
                      <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 text-[10px] font-bold uppercase">À payer</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold uppercase">OK / Réglé</Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-emerald-600 bg-emerald-50",
    purple: "text-purple-600 bg-purple-50",
    pink: "text-pink-600 bg-pink-50",
  };

  return (
    <Card className="transition-all hover:shadow-md border-slate-200/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-tight">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function SideBudget({ side, paid, total, owes, color, currency, rate }: any) {
  const isTom = side === "Tom";
  const barColor = isTom ? "bg-blue-500" : "bg-pink-500";
  const textColor = isTom ? "text-blue-700" : "text-pink-700";
  const pct = total > 0 ? (paid / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <h4 className={`font-bold ${textColor}`}>{side}</h4>
        <span className="text-xs text-slate-400">{Math.round(pct)}% payé</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Payé</span>
          <span className="font-semibold text-slate-900">{formatMoney(paid, currency, rate)}</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} transition-all duration-1000`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500 pt-1">
          <span>Reste à payer</span>
          <span className="font-bold text-orange-600">{formatMoney(owes, currency, rate)}</span>
        </div>
      </div>
    </div>
  );
}

function GuestSideStats({ side, invited, confirmed, color }: any) {
  const pct = invited > 0 ? (confirmed / invited) * 100 : 0;
  const barColor = side === "Tom" ? "bg-blue-400" : "bg-pink-400";

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-700">Côté {side}</span>
        <span className="text-sm font-bold text-slate-900">{confirmed} / {invited}</span>
      </div>
      <div className="space-y-1">
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest pt-1">
          <span>{Math.round(pct)}% Confirmé</span>
          <span>{invited - confirmed} En attente</span>
        </div>
      </div>
    </div>
  );
}
