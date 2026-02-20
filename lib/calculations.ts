// Types locaux pour éviter les erreurs de cache Prisma dans l'IDE
interface LocalVendor {
    id: string;
    totalAmount: number;
    additionalFees?: number;
    pricingModel: string;
    pricePerGuest?: number | null;
    guestCountBasis: string;
    includeChildren: boolean;
    fixedGuestCountTom?: number | null;
    fixedGuestCountEve?: number | null;
    payments: LocalPayment[];
    allocationMode: string;
    remainingResponsibility: string;
    paymentResponsibility: string;
    customTomPercentage?: number | null;
    customEvePercentage?: number | null;
    customRemainingTomPercentage?: number | null;
    customRemainingEvePercentage?: number | null;
}

interface LocalPayment {
    payer: string;
    amount: number;
}

interface LocalGuest {
    side: string;
    numGuests: number;
    numPresent: number;
    numChildren3to13: number;
}

export interface VendorStats {
    totalAmount: number;
    paidTotal: number;
    paidTom: number;
    paidEve: number;
    paidCommon: number;
    remainingTotal: number;
    tomShare: number;
    eveShare: number;
    tomOwes: number;
    eveOwes: number;
}

export function calculateVendorStats(
    vendor: LocalVendor,
    guests: LocalGuest[]
): VendorStats {
    const guestsTom = guests.filter((g) => g.side === "TOM");
    const guestsEve = guests.filter((g) => g.side === "EVE");

    // Helper to get guest count based on basis
    const getCount = (list: LocalGuest[], basis: string, includeChildren: boolean) => {
        return list.reduce((acc: number, g: LocalGuest) => {
            const count = basis === "INVITED" ? g.numGuests : g.numPresent;
            const children = includeChildren ? g.numChildren3to13 : 0;
            return acc + count + children;
        }, 0);
    };

    const countTom = vendor.fixedGuestCountTom ?? getCount(guestsTom, vendor.guestCountBasis, vendor.includeChildren);
    const countEve = vendor.fixedGuestCountEve ?? getCount(guestsEve, vendor.guestCountBasis, vendor.includeChildren);
    const totalGuests = countTom + countEve;
    const realTotalGuests = totalGuests; // Now the same variable to avoid confusion in downstream logic

    // 1. Determine Total Amount
    let totalAmount = vendor.totalAmount + ((vendor as any).additionalFees || 0);
    if (vendor.pricingModel === "PER_GUEST" && vendor.pricePerGuest) {
        totalAmount = (totalGuests * vendor.pricePerGuest) + ((vendor as any).additionalFees || 0);
    }

    // 2. Determine Payments
    const paidTom = vendor.payments
        .filter((p: LocalPayment) => p.payer === "TOM")
        .reduce((acc: number, p: LocalPayment) => acc + p.amount, 0);
    const paidEve = vendor.payments
        .filter((p: LocalPayment) => p.payer === "EVE")
        .reduce((acc: number, p: LocalPayment) => acc + p.amount, 0);
    const paidCommon = vendor.payments
        .filter((p: LocalPayment) => p.payer === "COMMON")
        .reduce((acc: number, p: LocalPayment) => acc + p.amount, 0);
    const paidTotal = paidTom + paidEve + paidCommon;

    // 3. Determine Shares (who owes what)
    let tomShare = 0;
    let eveShare = 0;
    let tomOwes = 0;
    let eveOwes = 0;

    const commonDeduction = paidCommon / 2;
    const remainingTotal = Math.max(0, totalAmount - paidTotal);

    if (vendor.allocationMode === "REMAINING_ONLY") {
        // Base calculations on the REMAINING TOTAL and REMAINING RESPONSIBILITY
        let remainingTomOwes = 0;
        let remainingEveOwes = 0;

        switch (vendor.remainingResponsibility) {
            case "TOM_100":
                remainingTomOwes = remainingTotal;
                remainingEveOwes = 0;
                break;
            case "EVE_100":
                remainingTomOwes = 0;
                remainingEveOwes = remainingTotal;
                break;
            case "SPLIT_50_50":
                remainingTomOwes = remainingTotal / 2;
                remainingEveOwes = remainingTotal / 2;
                break;
            case "CUSTOM_SPLIT":
                remainingTomOwes = (remainingTotal * (vendor.customRemainingTomPercentage || 50)) / 100;
                remainingEveOwes = (remainingTotal * (vendor.customRemainingEvePercentage || 50)) / 100;
                break;
            case "PER_INVITEE_BY_FAMILY":
                if (realTotalGuests > 0) {
                    remainingTomOwes = (remainingTotal * countTom) / realTotalGuests;
                    remainingEveOwes = (remainingTotal * countEve) / realTotalGuests;
                } else {
                    remainingTomOwes = remainingTotal / 2;
                    remainingEveOwes = remainingTotal / 2;
                }
                break;
        }

        tomOwes = remainingTomOwes;
        eveOwes = remainingEveOwes;

        // In REMAINING_ONLY mode, their "total share" of the contract is what they already paid plus what they owe of the rest
        tomShare = paidTom + commonDeduction + tomOwes;
        eveShare = paidEve + commonDeduction + eveOwes;
    } else {
        // DEFAULT TOTAL_STANDARD MODE
        // Base calculations on TOTAL AMOUNT and PAYMENT RESPONSIBILITY
        switch (vendor.paymentResponsibility) {
            case "TOM_100":
                tomShare = totalAmount;
                eveShare = 0;
                break;
            case "EVE_100":
                tomShare = 0;
                eveShare = totalAmount;
                break;
            case "SPLIT_50_50":
                tomShare = totalAmount / 2;
                eveShare = totalAmount / 2;
                break;
            case "CUSTOM_SPLIT":
                tomShare = (totalAmount * (vendor.customTomPercentage || 50)) / 100;
                eveShare = (totalAmount * (vendor.customEvePercentage || 50)) / 100;
                break;
            case "PER_INVITEE_BY_FAMILY":
                if (realTotalGuests > 0) {
                    tomShare = (totalAmount * countTom) / realTotalGuests;
                    eveShare = (totalAmount * countEve) / realTotalGuests;
                } else {
                    tomShare = totalAmount / 2;
                    eveShare = totalAmount / 2;
                }
                break;
        }

        tomOwes = Math.max(0, tomShare - paidTom - commonDeduction);
        eveOwes = Math.max(0, eveShare - paidEve - commonDeduction);
    }

    return {
        totalAmount,
        paidTotal,
        paidTom,
        paidEve,
        paidCommon,
        remainingTotal,
        tomShare,
        eveShare,
        tomOwes,
        eveOwes,
    };
}
