"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export interface GuestFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function GuestForm({ initialData, onSubmit, onCancel, loading }: GuestFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        side: initialData?.side || "TOM",
        rsvp: initialData?.rsvp || "PENDING",
        numGuests: initialData?.numGuests || 1, // Invited Adults
        numChildren3to13: initialData?.numChildren3to13 || 0, // Invited Kids
        numAdultsPresent: initialData?.numAdultsPresent || 0, // Coming Adults
        numChildrenPresent: initialData?.numChildrenPresent || 0, // Coming Kids
        saveTheDate: initialData?.saveTheDate ?? true, // Default to true as per user request
        invited: initialData?.invited ?? false,
        notes: initialData?.notes || "",
    });

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <form
            className="space-y-6"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(formData);
            }}
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-semibold">Nom / Famille</Label>
                    <Input
                        id="name"
                        placeholder="ex: Famille Dupont"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className="bg-slate-50/50"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Côté</Label>
                    <Select
                        value={formData.side}
                        onValueChange={(v) => handleChange("side", v)}
                    >
                        <SelectTrigger className="bg-slate-50/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TOM">Tom</SelectItem>
                            <SelectItem value="EVE">Eve</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        Invitation
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="numGuests" className="text-xs font-semibold text-slate-600 uppercase">Nb adultes</Label>
                            <Input
                                id="numGuests"
                                type="number"
                                min="0"
                                value={formData.numGuests}
                                onChange={(e) => handleChange("numGuests", parseInt(e.target.value) || 0)}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numChildren" className="text-xs font-semibold text-slate-600 uppercase">Nb enfants</Label>
                            <Input
                                id="numChildren"
                                type="number"
                                min="0"
                                value={formData.numChildren3to13}
                                onChange={(e) => handleChange("numChildren3to13", parseInt(e.target.value) || 0)}
                                className="h-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600/60 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Confirmation (Présents)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="numAdultsPresent" className="text-xs font-semibold text-emerald-700 uppercase">Nb adultes</Label>
                            <Input
                                id="numAdultsPresent"
                                type="number"
                                min="0"
                                value={formData.numAdultsPresent}
                                onChange={(e) => handleChange("numAdultsPresent", parseInt(e.target.value) || 0)}
                                className="h-9 border-emerald-100 focus-visible:ring-emerald-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numChildrenPresent" className="text-xs font-semibold text-emerald-700 uppercase">Nb enfants</Label>
                            <Input
                                id="numChildrenPresent"
                                type="number"
                                min="0"
                                value={formData.numChildrenPresent}
                                onChange={(e) => handleChange("numChildrenPresent", parseInt(e.target.value) || 0)}
                                className="h-9 border-emerald-100 focus-visible:ring-emerald-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Statut RSVP</Label>
                    <Select
                        value={formData.rsvp}
                        onValueChange={(v) => handleChange("rsvp", v)}
                    >
                        <SelectTrigger className="bg-slate-50/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">En attente</SelectItem>
                            <SelectItem value="YES">Présent (Oui)</SelectItem>
                            <SelectItem value="NO">Absent (Non)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col justify-end gap-3 pb-1">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="saveTheDate"
                            checked={formData.saveTheDate}
                            onCheckedChange={(v) => handleChange("saveTheDate", !!v)}
                        />
                        <Label htmlFor="saveTheDate" className="text-sm cursor-pointer">Save the Date envoyé</Label>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-700 font-semibold">Notes / Régimes alimentaires</Label>
                <Input
                    id="notes"
                    placeholder="Rien à signaler..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="bg-slate-50/50"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={onCancel} disabled={loading} className="text-slate-500 hover:text-slate-700">
                    Annuler
                </Button>
                <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200" disabled={loading}>
                    {loading ? "Enregistrement..." : initialData ? "Modifier l'invité" : "Ajouter l'invité"}
                </Button>
            </div>
        </form>
    );
}
