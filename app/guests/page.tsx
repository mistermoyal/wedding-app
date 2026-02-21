"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Tabs,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
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
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    UserPlus,
    Pencil,
    Users,
    TrendingUp,
    Hourglass,
    User2,
    Baby,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GuestForm } from "@/components/GuestForm";
import { cn } from "@/lib/utils";

const formatDisplayName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length <= 1) return fullName.toUpperCase();

    const lastName = parts[0].toUpperCase();
    const firstNames = parts.slice(1).join(" ");

    const formattedFirst = firstNames
        .split(" ")
        .map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
        .join(" ");

    return `${formattedFirst} ${lastName}`;
};

export default function GuestsPage() {
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    const fetchGuests = () => {
        setLoading(true);
        fetch("/api/guests")
            .then((res) => res.json())
            .then((data) => {
                const guestsData = Array.isArray(data) ? data : [];
                const sorted = [...guestsData].sort((a: any, b: any) =>
                    a.name.split(" ")[0].localeCompare(b.name.split(" ")[0], 'fr', { sensitivity: 'base' })
                );
                setGuests(sorted);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchGuests();
    }, []);

    const filteredGuests = useMemo(() => {
        return guests.filter(g =>
            g.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [guests, search]);

    const guestsBySide = useMemo(() => {
        return {
            all: filteredGuests,
            tom: filteredGuests.filter(g => g.side === "TOM"),
            eve: filteredGuests.filter(g => g.side === "EVE"),
        };
    }, [filteredGuests]);

    const currentGuests = guestsBySide[activeTab as keyof typeof guestsBySide] || [];

    const stats = useMemo(() => {
        return {
            total: currentGuests.reduce((acc, g) => acc + g.numGuests + g.numChildren3to13 + (g.numChildren0to3 || 0), 0),
            confirmed: currentGuests.reduce((acc, g) => acc + g.numAdultsPresent + g.numChildrenPresent + (g.numChildren0to3Present || 0), 0),
            pending: currentGuests
                .filter(g => g.rsvp === "PENDING")
                .reduce((acc, g) => acc + g.numGuests + g.numChildren3to13 + (g.numChildren0to3 || 0), 0),
        };
    }, [currentGuests]);

    const childStats = useMemo(() => {
        const bySide = (side: "TOM" | "EVE") => currentGuests.filter((g) => g.side === side);
        return {
            total0to3: currentGuests.reduce((acc, g) => acc + (g.numChildren0to3 || 0), 0),
            total3to13: currentGuests.reduce((acc, g) => acc + g.numChildren3to13, 0),
            tom0to3: bySide("TOM").reduce((acc, g) => acc + (g.numChildren0to3 || 0), 0),
            tom3to13: bySide("TOM").reduce((acc, g) => acc + g.numChildren3to13, 0),
            eve0to3: bySide("EVE").reduce((acc, g) => acc + (g.numChildren0to3 || 0), 0),
            eve3to13: bySide("EVE").reduce((acc, g) => acc + g.numChildren3to13, 0),
        };
    }, [currentGuests]);

    const toggleSelect = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkRSVP = async (status: string) => {
        if (selectedIds.length === 0) return;
        await fetch("/api/guests", {
            method: "PUT",
            body: JSON.stringify({ ids: selectedIds, updates: { rsvp: status } }),
        });
        fetchGuests();
        setSelectedIds([]);
    };

    const handleUpsertGuest = async (data: any) => {
        setSubmitting(true);
        const method = editingGuest ? "PUT" : "POST";
        const body = editingGuest ? { ...data, id: editingGuest.id } : data;

        await fetch("/api/guests", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setSubmitting(false);
        setIsAddOpen(false);
        setEditingGuest(null);
        fetchGuests();
    };

    return (
        <div className="mx-auto space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Liste des invités</h2>
                    <p className="text-slate-500">Gérez vos listes et suivez les confirmations en temps réel.</p>
                </div>

                <Dialog open={isAddOpen || !!editingGuest} onOpenChange={(open) => {
                    if (!open) {
                        setIsAddOpen(false);
                        setEditingGuest(null);
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl" onClick={() => setIsAddOpen(true)}>
                            <UserPlus className="w-4 h-4 mr-2" /> Ajouter un invité
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingGuest ? "Modifier l'invité" : "Ajouter un invité"}</DialogTitle>
                            <DialogDescription>
                                {editingGuest ? "Ajustez les détails de la famille ou de l'invité." : "Entrez les détails de l'invité pour l'ajouter à votre liste."}
                            </DialogDescription>
                        </DialogHeader>
                        <GuestForm
                            initialData={editingGuest}
                            onSubmit={handleUpsertGuest}
                            onCancel={() => {
                                setIsAddOpen(false);
                                setEditingGuest(null);
                            }}
                            loading={submitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters & Search Box */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col items-center gap-6">
                <div className="relative w-full max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher un invité..."
                        className="pl-11 h-12 bg-slate-50/50 border-slate-200 rounded-xl transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col items-center gap-6 w-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
                        <TabsList className="bg-slate-100 p-1 rounded-full h-12 w-full grid grid-cols-3">
                            {[
                                { id: "all", label: "Tous", count: guests.reduce((acc, g) => acc + g.numGuests + g.numChildren3to13 + (g.numChildren0to3 || 0), 0) },
                                { id: "tom", label: "Tom", count: guests.filter(g => g.side === 'TOM').reduce((acc, g) => acc + g.numGuests + g.numChildren3to13 + (g.numChildren0to3 || 0), 0) },
                                { id: "eve", label: "Eve", count: guests.filter(g => g.side === 'EVE').reduce((acc, g) => acc + g.numGuests + g.numChildren3to13 + (g.numChildren0to3 || 0), 0) }
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="rounded-full px-4 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all h-full flex items-center justify-center whitespace-nowrap"
                                >
                                    <span>{tab.label}</span>
                                    <span className="ml-1.5 text-xs opacity-40 font-medium">({tab.count})</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    {/* Quick Stats Bar */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invités</span>
                                <span className="text-lg font-bold text-slate-900 leading-none">{stats.total}</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmés</span>
                                <span className="text-lg font-bold text-emerald-600 leading-none">{stats.confirmed}</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                <Hourglass className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">En attente</span>
                                <span className="text-lg font-bold text-orange-600 leading-none">{stats.pending}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Baby className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enfants 0-3</span>
                                    <span className="text-lg font-bold text-slate-900">{childStats.total0to3}</span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                    {activeTab === "all" ? (
                                        <>
                                            <span>Tom: {childStats.tom0to3}</span>
                                            <span>Eve: {childStats.eve0to3}</span>
                                        </>
                                    ) : activeTab === "tom" ? (
                                        <span>Tom: {childStats.tom0to3}</span>
                                    ) : (
                                        <span>Eve: {childStats.eve0to3}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enfants 3-13</span>
                                    <span className="text-lg font-bold text-slate-900">{childStats.total3to13}</span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                    {activeTab === "all" ? (
                                        <>
                                            <span>Tom: {childStats.tom3to13}</span>
                                            <span>Eve: {childStats.eve3to13}</span>
                                        </>
                                    ) : activeTab === "tom" ? (
                                        <span>Tom: {childStats.tom3to13}</span>
                                    ) : (
                                        <span>Eve: {childStats.eve3to13}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions (Float) */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-300">
                    <span className="text-sm font-semibold pr-4 border-r border-slate-700">{selectedIds.length} sélectionnés</span>
                    <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold" onClick={() => handleBulkRSVP('YES')}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmer
                        </Button>
                        <Button size="sm" className="bg-rose-600 hover:bg-rose-500 rounded-lg font-semibold" onClick={() => handleBulkRSVP('NO')}>
                            <XCircle className="w-4 h-4 mr-2" /> Décliner
                        </Button>
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setSelectedIds([])}>Annuler</Button>
                    </div>
                </div>
            )}

            {/* Main Table */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <Table className="relative">
                    <TableHeader className="bg-slate-50/80 backdrop-blur sticky top-0 z-10 border-b">
                        <TableRow>
                            <TableHead className="w-[60px] pl-6">
                                <Checkbox
                                    checked={currentGuests.length > 0 && selectedIds.length === currentGuests.length}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSelectedIds(currentGuests.map(g => g.id));
                                        else setSelectedIds([]);
                                    }}
                                />
                            </TableHead>
                            <TableHead className="py-5 font-semibold text-slate-900">Nom Complet</TableHead>
                            <TableHead className="font-semibold text-slate-900">Côté</TableHead>
                            <TableHead className="font-semibold text-slate-900">Statut RSVP</TableHead>
                            <TableHead className="text-center font-semibold text-slate-900">Invité</TableHead>
                            <TableHead className="text-center font-semibold text-slate-900">Présent</TableHead>
                            <TableHead className="w-[80px] text-right pr-6"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                                        <p className="text-slate-400 italic">Chargement des invités...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : currentGuests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                            <Users className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-slate-900">Aucun invité trouvé</h3>
                                            <p className="text-sm text-slate-500">Essayez une autre recherche ou filtre.</p>
                                        </div>
                                        <Button variant="outline" className="rounded-xl px-6" onClick={() => { setSearch(""); setActiveTab("all"); }}>
                                            Voir tout le monde
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentGuests.map((guest: any) => (
                                <TableRow
                                    key={guest.id}
                                    className="group hover:bg-slate-50 transition-colors cursor-pointer even:bg-slate-50/30"
                                    onClick={() => setEditingGuest(guest)}
                                >
                                    <TableCell className="pl-6" onClick={e => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.includes(guest.id)}
                                            onCheckedChange={() => toggleSelect(guest.id)}
                                            className="rounded-md"
                                        />
                                    </TableCell>
                                    <TableCell className="py-5 font-semibold text-slate-900">
                                        {formatDisplayName(guest.name)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "h-8 px-3 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit border-0",
                                            guest.side === 'TOM'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-pink-50 text-pink-600'
                                        )}>
                                            <User2 className="w-3.5 h-3.5" />
                                            {guest.side === 'TOM' ? 'TOM' : 'EVE'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <RSVPBadge status={guest.rsvp} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-base font-bold text-slate-700 leading-none">{guest.numGuests}</span>
                                            {guest.numChildren3to13 > 0 && (
                                                <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">
                                                    +{guest.numChildren3to13} enfants 3-13
                                                </span>
                                            )}
                                            {(guest.numChildren0to3 || 0) > 0 && (
                                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                                                    +{guest.numChildren0to3 || 0} enfants 0-3
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={cn(
                                            "inline-flex flex-col items-center p-2 rounded-xl min-w-[3.5rem]",
                                            (guest.numAdultsPresent + guest.numChildrenPresent + (guest.numChildren0to3Present || 0)) > 0 ? "bg-emerald-500 text-white" : "bg-slate-100 opacity-20"
                                        )}>
                                            <span className="text-base font-bold leading-none">
                                                {guest.numAdultsPresent + guest.numChildrenPresent + (guest.numChildren0to3Present || 0) || 0}
                                            </span>
                                            {(guest.numAdultsPresent > 0 || guest.numChildrenPresent > 0 || (guest.numChildren0to3Present || 0) > 0) && (
                                                <span className="text-[9px] font-medium mt-0.5 uppercase opacity-90 leading-none">
                                                    {guest.numAdultsPresent}a
                                                    {guest.numChildrenPresent > 0 && ` +${guest.numChildrenPresent}e`}
                                                    {(guest.numChildren0to3Present || 0) > 0 && ` +${guest.numChildren0to3Present || 0}b`}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6" onClick={e => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-slate-200" onClick={() => setEditingGuest(guest)}>
                                            <Pencil className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function RSVPBadge({ status }: { status: string }) {
    switch (status) {
        case "YES":
            return (
                <div className="flex items-center gap-2 h-8 px-4 rounded-full bg-emerald-500 text-white w-fit shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Confirmé</span>
                </div>
            );
        case "NO":
            return (
                <div className="flex items-center gap-2 h-8 px-4 rounded-full bg-slate-900 text-white w-fit">
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Absent</span>
                </div>
            );
        default:
            return (
                <div className="flex items-center gap-2 h-8 px-4 rounded-full bg-slate-100 border border-slate-200 text-slate-500 w-fit">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">En attente</span>
                </div>
            );
    }
}
