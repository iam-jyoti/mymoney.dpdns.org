document.getElementById('fire-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const currentAge = parseFloat(document.getElementById('fire-current-age').value);
    const annualIncome = parseIndianNumber(document.getElementById('fire-annual-income').value);
    const annualExpenses = parseIndianNumber(document.getElementById('fire-annual-expenses').value);
    const currentSavings = parseIndianNumber(document.getElementById('fire-current-savings').value);
    const expectedReturn = parseFloat(document.getElementById('fire-expected-return').value) / 100;
    const withdrawalRate = parseFloat(document.getElementById('fire-withdrawal-rate').value) / 100;

    const calculateFireNumber = (expenses) => expenses / withdrawalRate;

    const fireNumber = calculateFireNumber(annualExpenses);
    const annualSavings = annualIncome - annualExpenses;
    const savingsRate = (annualSavings / annualIncome) * 100;

    let yearsToFire = 0;
    let futureValue = currentSavings;

    const labels = [];
    const data = [];

    if (annualSavings > 0) {
        yearsToFire = Math.log((fireNumber * expectedReturn + annualSavings) / (currentSavings * expectedReturn + annualSavings)) / Math.log(1 + expectedReturn);
        for (let i = 1; i <= Math.ceil(yearsToFire); i++) {
            futureValue = futureValue * (1 + expectedReturn) + annualSavings;
            labels.push(`Year ${i}`);
            data.push(futureValue.toFixed(0));
        }
    }

    const fireAge = yearsToFire > 0 ? currentAge + yearsToFire : currentAge;

    document.getElementById('fire-years-to-fire').textContent = yearsToFire > 0 ? yearsToFire.toFixed(1) : 'Already FIREd!';
    document.getElementById('fire-number').textContent = formatCurrency(fireNumber);
    document.getElementById('fire-savings-rate').textContent = `${savingsRate.toFixed(1)}%`;
    document.getElementById('fire-age').textContent = yearsToFire > 0 ? fireAge.toFixed(0) : 'Now';

    createGrowthChart(labels, data, 'fire-chart');

    // FIRE Scenarios
    const fireScenariosSection = document.getElementById('fire-scenarios');
    let scenariosHtml = '<h3 class="mt-4">FIRE Scenarios</h3><table class="table table-bordered"><thead><tr><th>Scenario</th><th>Annual Expenses</th><th>FIRE Number</th></tr></thead><tbody>';

    const scenarios = [
        { name: 'Lean FIRE', multiplier: 0.8 },
        { name: 'Normal FIRE', multiplier: 1.0 },
        { name: 'Fat FIRE', multiplier: 1.2 }
    ];

    scenarios.forEach(scenario => {
        const scenarioExpenses = annualExpenses * scenario.multiplier;
        const scenarioFireNumber = calculateFireNumber(scenarioExpenses);
        scenariosHtml += `<tr>
            <td>${scenario.name}</td>
            <td>${formatCurrency(scenarioExpenses)}</td>
            <td>${formatCurrency(scenarioFireNumber)}</td>
        </tr>`;
    });

    scenariosHtml += '</tbody></table>';
    fireScenariosSection.innerHTML = scenariosHtml;
});