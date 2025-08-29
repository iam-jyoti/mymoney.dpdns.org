let chartInstance;
function createGrowthChart(labels, data, chartId) {
    const ctx = document.getElementById(chartId).getContext('2d');
    if (chartInstance) {
        chartInstance.destroy();
    }
    const isDark = document.body.classList.contains('dark-mode');
    const lineColor = isDark ? '#60a5fa' : '#2563eb';
    const fillColor = isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? '#e9ecef' : '#495057';
    const chartBgColor = isDark ? '#343a40' : '#ffffff';

    const solidBackgroundPlugin = {
        id: 'solidBackground',
        beforeDraw(chart) {
            const {ctx} = chart;
            const width = chart.width;
            const height = chart.height;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = chartBgColor;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
    };
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: lineColor,
                backgroundColor: fillColor,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatIndianNumber(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        callback: function(value, index, values) {
                            return formatIndianNumber(value);
                        }
                    }
                }
            }
        },
        plugins: [solidBackgroundPlugin]
    });
}
