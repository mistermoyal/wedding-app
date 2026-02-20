"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";

export interface PaymentFormProps {
    initialData?: any;
    vendors: any[];
    fixedVendorId?: string;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function PaymentForm({ initialData, vendors, fixedVendorId, onSubmit, onCancel, loading }: PaymentFormProps) {
    const [formData, setFormData] = useState({
        vendorId: fixedVendorId || initialData?.vendorId || "",
        amount: initialData?.amount || 0,
        payer: initialData?.payer || "TOM",
        method: initialData?.method || "Virement",
        date: initialData?.date ?
            (() => {
                const d = new Date(initialData.date);
                // Use local date parts to avoid UTC shift
                const Y = d.getFullYear();
                const M = String(d.getMonth() + 1).padStart(2, '0');
                const D = String(d.getDate()).padStart(2, '0');
                return `${Y}-${M}-${D}`;
            })() : new Date().toISOString().split('T')[0],
        memo: initialData?.memo || "",
        hasReceipt: initialData?.hasReceipt ?? false,
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
            <div className="space-y-2">
                <Label htmlFor="vendorId">Prestataire</Label>
                {fixedVendorId ? (
                    <Input disabled value={vendors.find(v => v.id === fixedVendorId)?.name || "Prestataire"} />
                ) : (
                    <Select
                        value={formData.vendorId}
                        onValueChange={(v) => handleChange("vendorId", v)}
                        disabled={!!fixedVendorId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir un prestataire" />
                        </SelectTrigger>
                        <SelectContent>
                            {vendors.filter(v => v.status !== "ARCHIVÉ").map(v => (
                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Montant (₪)</Label>
                    <p className="text-[10px] text-slate-400 italic">Saisie en ₪ (stockage)</p>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Date du règlement</Label>
                    <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Qui a payé ?</Label>
                    <Select
                        value={formData.payer}
                        onValueChange={(v) => handleChange("payer", v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TOM">Tom</SelectItem>
                            <SelectItem value="EVE">Eve</SelectItem>
                            <SelectItem value="COMMON">Commun</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Méthode</Label>
                    <Select
                        value={formData.method}
                        onValueChange={(v) => handleChange("method", v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Virement">Virement</SelectItem>
                            <SelectItem value="Liquide">Espèces / Liquide</SelectItem>
                            <SelectItem value="CB">Carte Bancaire</SelectItem>
                            <SelectItem value="Chèque">Chèque</SelectItem>
                            <SelectItem value="Bit/PayBox">Bit / PayBox</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="memo">Note / Libellé</Label>
                <Input
                    id="memo"
                    placeholder="ex: Acompte n°1, Solde..."
                    value={formData.memo}
                    onChange={(e) => handleChange("memo", e.target.value)}
                />
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                    id="hasReceipt"
                    checked={formData.hasReceipt}
                    onCheckedChange={(v) => handleChange("hasReceipt", !!v)}
                />
                <Label htmlFor="hasReceipt" className="text-sm">Reçu / Facture en possession</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
                    Annuler
                </Button>
                <Button type="submit" className="bg-slate-900 text-white" disabled={loading}>
                    {loading ? "Enregistrement..." : initialData ? "Modifier le paiement" : "Enregistrer le paiement"}
                </Button>
            </div>
        </form>
    );
}
