document.getElementById('sip-target-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const targetAmount = parseIndianNumber(document.getElementById('sip-target-amount').value);
    const duration = parseFloat(document.getElementById('sip-target-duration').value);
    const rate = parseFloat(document.getElementById('sip-target-return').value);
    const existingInvestments = parseIndianNumber(document.getElementById('sip-target-existing').value);
    const cadence = (document.getElementById('sip-target-cadence')?.value) || 'monthly';
    const periodsPerYear = getPeriodsPerYear(cadence);
    const periodRate = annualPercentToPeriodRate(rate, periodsPerYear);
    const taxRegime = (document.getElementById('sip-target-tax-regime')?.value) || 'none';
    const equityExemption = parseIndianNumber(document.getElementById('sip-target-tax-equity-exemption')?.value || '100000');
    const debtSlab = parseFloat(document.getElementById('sip-target-tax-debt-slab')?.value || '30') / 100;

    const periods = duration * periodsPerYear;
    
    function requiredContributionPerPeriod(years) {
        const periodsLocal = years * periodsPerYear;
        // We solve after-tax to match the targetAmount as an after-tax future value
        return solveSipForTargetAfterTax({
            targetAfterTax: targetAmount,
            periods: periodsLocal,
            periodRate: periodRate,
            existingAmount: existingInvestments,
            annualRatePercent: rate,
            years: years,
            regime: taxRegime,
            taxOptions: { equityLtcgExemption: equityExemption, debtSlabRate: debtSlab }
        });
    }

    const requiredSip = requiredContributionPerPeriod(duration);
    const totalInvestment = requiredSip * periods;

    document.getElementById('sip-target-required-sip').textContent = formatCurrency(requiredSip);
    document.getElementById('sip-target-total-investment').textContent = formatCurrency(totalInvestment + existingInvestments);
    document.getElementById('sip-target-future-existing').textContent = formatCurrency(existingInvestments * Math.pow((1 + rate / 100), duration));
    
    // Calculate target achievement time
    const years = Math.floor(duration);
    const months = Math.round((duration - years) * 12);
    const achievementText = months > 0 ? `${years} years ${months} months` : `${years} years`;
    document.getElementById('sip-target-achievement').textContent = achievementText;

    const labels = [];
    const data = [];
    let currentValue = existingInvestments * Math.pow((1 + rate / 100), duration);
    for (let i = 1; i <= duration; i++) {
        currentValue += requiredSip * periodsPerYear;
        currentValue *= (1 + rate/100);
        labels.push(`Year ${i}`);
        data.push(currentValue.toFixed(0));
    }

    createGrowthChart(labels, data, 'sip-target-chart');

    // Cost of Delay Calculation
    const costOfDelaySection = document.getElementById('cost-of-delay-section');
    const delays = [1, 2, 3, 4, 5];
    let tableHtml = '<h3 class="mt-4">Cost of Delay</h3><table class="table table-bordered"><thead><tr><th>Delay (Years)</th><th>Required Monthly SIP</th></tr></thead><tbody>';

    delays.forEach(delay => {
        if (duration > delay) {
            const delayedSip = requiredContributionPerPeriod(duration - delay);
            tableHtml += `<tr><td>${delay}</td><td>${formatCurrency(delayedSip)}</td></tr>`;
        }
    });

    tableHtml += '</tbody></table>';
    costOfDelaySection.innerHTML = tableHtml;
});