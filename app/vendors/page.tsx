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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreVertical, Archive, Trash2, Eye, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/utils";
import { VendorForm } from "@/components/VendorForm";
import { calculateVendorStats } from "@/lib/calculations";
import { useCurrency } from "@/context/CurrencyContext";

export default function VendorsPage() {
    const { currency, rate } = useCurrency();
    const [vendors, setVendors] = useState<any[]>([]);
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"ACTIF" | "ARCHIVÉ" | "TOUS">("ACTIF");
    const [vendorToDelete, setVendorToDelete] = useState<any>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch("/api/vendors", { cache: "no-store" }).then(res => res.json()),
            fetch("/api/guests", { cache: "no-store" }).then(res => res.json())
        ]).then(([vendorsData, guestsData]) => {
            setVendors(Array.isArray(vendorsData) ? vendorsData : []);
            setGuests(Array.isArray(guestsData) ? guestsData : []);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleArchive = async (id: string) => {
        await fetch(`/api/vendors/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ARCHIVÉ" })
        });
        fetchData();
    };

    const handleRestore = async (id: string) => {
        await fetch(`/api/vendors/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ACTIF" })
        });
        fetchData();
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/vendors/${id}`, { method: "DELETE" });
        fetchData();
        setVendorToDelete(null);
    };

    const filteredVendors = vendors
        .filter(v => {
            const matchesSearch = (v.name.toLowerCase().includes(search.toLowerCase()) ||
                (v.category && v.category.toLowerCase().includes(search.toLowerCase())));

            if (filterStatus === "TOUS") return matchesSearch;
            return matchesSearch && v.status === filterStatus;
        })
        .sort((a, b) => {
            const statsA = calculateVendorStats(a, guests);
            const statsB = calculateVendorStats(b, guests);
            return statsB.totalAmount - statsA.totalAmount;
        });

    const handleAddVendor = async (data: any) => {
        setSubmitting(true);
        await fetch("/api/vendors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        setSubmitting(false);
        setIsAddOpen(false);
        fetchData();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Prestataires</h2>
                    <p className="text-slate-500">Gerez vos professionnels et contrats de mariage.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 text-white hover:bg-slate-800">
                            <Plus className="w-4 h-4 mr-2" /> Ajouter un prestataire
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Ajouter un nouveau prestataire</DialogTitle>
                            <DialogDescription>
                                Remplissez les informations du contrat pour commencer le suivi budgétaire.
                            </DialogDescription>
                        </DialogHeader>
                        <VendorForm
                            onSubmit={handleAddVendor}
                            onCancel={() => setIsAddOpen(false)}
                            loading={submitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-10 bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg h-fit">
                            <button
                                type="button"
                                onClick={() => setFilterStatus("ACTIF")}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filterStatus === "ACTIF" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Actifs
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterStatus("ARCHIVÉ")}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filterStatus === "ARCHIVÉ" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Archivés
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterStatus("TOUS")}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filterStatus === "TOUS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Tous
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Chargement des prestataires...</div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[250px]">Prestataire</TableHead>
                                    <TableHead className="text-right">Estimation</TableHead>
                                    <TableHead className="text-right">Contrat total</TableHead>
                                    <TableHead className="text-right">Payé</TableHead>
                                    <TableHead className="text-right">Reste</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVendors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400 italic">
                                            Aucun prestataire actif trouvé.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredVendors.map((vendor) => (
                                        <VendorRow
                                            key={vendor.id}
                                            vendor={vendor}
                                            guests={guests}
                                            currency={currency}
                                            rate={rate}
                                            onArchive={() => handleArchive(vendor.id)}
                                            onRestore={() => handleRestore(vendor.id)}
                                            onDelete={() => setVendorToDelete(vendor)}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Modal de suppression */}
            <Dialog open={!!vendorToDelete} onOpenChange={() => setVendorToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le prestataire ?</DialogTitle>
                        <DialogDescription>
                            {vendorToDelete?.payments?.length > 0
                                ? `Ce prestataire a ${vendorToDelete.payments.length} paiements enregistrés. Voulez-vous également supprimer tout l'historique des paiements ou simplement archiver ce prestataire ?`
                                : `Souhaitez-vous supprimer "${vendorToDelete?.name}" ? Cette action est irréversible.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setVendorToDelete(null)}>Annuler</Button>
                        <Button variant="secondary" onClick={() => { handleArchive(vendorToDelete.id); setVendorToDelete(null); }}>Archiver au lieu de supprimer</Button>
                        <Button variant="destructive" onClick={() => handleDelete(vendorToDelete.id)}>Supprimer définitivement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

function VendorRow({ vendor, guests, onArchive, onRestore, onDelete, currency, rate }: any) {
    const stats = calculateVendorStats(vendor, guests);
    const paid = stats.paidTotal;
    const remaining = stats.remainingTotal;
    const isArchived = vendor.status === "ARCHIVÉ";

    // Nouveau statut selon les règles métier
    const getStatusBadge = () => {
        if (stats.totalAmount === 0 && (vendor.payments?.length === 0 || paid === 0)) {
            return <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-medium">En attente</Badge>;
        }

        if (stats.totalAmount > 0) {
            if (remaining <= 0) {
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">Payé</Badge>;
            }
            if (paid === 0) {
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-bold">Non payé</Badge>;
            }
            if (paid > 0) {
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-bold">Partiel</Badge>;
            }
        }

        return <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200">En attente</Badge>;
    };

    return (
        <TableRow className={`group hover:bg-slate-50/50 transition-colors ${isArchived ? 'opacity-60 bg-slate-50/30' : ''}`}>
            <TableCell className={`font-semibold text-slate-900 border-l-4 border-l-transparent group-hover:border-l-pink-500 flex items-center gap-2`}>
                {vendor.name}
                {isArchived && <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase tracking-tighter">Archivé</Badge>}
            </TableCell>
            <TableCell className={`text-right font-medium text-slate-400 ${isArchived ? "grayscale" : ""}`}>
                {vendor.estimation ? formatMoney(vendor.estimation, currency, rate) : "—"}
            </TableCell>
            <TableCell className={`text-right font-medium ${isArchived ? "grayscale" : ""}`}>
                {formatMoney(stats.totalAmount, currency, rate)}
            </TableCell>
            <TableCell className={`text-right font-medium text-slate-600 ${isArchived ? "grayscale" : ""}`}>
                {formatMoney(paid, currency, rate)}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex flex-col items-end gap-1">
                    {getStatusBadge()}
                    {remaining > 0 && stats.totalAmount > 0 && (
                        <span className="text-[10px] font-bold text-orange-600">
                            Reste: {formatMoney(remaining, currency, rate)}
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={`/vendors/${vendor.id}`}>
                            <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" /> Voir les détails
                            </DropdownMenuItem>
                        </Link>
                        {isArchived ? (
                            <DropdownMenuItem onClick={onRestore}>
                                <RefreshCw className="w-4 h-4 mr-2" /> Restaurer
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={onArchive}>
                                <Archive className="w-4 h-4 mr-2" /> Archiver
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}
