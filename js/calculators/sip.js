document.getElementById('sip-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const amount = parseIndianNumber(document.getElementById('sip-amount').value);
    const duration = parseFloat(document.getElementById('sip-duration').value);
    const annualRatePercent = parseFloat(document.getElementById('sip-return').value);
    const existingInvestment = parseIndianNumber(document.getElementById('sip-existing-investment').value);
    const inflationRate = parseFloat(document.getElementById('sip-inflation-rate').value) / 100;

    const cadence = (document.getElementById('sip-cadence')?.value) || 'monthly';
    const periodsPerYear = getPeriodsPerYear(cadence);
    const periodRate = annualPercentToPeriodRate(annualRatePercent, periodsPerYear);

    const stepUpMode = (document.getElementById('sip-step-up-mode')?.value) || 'percent';
    const stepUpPercent = parseFloat(document.getElementById('sip-step-up')?.value || '0') / 100;
    const stepUpFixed = parseIndianNumber(document.getElementById('sip-step-up-fixed')?.value || '0');
    const taxRegime = (document.getElementById('sip-tax-regime')?.value) || 'none';
    const equityExemption = parseIndianNumber(document.getElementById('sip-tax-equity-exemption')?.value || '100000');
    const debtSlab = parseFloat(document.getElementById('sip-tax-debt-slab')?.value || '30') / 100;

    let totalInvested = existingInvestment;
    const totalPeriods = duration * periodsPerYear;
    let contribution = amount;

    const futureValueOfExisting = existingInvestment * Math.pow((1 + annualRatePercent / 100), duration);

    let futureValue = futureValueOfExisting;

    const labels = [];
    const data = [];

    for (let i = 1; i <= totalPeriods; i++) {
        totalInvested += contribution;
        futureValue = (futureValue + contribution) * (1 + periodRate);

        if (i % periodsPerYear === 0) {
            if (stepUpMode === 'percent') {
                contribution *= (1 + stepUpPercent);
            } else if (stepUpMode === 'fixed') {
                contribution += stepUpFixed;
            }
            labels.push(`Year ${i/periodsPerYear}`);
            data.push(futureValue.toFixed(0));
        }
    }

    const wealthGained = futureValue - totalInvested;
    const realFutureValue = futureValue / Math.pow(1 + inflationRate, duration);
    const futureValueAfterTax = applyEndTaxOnGains(futureValue, totalInvested, taxRegime, { equityLtcgExemption: equityExemption, debtSlabRate: debtSlab });

    document.getElementById('sip-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('sip-wealth-gained').textContent = formatCurrency(wealthGained);
    document.getElementById('sip-future-value').textContent = formatCurrency(futureValue);
    const afterTaxElm = document.getElementById('sip-future-value-after-tax');
    if (afterTaxElm) afterTaxElm.textContent = formatCurrency(futureValueAfterTax);
    document.getElementById('sip-real-future-value').textContent = formatCurrency(realFutureValue);

    createGrowthChart(labels, data, 'sip-chart');
});