document.getElementById('swp-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const initialInvestment = parseIndianNumber(document.getElementById('swp-initial-investment').value);
    let withdrawalPerCadence = parseIndianNumber(document.getElementById('swp-monthly-withdrawal').value);
    const annualReturn = parseFloat(document.getElementById('swp-annual-return').value);
    const inflationRate = parseFloat(document.getElementById('swp-inflation-rate').value);
    const taxRegime = (document.getElementById('swp-tax-regime')?.value) || 'none';
    const equityExemption = parseIndianNumber(document.getElementById('swp-tax-equity-exemption')?.value || '100000');
    const debtSlab = parseFloat(document.getElementById('swp-tax-debt-slab')?.value || '30') / 100;
    const cadence = (document.getElementById('swp-cadence')?.value) || 'monthly';

    const periodsPerYear = getPeriodsPerYear(cadence);
    const periodReturn = annualReturn / 100 / periodsPerYear;
    const periodInflation = inflationRate / 100 / periodsPerYear;

    let balance = initialInvestment;
    let totalWithdrawals = 0;
    let totalPeriods = 0;
    let annualData = [];

    const labels = [];
    const data = [];

    let openingBalanceYear = initialInvestment;

    let yearCounter = 0;
    while (balance > 0 && yearCounter < 100) {
        let annualWithdrawal = 0;
        let startOfYearBalance = balance;

        for (let p = 0; p < periodsPerYear; p++) {
            if (balance <= 0) break;
            balance = balance * (1 + periodReturn) - withdrawalPerCadence;
            totalWithdrawals += withdrawalPerCadence;
            annualWithdrawal += withdrawalPerCadence;
            withdrawalPerCadence *= (1 + periodInflation);
            totalPeriods++;
        }

        yearCounter += 1;
        let endOfYearBalance = applyAnnualTaxOnCapitalGains(startOfYearBalance, balance, annualWithdrawal, taxRegime, yearCounter, { equityLtcgExemption: equityExemption, debtSlabRate: debtSlab });
        let capitalGains = endOfYearBalance - startOfYearBalance + annualWithdrawal;

        annualData.push({
            year: yearCounter,
            openingBalance: openingBalanceYear,
            withdrawals: annualWithdrawal,
            capitalGains: capitalGains,
            closingBalance: endOfYearBalance
        });
        openingBalanceYear = endOfYearBalance;
        balance = endOfYearBalance;

        labels.push(`Year ${yearCounter}`);
        data.push(balance > 0 ? balance.toFixed(0) : 0);

        if (balance <= 0) break;
    }

    const longevity = totalPeriods / periodsPerYear;
    const effectiveWithdrawalRate = (totalWithdrawals / initialInvestment) * 100;

    document.getElementById('swp-longevity').textContent = longevity.toFixed(1);
    document.getElementById('swp-total-withdrawals').textContent = formatCurrency(totalWithdrawals);
    document.getElementById('swp-remaining-value').textContent = formatCurrency(balance > 0 ? balance : 0);
    document.getElementById('swp-effective-rate').textContent = `${effectiveWithdrawalRate.toFixed(1)}%`;

    createGrowthChart(labels, data, 'swp-chart');

    // Annual Breakdown Table
    const breakdownSection = document.getElementById('swp-annual-breakdown');
    let tableHtml = '<h3 class="mt-4">Annual Breakdown</h3><table class="table table-bordered"><thead><tr><th>Year</th><th>Opening Balance</th><th>Withdrawals</th><th>Capital Gains</th><th>Closing Balance</th></tr></thead><tbody>';

    annualData.forEach(item => {
        tableHtml += `<tr>
            <td>${item.year}</td>
            <td>${formatCurrency(item.openingBalance)}</td>
            <td>${formatCurrency(item.withdrawals)}</td>
            <td>${formatCurrency(item.capitalGains)}</td>
            <td>${formatCurrency(item.closingBalance)}</td>
        </tr>`;
    });

    tableHtml += '</tbody></table>';
    breakdownSection.innerHTML = tableHtml;
});