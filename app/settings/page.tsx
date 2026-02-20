"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Save,
    Download,
    Upload,
    Calendar,
    Settings as SettingsIcon,
    Database,
    Info,
    CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMessage({ type: "success", text: "Paramètres enregistrés avec succès !" });
                // Trigger a refresh of the sidebar
                window.dispatchEvent(new Event("settingsUpdated"));
            } else {
                setMessage({ type: "error", text: "Erreur lors de l'enregistrement." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Erreur réseau." });
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        // Implement export logic (fetch all data and download as JSON)
        try {
            const res = await fetch("/api/backup/export");
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `mariage_backup_${format(new Date(), "yyyy-MM-dd")}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed", error);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = JSON.parse(event.target?.result as string);
                if (!confirm("Attention : cela va écraser TOUTES les données actuelles. Continuer ?")) return;

                const res = await fetch("/api/backup/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(content)
                });

                if (res.ok) {
                    alert("Restauration réussie ! L'application va recharger.");
                    window.location.reload();
                } else {
                    alert("Erreur lors de l'importation.");
                }
            } catch (error) {
                alert("Fichier JSON invalide.");
            }
        };
        reader.readAsText(file);
    };

    if (loading) return <div className="p-8 text-slate-500">Chargement...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-slate-400" />
                    Paramètres
                </h2>
                <p className="text-slate-500">Gérez les réglages généraux et vos sauvegardes de données.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-red-50 text-red-800 border border-red-100"}`}>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation Latérale Interne */}
                <div className="space-y-1">
                    <button className="w-full text-left px-4 py-2 text-sm font-bold bg-white text-slate-900 rounded-md shadow-sm border border-slate-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-pink-500" /> Général
                    </button>
                    <button onClick={() => document.getElementById('backup-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-md transition-all flex items-center gap-2">
                        <Database className="w-4 h-4" /> Sauvegarde
                    </button>
                    <button onClick={() => document.getElementById('app-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-md transition-all flex items-center gap-2">
                        <Info className="w-4 h-4" /> Application
                    </button>
                </div>

                {/* Contenu Principal */}
                <div className="md:col-span-2 space-y-8">
                    {/* Section Général */}
                    <Card id="general-section" className="border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg">Général</CardTitle>
                            <CardDescription>Informations de base de votre mariage.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="groomName">Prénom Marié</Label>
                                        <Input
                                            id="groomName"
                                            value={settings.groomName}
                                            onChange={e => setSettings({ ...settings, groomName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brideName">Prénom Mariée</Label>
                                        <Input
                                            id="brideName"
                                            value={settings.brideName}
                                            onChange={e => setSettings({ ...settings, brideName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weddingDate">Date du Mariage</Label>
                                    <Input
                                        id="weddingDate"
                                        type="date"
                                        value={settings.weddingDate ? format(new Date(settings.weddingDate), "yyyy-MM-dd") : ""}
                                        onChange={e => setSettings({ ...settings, weddingDate: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-400">Cette date est utilisée pour le compte à rebours et l'affichage global.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Devise par défaut</Label>
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-dashed rounded-md text-slate-500">
                                        <span className="text-xl font-bold">₪</span>
                                        <span className="text-sm">Shekel Israélien (ILS)</span>
                                        <Badge variant="outline" className="ml-auto text-[10px]">Fixe</Badge>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-slate-900">Conversion Devises</h4>
                                        <Badge className="bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-widest text-[9px]">Nouveau</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rateIlsToEur">Valeur de 1 ₪ en Euro (€)</Label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-none bg-slate-100 px-4 py-2 rounded-md border border-slate-200 font-bold text-slate-600">
                                                1 ₪ =
                                            </div>
                                            <div className="relative flex-1">
                                                <Input
                                                    id="rateIlsToEur"
                                                    type="number"
                                                    step="0.001"
                                                    placeholder="0.25"
                                                    className="pr-8 font-bold"
                                                    value={settings.rateIlsToEur ?? ""}
                                                    onChange={e => setSettings({ ...settings, rateIlsToEur: e.target.value })}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 italic">Ce taux est utilisé pour convertir tous les montants du site vers l'Euro.</p>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={saving}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Section Sauvegarde */}
                    <Card id="backup-section" className="border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg">Sauvegarde</CardTitle>
                            <CardDescription>Exportez ou restaurez l'intégralité de vos données locales.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                    Les données sont stockées sur votre appareil (SQLite). Nous vous recommandons d'exporter régulièrement une sauvegarde pour éviter toute perte de données.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button onClick={handleExport} variant="outline" className="flex-1 flex flex-col items-center gap-2 h-auto py-6 group hover:border-slate-300">
                                    <Download className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <div className="text-center">
                                        <div className="font-bold">Exporter</div>
                                        <div className="text-[10px] text-slate-500">Télécharger un fichier .json</div>
                                    </div>
                                </Button>

                                <label className="flex-1">
                                    <div className="w-full h-full">
                                        <Input
                                            type="file"
                                            accept=".json"
                                            onChange={handleImport}
                                            className="hidden"
                                            id="import-input"
                                        />
                                        <Button asChild variant="outline" className="w-full flex flex-col items-center gap-2 h-auto py-6 cursor-pointer group hover:border-slate-300">
                                            <div onClick={() => document.getElementById('import-input')?.click()}>
                                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-pink-500 transition-colors" />
                                                <div className="text-center">
                                                    <div className="font-bold">Restaurer</div>
                                                    <div className="text-[10px] text-slate-500">Importer un fichier .json</div>
                                                </div>
                                            </div>
                                        </Button>
                                    </div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section Application */}
                    <Card id="app-section" className="border-slate-200/60 shadow-sm overflow-hidden border-dashed">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg">Application</CardTitle>
                            <CardDescription>Détails techniques du projet.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Nom du projet</span>
                                    <span className="text-sm font-bold text-slate-900">Mariage Eve & Tom</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Mode</span>
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold border-emerald-100">Local (Next.js + SQLite)</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm font-medium text-slate-500">Version</span>
                                    <span className="text-sm text-slate-400">1.0.0-beta</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}

function Badge({ children, className, variant = "default" }: any) {
    const variants: any = {
        default: "bg-slate-900 text-white",
        outline: "border border-slate-200 text-slate-600",
        secondary: "bg-slate-100 text-slate-600"
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
