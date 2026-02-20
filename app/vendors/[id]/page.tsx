"use client";

import { useEffect, useState, use } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Banknote,
    Calendar as CalendarIcon,
    Plus,
    Users,
    FileText,
    Archive,
    Trash2,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateVendorStats } from "@/lib/calculations";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { VendorForm } from "@/components/VendorForm";
import { PaymentForm } from "@/components/PaymentForm";
import { formatMoney } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

const getResponsibilityLabel = (slug: string) => {
    switch (slug) {
        case "TOM_100": return "Tom (100%)";
        case "EVE_100": return "Eve (100%)";
        case "SPLIT_50_50": return "Partagé 50/50";
        case "CUSTOM_SPLIT": return "Partage personnalisé (%)";
        case "PER_INVITEE_BY_FAMILY": return "Au prorata des invités";
        default: return slug;
    }
};

export default function VendorDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const { currency, rate } = useCurrency();
    const params = use(paramsPromise);
    const [vendor, setVendor] = useState<any>(null);
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch(`/api/vendors/${params.id}`).then((res) => res.json()),
            fetch("/api/guests").then((res) => res.json()),
        ]).then(([vData, gData]) => {
            setVendor(vData);
            setGuests(gData);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const handleEditVendor = async (data: any) => {
        setSubmitting(true);
        await fetch(`/api/vendors/${params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        setSubmitting(false);
        setIsEditOpen(false);
        fetchData();
        router.refresh(); // Invalider le cache Next.js pour mettre à jour la liste /vendors
    };

    const handleAddPayment = async (data: any) => {
        setSubmitting(true);
        await fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, vendorId: params.id })
        });
        setSubmitting(false);
        setIsAddPaymentOpen(false);
        fetchData();
    };

    const handleArchive = async () => {
        await fetch(`/api/vendors/${params.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ARCHIVÉ" })
        });
        router.push("/vendors");
    };

    const handleRestore = async () => {
        await fetch(`/api/vendors/${params.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ACTIF" })
        });
        fetchData();
    };

    const handleDelete = async () => {
        await fetch(`/api/vendors/${params.id}`, { method: "DELETE" });
        router.push("/vendors");
    };

    if (loading) return <div className="p-8 text-slate-500">Chargement des détails...</div>;
    if (!vendor || vendor.error) return <div className="p-8">Prestataire non trouvé</div>;

    const stats = calculateVendorStats(vendor, guests);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/vendors">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{vendor.name}</h2>
                            {vendor.status === "ARCHIVÉ" && <Badge variant="outline" className="bg-slate-50 text-slate-400">Archivé</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{vendor.category || "Prestataire"}</Badge>
                            <Badge variant="outline" className="border-slate-200 text-[10px]">{vendor.paymentResponsibility?.replace(/_/g, ' ')}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {vendor.status === "ARCHIVÉ" && (
                        <Button onClick={handleRestore} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <RefreshCw className="w-4 h-4 mr-2" /> Restaurer le prestataire
                        </Button>
                    )}
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="text-slate-600">
                                Modifier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>Modifier le prestataire</DialogTitle>
                                <DialogDescription>
                                    Mettez à jour les informations du contrat ou les modalités de paiement.
                                </DialogDescription>
                            </DialogHeader>
                            <VendorForm
                                initialData={vendor}
                                onSubmit={handleEditVendor}
                                onCancel={() => setIsEditOpen(false)}
                                loading={submitting}
                            />
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={handleArchive} className="text-slate-600">
                        <Archive className="w-4 h-4 mr-2" /> Archiver
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                <div className="md:col-span-8 space-y-6">
                    <Card className="border-slate-200/60 shadow-md">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <div className="flex justify-between items-center">
                                <CardTitle>Vue d'ensemble du budget</CardTitle>
                                <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100 border-0">
                                    Modèle {vendor.pricingModel === "FIXED" ? "FIXE" : "PAR INVITÉ"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-4 gap-4 text-center pb-8 border-b border-slate-100 mb-8">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimation</p>
                                    <p className="text-xl font-black text-slate-400 italic">{vendor.estimation ? formatMoney(vendor.estimation, currency, rate) : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contrat Total</p>
                                    <p className="text-xl font-black text-slate-900">{formatMoney(stats.totalAmount, currency, rate)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payé à ce jour</p>
                                    <p className="text-xl font-black text-emerald-600">{formatMoney(stats.paidTotal, currency, rate)}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{stats.totalAmount > 0 ? Math.round((stats.paidTotal / stats.totalAmount) * 100) : 0}% Effectué</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reste à payer</p>
                                    <p className="text-xl font-black text-orange-500">{formatMoney(stats.remainingTotal, currency, rate)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 pt-4">
                                <SideShare
                                    side="Tom"
                                    total={stats.tomShare}
                                    paid={stats.paidTom + (stats.paidCommon / 2)}
                                    owes={stats.tomOwes}
                                    color="blue"
                                    currency={currency}
                                    rate={rate}
                                />
                                <SideShare
                                    side="Eve"
                                    total={stats.eveShare}
                                    paid={stats.paidEve + (stats.paidCommon / 2)}
                                    owes={stats.eveOwes}
                                    color="pink"
                                    currency={currency}
                                    rate={rate}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-lg">Historique des paiements</CardTitle>
                            <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-slate-900 text-white">
                                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter un paiement
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Enregistrer un nouveau règlement</DialogTitle>
                                        <DialogDescription>
                                            Ajoutez un paiement à ce prestataire pour mettre à jour sa balance.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <PaymentForm
                                        vendors={[vendor]}
                                        fixedVendorId={vendor.id}
                                        onSubmit={handleAddPayment}
                                        onCancel={() => setIsAddPaymentOpen(false)}
                                        loading={submitting}
                                    />
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Payeur</TableHead>
                                        <TableHead>Méthode</TableHead>
                                        <TableHead className="text-right">Montant</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vendor.payments?.length > 0 ? (
                                        vendor.payments.map((p: any) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="text-sm text-slate-500">{p.date ? format(new Date(p.date), "dd MMM yyyy", { locale: fr }) : "-"}</TableCell>
                                                <TableCell><Badge variant="outline">{p.payer === "COMMON" ? "Commun" : p.payer}</Badge></TableCell>
                                                <TableCell className="text-xs font-medium text-slate-500 uppercase">{p.method}</TableCell>
                                                <TableCell className="text-right font-bold text-slate-900">{formatMoney(p.amount, currency, rate)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-slate-400 italic">Aucun paiement enregistré.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-4 space-y-6">
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Paramètres</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <SettingItem
                                label="Base de tarification"
                                value={vendor.guestCountBasis === "INVITED" ? "Par invité" : "Par présent"}
                                icon={Users}
                                description={vendor.includeChildren ? "Inclut les enfants" : "Exclut les enfants"}
                            />
                            <SettingItem
                                label="Partage sur"
                                value={vendor.allocationMode === "REMAINING_ONLY" ? "Le reste à payer" : "Le montant total"}
                                icon={Banknote}
                                description={vendor.allocationMode === "REMAINING_ONLY"
                                    ? "Les paiements existants sont gelés, le reste est scindé."
                                    : "Le montant total est scindé, les paiements réduisent la part."}
                            />
                            <SettingItem
                                label="Règle appliquée"
                                value={
                                    vendor.allocationMode === "REMAINING_ONLY"
                                        ? getResponsibilityLabel(vendor.remainingResponsibility)
                                        : getResponsibilityLabel(vendor.paymentResponsibility)
                                }
                                icon={Users}
                            />
                            <SettingItem
                                label="Note du contrat"
                                value={vendor.notes || "Aucune note"}
                                icon={FileText}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le prestataire ?</DialogTitle>
                        <DialogDescription>
                            {vendor.payments?.length > 0
                                ? `Attention : ce prestataire a ${vendor.payments.length} paiements. En le supprimant, vous supprimerez également son historique financier.`
                                : "Voulez-vous supprimer ce prestataire ? Cette action est irréversible."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Annuler</Button>
                        <Button variant="secondary" onClick={handleArchive}>Archiver à la place</Button>
                        <Button variant="destructive" onClick={handleDelete}>Supprimer définitivement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SideShare({ side, total, paid, owes, color, currency, rate }: any) {
    const isTom = side === "Tom";
    const textColor = isTom ? "text-blue-700" : "text-pink-700";
    const bgColor = isTom ? "bg-blue-50" : "bg-pink-50";

    return (
        <div className={`p-4 rounded-xl ${bgColor} space-y-3`}>
            <div className="flex justify-between items-center">
                <span className={`text-sm font-bold uppercase tracking-widest ${textColor}`}>Part de {side}</span>
                <span className="text-xs font-semibold text-slate-400">{formatMoney(total, currency, rate)} au total</span>
            </div>
            <div className="flex justify-between items-baseline">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Payé</span>
                    <span className="text-xl font-bold text-slate-900">{formatMoney(paid, currency, rate)}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reste</span>
                    <span className={`text-xl font-bold ${owes > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {formatMoney(owes, currency, rate)}
                    </span>
                </div>
            </div>
        </div>
    );
}

function SettingItem({ label, value, icon: Icon, description }: any) {
    return (
        <div className="flex gap-3">
            <div className="p-2 bg-slate-50 rounded-lg h-fit">
                <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
                {description && <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>}
            </div>
        </div>
    );
}
