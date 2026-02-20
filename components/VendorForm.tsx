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
import { Textarea } from "@/components/ui/textarea";

export interface VendorFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function VendorForm({ initialData, onSubmit, onCancel, loading }: VendorFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        category: initialData?.category || "",
        totalAmount: initialData?.totalAmount || 0,
        estimation: initialData?.estimation ?? "",
        pricingModel: initialData?.pricingModel || "FIXED",
        pricePerGuest: initialData?.pricePerGuest || 0,
        fixedGuestCountTom: initialData?.fixedGuestCountTom ?? "",
        fixedGuestCountEve: initialData?.fixedGuestCountEve ?? "",
        includeChildren: initialData?.includeChildren ?? false,
        guestCountBasis: initialData?.guestCountBasis || "INVITED",
        paymentResponsibility: initialData?.paymentResponsibility || "SPLIT_50_50",
        customTomPercentage: initialData?.customTomPercentage ?? 50,
        customEvePercentage: initialData?.customEvePercentage ?? 50,
        allocationMode: initialData?.allocationMode || "TOTAL_STANDARD",
        remainingResponsibility: initialData?.remainingResponsibility || "SPLIT_50_50",
        customRemainingTomPercentage: initialData?.customRemainingTomPercentage ?? 50,
        customRemainingEvePercentage: initialData?.customRemainingEvePercentage ?? 50,
        additionalFees: initialData?.additionalFees ?? 0,
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
                    <Label htmlFor="name">Nom du prestataire</Label>
                    <Input
                        id="name"
                        placeholder="ex: Traiteur, DJ..."
                        value={formData.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Input
                        id="category"
                        placeholder="ex: Restauration, Musique..."
                        value={formData.category || ""}
                        onChange={(e) => handleChange("category", e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="estimation">Estimation (₪)</Label>
                    <p className="text-[10px] text-slate-400 italic">Saisie en ₪ (stockage)</p>
                    <Input
                        id="estimation"
                        type="number"
                        step="0.01"
                        placeholder="Budget prévisionnel (optionnel)"
                        value={formData.estimation ?? ""}
                        onChange={(e) => handleChange("estimation", e.target.value ? parseFloat(e.target.value) : null)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Modèle de tarification</Label>
                    <Select
                        value={formData.pricingModel}
                        onValueChange={(v) => handleChange("pricingModel", v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="FIXED">Fixe</SelectItem>
                            <SelectItem value="PER_GUEST">Par invité</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    {formData.pricingModel === "FIXED" ? (
                        <>
                            <Label htmlFor="totalAmount">Montant contrat total (₪)</Label>
                            <p className="text-[10px] text-slate-400 italic">Saisie en ₪ (stockage)</p>
                            <Input
                                id="totalAmount"
                                type="number"
                                step="0.01"
                                value={formData.totalAmount ?? ""}
                                onChange={(e) => handleChange("totalAmount", parseFloat(e.target.value))}
                            />
                        </>
                    ) : (
                        <>
                            <Label htmlFor="pricePerGuest">Prix par invité (₪)</Label>
                            <p className="text-[10px] text-slate-400 italic">Saisie en ₪ (stockage)</p>
                            <Input
                                id="pricePerGuest"
                                type="number"
                                step="0.01"
                                value={formData.pricePerGuest ?? ""}
                                onChange={(e) => handleChange("pricePerGuest", parseFloat(e.target.value))}
                            />
                        </>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="additionalFees">Frais additionnels (₪)</Label>
                    <p className="text-[10px] text-slate-400 italic">Saisie en ₪ (stockage)</p>
                    <Input
                        id="additionalFees"
                        type="number"
                        step="0.01"
                        placeholder="Ex: pourboires, extras..."
                        value={formData.additionalFees ?? ""}
                        onChange={(e) => handleChange("additionalFees", e.target.value ? parseFloat(e.target.value) : 0)}
                    />
                    <p className="text-[10px] text-slate-400 italic leading-tight">
                        Paiements divers (serveurs, pourboires). S'ajoutent au total du contrat.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fixedGuestCountTom">Invités fixes (Tom)</Label>
                    <Input
                        id="fixedGuestCountTom"
                        type="number"
                        placeholder="Optionnel"
                        value={formData.fixedGuestCountTom ?? ""}
                        onChange={(e) => handleChange("fixedGuestCountTom", e.target.value ? parseInt(e.target.value) : null)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fixedGuestCountEve">Invités fixes (Eve)</Label>
                    <Input
                        id="fixedGuestCountEve"
                        type="number"
                        placeholder="Optionnel"
                        value={formData.fixedGuestCountEve ?? ""}
                        onChange={(e) => handleChange("fixedGuestCountEve", e.target.value ? parseInt(e.target.value) : null)}
                    />
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-900">Mode de Répartition</Label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => handleChange("allocationMode", "TOTAL_STANDARD")}
                            className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${formData.allocationMode === "TOTAL_STANDARD"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Total du contrat
                        </button>
                        <button
                            type="button"
                            onClick={() => handleChange("allocationMode", "REMAINING_ONLY")}
                            className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${formData.allocationMode === "REMAINING_ONLY"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Reste à payer
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                        {formData.allocationMode === "TOTAL_STANDARD"
                            ? "Le calcul s'applique sur le montant total du contrat."
                            : "Le calcul s'applique uniquement sur le reste à payer (Contrat total - Déjà payé). N'affecte pas les paiements passés."}
                    </p>
                </div>

                {formData.allocationMode === "TOTAL_STANDARD" ? (
                    <div className="space-y-4">
                        <Label>Responsabilité (sur le Total)</Label>
                        <Select
                            value={formData.paymentResponsibility}
                            onValueChange={(v) => handleChange("paymentResponsibility", v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SPLIT_50_50">Partagé 50/50</SelectItem>
                                <SelectItem value="TOM_100">Tom (100%)</SelectItem>
                                <SelectItem value="EVE_100">Eve (100%)</SelectItem>
                                <SelectItem value="CUSTOM_SPLIT">Partage personnalisé (%)</SelectItem>
                                <SelectItem value="PER_INVITEE_BY_FAMILY">Au prorata des invités (définis ou RSVPs)</SelectItem>
                            </SelectContent>
                        </Select>

                        {formData.paymentResponsibility === "CUSTOM_SPLIT" && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                <div className="space-y-2">
                                    <Label>Part Tom (%)</Label>
                                    <Input
                                        type="number"
                                        value={formData.customTomPercentage ?? ""}
                                        onChange={(e) => handleChange("customTomPercentage", parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Part Eve (%)</Label>
                                    <Input
                                        type="number"
                                        value={formData.customEvePercentage ?? ""}
                                        onChange={(e) => handleChange("customEvePercentage", parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Label>Qui paie le RÉSTE ?</Label>
                        <Select
                            value={formData.remainingResponsibility}
                            onValueChange={(v) => handleChange("remainingResponsibility", v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SPLIT_50_50">Partagé 50/50</SelectItem>
                                <SelectItem value="TOM_100">Tom paie le reste</SelectItem>
                                <SelectItem value="EVE_100">Eve paie le reste</SelectItem>
                                <SelectItem value="CUSTOM_SPLIT">Partage personnalisé (%)</SelectItem>
                                <SelectItem value="PER_INVITEE_BY_FAMILY">Au prorata des invités (définis ou RSVPs)</SelectItem>
                            </SelectContent>
                        </Select>

                        {formData.remainingResponsibility === "CUSTOM_SPLIT" && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                <div className="space-y-2">
                                    <Label>Tom % du reste</Label>
                                    <Input
                                        type="number"
                                        value={formData.customRemainingTomPercentage ?? ""}
                                        onChange={(e) => handleChange("customRemainingTomPercentage", parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Eve % du reste</Label>
                                    <Input
                                        type="number"
                                        value={formData.customRemainingEvePercentage ?? ""}
                                        onChange={(e) => handleChange("customRemainingEvePercentage", parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-2 pt-2 border-t mt-4">
                <Label htmlFor="notes">Notes du contrat</Label>
                <Textarea
                    id="notes"
                    placeholder="Détails du contrat, options..."
                    value={formData.notes || ""}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={3}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
                    Annuler
                </Button>
                <Button type="submit" className="bg-slate-900 text-white" disabled={loading}>
                    {loading ? "Enregistrement..." : initialData ? "Mettre à jour" : "Ajouter le prestataire"}
                </Button>
            </div>
        </form>
    );
}
