function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(num) {
    if (num === null || num === undefined) return '';
    return new Intl.NumberFormat('en-US').format(num);
}

function parseNumber(str) {
    if (typeof str !== 'string') return str;
    return parseFloat(str.replace(/,/g, ''));
}

// Legacy function names for compatibility
function formatIndianNumber(num) {
    return formatNumber(num);
}

function parseIndianNumber(str) {
    return parseNumber(str);
}