// Finance utilities: cadence conversion and tax handling

function getPeriodsPerYear(cadence) {
    switch (cadence) {
        case 'weekly':
            return 52;
        case 'quarterly':
            return 4;
        case 'monthly':
        default:
            return 12;
    }
}

function annualPercentToPeriodRate(annualPercent, periodsPerYear) {
    const annualRate = annualPercent / 100;
    return annualRate / periodsPerYear;
}

function getTaxParams(regime, opts = {}) {
    if (regime === 'equity') {
        return {
            type: 'equity',
            stcgRate: 0.15, // < 1 year
            ltcgRate: 0.10, // >= 1 year
            ltcgExemption: typeof opts.equityLtcgExemption === 'number' ? opts.equityLtcgExemption : 100000
        };
    }
    if (regime === 'debt') {
        return {
            type: 'debt',
            slabRate: typeof opts.debtSlabRate === 'number' ? opts.debtSlabRate : 0.30
        };
    }
    return { type: 'none' };
}

function applyEndTaxOnGains(finalValue, totalInvested, regime, opts = {}) {
    const params = getTaxParams(regime, opts);
    const gains = Math.max(0, finalValue - totalInvested);
    if (params.type === 'equity') {
        const taxable = Math.max(0, gains - params.ltcgExemption);
        const tax = taxable * params.ltcgRate;
        return finalValue - tax;
    }
    if (params.type === 'debt') {
        const tax = gains * params.slabRate;
        return finalValue - tax;
    }
    return finalValue;
}

function solveSipForTargetAfterTax({
    targetAfterTax,
    periods,
    periodRate,
    existingAmount,
    annualRatePercent,
    years,
    regime,
    taxOptions
}) {
    // Bisection search for required contribution per period so that after-tax FV >= targetAfterTax
    const maxIterations = 40;
    let low = 0;
    let high = targetAfterTax; // upper bound

    function fvForContribution(contribution) {
        const fvExisting = existingAmount * Math.pow(1 + annualRatePercent / 100, years);
        const fvAnnuity = contribution * (((Math.pow(1 + periodRate, periods) - 1) / periodRate) * (1 + periodRate));
        const preTaxFV = fvExisting + fvAnnuity;
        const totalInvested = existingAmount + contribution * periods;
        return applyEndTaxOnGains(preTaxFV, totalInvested, regime, taxOptions);
    }

    for (let i = 0; i < maxIterations; i++) {
        const mid = (low + high) / 2;
        const fv = fvForContribution(mid);
        if (fv >= targetAfterTax) {
            high = mid;
        } else {
            low = mid;
        }
    }
    return high;
}

function applyAnnualTaxOnCapitalGains(balanceStart, balanceEnd, withdrawals, regime, yearIndex = 1, opts = {}) {
    const params = getTaxParams(regime, opts);
    const gains = balanceEnd - balanceStart + withdrawals; // approximated realized gains
    if (gains <= 0 || params.type === 'none') return balanceEnd;

    if (params.type === 'equity') {
        // Approximation: first year withdrawals taxed as STCG, subsequent years as LTCG with annual exemption
        if (yearIndex <= 1) {
            const tax = gains * params.stcgRate;
            return balanceEnd - tax;
        } else {
            const taxable = Math.max(0, gains - params.ltcgExemption);
            const tax = taxable * params.ltcgRate;
            return balanceEnd - tax;
        }
    }
    if (params.type === 'debt') {
        const tax = gains * params.slabRate;
        return balanceEnd - tax;
    }
    return balanceEnd;
}


