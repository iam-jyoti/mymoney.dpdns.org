document.getElementById('lumpsum-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const amount = parseIndianNumber(document.getElementById('lumpsum-amount').value);
    const duration = parseFloat(document.getElementById('lumpsum-duration').value);
    const rate = parseFloat(document.getElementById('lumpsum-return').value);
    const inflationRate = parseFloat(document.getElementById('lumpsum-inflation-rate').value) / 100;
    const taxRegime = (document.getElementById('lumpsum-tax-regime')?.value) || 'none';
    const equityExemption = parseIndianNumber(document.getElementById('lumpsum-tax-equity-exemption')?.value || '100000');
    const debtSlab = parseFloat(document.getElementById('lumpsum-tax-debt-slab')?.value || '30') / 100;

    const futureValue = amount * Math.pow((1 + rate / 100), duration);
    const wealthGained = futureValue - amount;
    const realFutureValue = futureValue / Math.pow(1 + inflationRate, duration);
    const futureValueAfterTax = applyEndTaxOnGains(futureValue, amount, taxRegime, { equityLtcgExemption: equityExemption, debtSlabRate: debtSlab });

    document.getElementById('lumpsum-invested').textContent = formatCurrency(amount);
    document.getElementById('lumpsum-wealth-gained').textContent = formatCurrency(wealthGained);
    document.getElementById('lumpsum-future-value').textContent = formatCurrency(futureValue);
    const afterTaxElm = document.getElementById('lumpsum-future-value-after-tax');
    if (afterTaxElm) afterTaxElm.textContent = formatCurrency(futureValueAfterTax);
    document.getElementById('lumpsum-real-future-value').textContent = formatCurrency(realFutureValue);

    const labels = [];
    const data = [];
    for (let i = 1; i <= duration; i++) {
        labels.push(`Year ${i}`);
        data.push((amount * Math.pow((1 + rate / 100), i)).toFixed(0));
    }

    createGrowthChart(labels, data, 'lumpsum-chart');
});