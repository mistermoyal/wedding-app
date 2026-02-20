"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Search,
    Filter,
    Download,
    Calendar as CalendarIcon,
    Receipt,
    Pencil
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PaymentForm } from "@/components/PaymentForm";
import { formatMoney } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

export default function PaymentsPage() {
    const { currency, rate } = useCurrency();
    const [payments, setPayments] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch("/api/payments").then((res) => res.json()),
            fetch("/api/vendors").then((res) => res.json())
        ]).then(([pData, vData]) => {
            setPayments(Array.isArray(pData) ? pData : []);
            setVendors(Array.isArray(vData) ? vData : []);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredPayments = payments.filter(p =>
        p.vendor?.name?.toLowerCase().includes(search.toLowerCase()) ||
        (p.payer && p.payer.toLowerCase().includes(search.toLowerCase())) ||
        (p.memo && p.memo.toLowerCase().includes(search.toLowerCase()))
    );

    const handleAddPayment = async (data: any) => {
        setSubmitting(true);
        await fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        setSubmitting(false);
        setIsAddOpen(false);
        fetchData();
    };

    const handleEditPayment = async (data: any) => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/payments/${editingPayment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setIsEditOpen(false);
                setEditingPayment(null);
                fetchData();
            } else {
                const err = await res.json();
                alert(`Erreur : ${err.details || "Échec de la sauvegarde"}`);
            }
        } catch (error) {
            alert("Erreur réseau");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Journal des paiements</h2>
                    <p className="text-slate-500">Historique de toutes les transactions et contributions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Exporter CSV
                    </Button>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900 text-white hover:bg-slate-800">
                                <Plus className="w-4 h-4 mr-2" /> Nouveau paiement
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Enregistrer un nouveau paiement</DialogTitle>
                                <DialogDescription>
                                    Sélectionnez un prestataire et renseignez les détails du règlement.
                                </DialogDescription>
                            </DialogHeader>
                            <PaymentForm
                                vendors={vendors}
                                onSubmit={handleAddPayment}
                                onCancel={() => setIsAddOpen(false)}
                                loading={submitting}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    label="Total Payé"
                    value={formatMoney(payments.reduce((acc, p) => acc + p.amount, 0), currency, rate)}
                />
                <StatsCard
                    label="Total Tom"
                    value={formatMoney(payments.filter(p => p.payer === 'TOM').reduce((acc, p) => acc + p.amount, 0), currency, rate)}
                    color="blue"
                />
                <StatsCard
                    label="Total Eve"
                    value={formatMoney(payments.filter(p => p.payer === 'EVE').reduce((acc, p) => acc + p.amount, 0), currency, rate)}
                    color="pink"
                />
            </div>

            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher par prestataire ou payeur..."
                                className="pl-10 bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500 italic">Chargement du journal...</div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead>Prestataire</TableHead>
                                    <TableHead>Payeur</TableHead>
                                    <TableHead>Méthode</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                    <TableHead className="w-[60px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-400 italic">
                                            Aucune transaction trouvée.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="text-slate-500 text-sm">
                                                {payment.date ? format(new Date(payment.date), "dd MMM yyyy", { locale: fr }) : "-"}
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-900 group-hover:text-pink-600 transition-colors">
                                                {payment.vendor?.name}
                                            </TableCell>
                                            <TableCell>
                                                <PayerBadge payer={payment.payer} />
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                                                {payment.method || "Virement"}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-slate-400 text-sm italic">
                                                {payment.memo}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-900 whitespace-nowrap">
                                                {formatMoney(payment.amount, currency, rate)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {payment.hasReceipt && (
                                                        <Receipt className="w-4 h-4 text-slate-300" />
                                                    )}
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="h-7 px-2 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 shadow-sm transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingPayment(payment);
                                                            setIsEditOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                        Modifier
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) setEditingPayment(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le paiement</DialogTitle>
                        <DialogDescription>
                            Modifiez les détails du règlement ci-dessous.
                        </DialogDescription>
                    </DialogHeader>
                    {editingPayment && (
                        <PaymentForm
                            vendors={vendors}
                            initialData={editingPayment}
                            onSubmit={handleEditPayment}
                            onCancel={() => setIsEditOpen(false)}
                            loading={submitting}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatsCard({ label, value, color }: any) {
    const colors: any = {
        blue: "border-l-blue-500 bg-blue-50/30",
        pink: "border-l-pink-500 bg-pink-50/30",
    };
    return (
        <Card className={`border-l-4 ${color ? colors[color] : "border-l-slate-900 bg-slate-50/30"} border-slate-200/60 shadow-sm`}>
            <CardHeader className="py-4">
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</CardDescription>
                <CardTitle className="text-2xl font-bold text-slate-900">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}

function PayerBadge({ payer }: { payer: string }) {
    switch (payer) {
        case "TOM":
            return <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50/30">Tom</Badge>;
        case "EVE":
            return <Badge variant="outline" className="text-pink-600 border-pink-100 bg-pink-50/30">Eve</Badge>;
        default:
            return <Badge variant="outline" className="text-purple-600 border-purple-100 bg-purple-50/30">Commun</Badge>;
    }
}
