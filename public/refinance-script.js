document.addEventListener("DOMContentLoaded", () => {
    let calculatorMode = 'simple', amortizationViewMode = 'years', isAmortizationTableVisible = false;
    const validLoanTerms = [5, 10, 15, 20, 25, 30, 35, 40];
    
    // Performance optimization - debounced updates
    let updateRAFId = null;
    let debounceTimerId = null;
    const DEBOUNCE_DELAY = 1500; // Wait 1.5 seconds after user stops interacting
    let isCalculating = false;
    
    function snapToNearestLoanTerm(value) {
        let nearest = validLoanTerms[0], minDiff = Math.abs(value - nearest);
        for (let term of validLoanTerms) { const diff = Math.abs(value - term); if (diff < minDiff) { minDiff = diff; nearest = term; } }
        return nearest;
    }
    
    const inputs = {
        loanType: document.getElementById("loan-type"),
        refinanceTypeRadios: document.querySelectorAll('input[name="refinance-type"]'),
        amortizationViewRadios: document.querySelectorAll('input[name="amortization-view"]'),
        homeValueSlider: document.getElementById("home-value-slider"), homeValueNumber: document.getElementById("home-value-number"),
        currentBalanceSlider: document.getElementById("current-balance-slider"), currentBalanceNumber: document.getElementById("current-balance-number"),
        currentRateSlider: document.getElementById("current-rate-slider"), currentRateNumber: document.getElementById("current-rate-number"),
        currentPaymentSlider: document.getElementById("current-payment-slider"), currentPaymentNumber: document.getElementById("current-payment-number"),
        remainingTermSlider: document.getElementById("remaining-term-slider"), remainingTermNumber: document.getElementById("remaining-term-number"),
        newRateSlider: document.getElementById("new-rate-slider"), newRateNumber: document.getElementById("new-rate-number"),
        newTermSlider: document.getElementById("new-term-slider"), newTermNumber: document.getElementById("new-term-number"),
        cashoutAmountSlider: document.getElementById("cashout-amount-slider"), cashoutAmountNumber: document.getElementById("cashout-amount-number"),
        closingCostsSlider: document.getElementById("closing-costs-slider"), closingCostsNumber: document.getElementById("closing-costs-number"),
        propertyTaxSlider: document.getElementById("property-tax-slider"), propertyTaxNumber: document.getElementById("property-tax-number"),
        insuranceSlider: document.getElementById("insurance-slider"), insuranceNumber: document.getElementById("insurance-number"),
        hoaSlider: document.getElementById("hoa-slider"), hoaNumber: document.getElementById("hoa-number"),
        extraPaymentSlider: document.getElementById("extra-payment-slider"), extraPaymentNumber: document.getElementById("extra-payment-number"),
        monthlyDebtSlider: document.getElementById("monthly-debt-slider"), monthlyDebtNumber: document.getElementById("monthly-debt-number"),
    };
    
    const results = {
        newPayment: document.getElementById("result-new-payment"),
        paymentLabel: document.getElementById("payment-label"),
        monthlySavings: document.getElementById("result-monthly-savings"),
        savingsMessageStandard: document.getElementById("savings-message-standard"),
        savingsMessageCashout: document.getElementById("savings-message-cashout"),
        cashoutEnticementAmount: document.getElementById("cashout-enticement-amount"),
        cashoutEnticementCost: document.getElementById("cashout-enticement-cost"),
        rateChangeDisplay: document.getElementById("rate-change-display"),
        termDisplay: document.getElementById("term-display"),
        maxCashoutRow: document.getElementById("max-cashout-row"),
        maxCashoutDisplay: document.getElementById("max-cashout-display"),
        breakEvenRow: document.getElementById("break-even-row"),
        loanAmount: document.getElementById("result-loan-amount"),
        effectiveRate: document.getElementById("result-effective-rate"),
        ltv: document.getElementById("result-ltv"),
        cashoutAmount: document.getElementById("result-cashout-amount"),
        totalClosing: document.getElementById("result-total-closing"),
        breakEven: document.getElementById("result-break-even"),
        pi: document.getElementById("result-pi"),
        tax: document.getElementById("result-tax"),
        insurance: document.getElementById("result-insurance"),
        hoa: document.getElementById("result-hoa"),
        pmiContainer: document.getElementById("result-pmi-container"),
        pmiLabel: document.getElementById("result-pmi-label"),
        pmi: document.getElementById("result-pmi"),
        pmiTooltipContent: document.getElementById("pmi-tooltip-content"),
        longTermSavingsCard: document.getElementById("long-term-savings-card"),
        interestSavings: document.getElementById("result-interest-savings"),
        payoffDate: document.getElementById("result-payoff-date"),
        totalInterest: document.getElementById("result-total-interest"),
        totalCost: document.getElementById("result-total-cost"),
        debtConsolidationCard: document.getElementById("debt-consolidation-card"),
        consolidationSavings: document.getElementById("result-consolidation-savings"),
        currentDebtPayments: document.getElementById("result-current-debt-payments"),
        addedToMortgage: document.getElementById("result-added-to-mortgage"),
        payoffDateConsolidation: document.getElementById("result-payoff-date-consolidation"),
        totalInterestConsolidation: document.getElementById("result-total-interest-consolidation"),
        extraPaymentResults: document.getElementById("extra-payment-results"),
        timeSaved: document.getElementById("result-time-saved"),
        extraInterestSaved: document.getElementById("result-extra-interest-saved"),
        payoffDateExtra: document.getElementById("result-payoff-date-extra"),
        netEffectiveRate: document.getElementById("result-net-effective-rate"),
    };
    
    const guidance = {
        homeValue: document.getElementById("home-value-guidance"),
        balance: document.getElementById("balance-guidance"),
        rate: document.getElementById("rate-guidance"),
        cashout: document.getElementById("cashout-guidance"),
    };
    
    const containers = {
        cashoutAmountGroup: document.getElementById("cashout-amount-group"),
        monthlyDebtGroup: document.getElementById("monthly-debt-group"),
        cashoutResultRow: document.getElementById("cashout-result-row"),
        streamlineOption: document.getElementById("streamline"),
        streamlineLabel: document.querySelector('label[for="streamline"]'),
        cashoutOption: document.getElementById("cashout"),
        cashoutLabel: document.querySelector('label[for="cashout"]'),
    };
    
    const loanTypeInfo = document.getElementById("loan-type-info"), refinanceTypeInfo = document.getElementById("refinance-type-info");
    const amortizationHead = document.getElementById("amortization-head"), amortizationBody = document.getElementById("amortization-body");
    const simpleModeBtn = document.getElementById("simple-mode-btn"), advancedModeBtn = document.getElementById("advanced-mode-btn");
    const calculatorContainer = document.querySelector(".calculator-container");
    
    const loanTypeConfig = {
        conventional: { name: "Conventional", requiresPmi: true, pmiThreshold: 0.2, pmiRate: 0.0055, description: "Standard mortgage. PMI required if LTV > 80%.", streamlineAvailable: false, cashoutAvailable: true, maxCashoutLTV: 0.80, getPmiTooltip: (ltv) => ltv <= 78 ? `LTV at ${ltv.toFixed(1)}%. PMI terminated.` : ltv <= 80 ? `LTV at ${ltv.toFixed(1)}%. Can request PMI removal.` : `LTV at ${ltv.toFixed(1)}%. PMI required until 78% LTV.` },
        fha: { name: "FHA", requiresPmi: true, pmiThreshold: 0.0, pmiRate: 0.0055, description: "FHA-insured loan. MIP required for life. Streamline available.", streamlineAvailable: true, cashoutAvailable: true, maxCashoutLTV: 0.80, getPmiTooltip: () => "MIP remains for life of loan." },
        va: { name: "VA", requiresPmi: false, pmiThreshold: 0, pmiRate: 0, description: "VA loan for veterans. No PMI. Cash-out up to 100% LTV.", streamlineAvailable: true, cashoutAvailable: true, maxCashoutLTV: 1.00, getPmiTooltip: () => "No PMI required for VA loans." },
        usda: { name: "USDA", requiresPmi: true, pmiThreshold: 0.0, pmiRate: 0.0035, description: "USDA Rural Development loan. No cash-out refinance available.", streamlineAvailable: true, cashoutAvailable: false, maxCashoutLTV: 0, getPmiTooltip: () => "USDA guarantee fee remains for life." }
    };
    
    const refinanceTypeDescriptions = { 'rate-term': "Rate & Term: Refinance to get a better rate or change your loan term.", 'streamline': "Streamline: Simplified refinance for existing FHA/VA/USDA loans.", 'cashout': "Cash-Out: Refinance for more than you owe and receive cash." };
    
    const formatCurrency = (val) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
    const formatPercent = (val, digits = 1) => `${Number(val).toFixed(digits)}%`;
    const formatMonths = (months) => { if (months <= 0) return "0 months"; if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`; const y = Math.floor(months / 12), m = months % 12; return m === 0 ? `${y} year${y !== 1 ? 's' : ''}` : `${y}y ${m}m`; };
    
    function setGuidance(element, message, type) {
        if (!element) return;
        element.className = 'slider-guidance';
        if (message) { element.textContent = message; element.classList.add(type || 'info'); }
    }
    
    function calculateMaxCashout(homeValue, currentBalance, loanType) {
        const cfg = loanTypeConfig[loanType];
        if (!cfg.cashoutAvailable || cfg.maxCashoutLTV === 0) return 0;
        const maxLoanAmount = homeValue * cfg.maxCashoutLTV;
        return Math.max(0, Math.floor((maxLoanAmount - currentBalance) / 1000) * 1000);
    }
    
    function updateCashoutSliderLimits(homeValue, currentBalance, loanType) {
        const maxCashout = calculateMaxCashout(homeValue, currentBalance, loanType);
        const newMax = Math.max(1000, maxCashout);
        if (inputs.cashoutAmountSlider && inputs.cashoutAmountNumber) {
            inputs.cashoutAmountSlider.max = newMax;
            inputs.cashoutAmountNumber.max = newMax;
            const currentVal = parseFloat(inputs.cashoutAmountNumber.value) || 0;
            if (currentVal > maxCashout && maxCashout > 0) {
                inputs.cashoutAmountSlider.value = maxCashout;
                inputs.cashoutAmountNumber.value = maxCashout;
            } else if (currentVal > 0 && maxCashout === 0) {
                inputs.cashoutAmountSlider.value = 0;
                inputs.cashoutAmountNumber.value = 0;
            }
        }
    }
    
    function getInputValues() {
        const loanType = inputs.loanType.value, cfg = loanTypeConfig[loanType];
        const refinanceTypeRadio = document.querySelector('input[name="refinance-type"]:checked');
        const refinanceType = refinanceTypeRadio ? refinanceTypeRadio.value : 'rate-term';
        
        // In simple mode, use 0 for advanced-only fields so hidden inputs don't affect calculations
        const isSimpleMode = calculatorMode === 'simple';
        
        return { loanType, cfg, refinanceType,
            homeValue: parseFloat(inputs.homeValueNumber.value) || 400000,
            currentBalance: parseFloat(inputs.currentBalanceNumber.value) || 300000,
            currentRate: parseFloat(inputs.currentRateNumber.value) || 7.5,
            currentPayment: parseFloat(inputs.currentPaymentNumber.value) || 2500,
            remainingTerm: parseFloat(inputs.remainingTermNumber.value) || 27,
            newRate: parseFloat(inputs.newRateNumber.value) || 6.0,
            newTerm: parseFloat(inputs.newTermNumber.value) || 30,
            cashoutAmount: refinanceType === 'cashout' ? (parseFloat(inputs.cashoutAmountNumber.value) || 0) : 0,
            // Advanced-only fields: use 0 in simple mode
            closingCosts: isSimpleMode ? 0 : (parseFloat(inputs.closingCostsNumber.value) || 3000),
            propertyTax: isSimpleMode ? 0 : (parseFloat(inputs.propertyTaxNumber.value) || 400),
            insurance: isSimpleMode ? 0 : (parseFloat(inputs.insuranceNumber.value) || 167),
            hoa: isSimpleMode ? 0 : (parseFloat(inputs.hoaNumber.value) || 0),
            extraPayment: isSimpleMode ? 0 : (parseFloat(inputs.extraPaymentNumber.value) || 0),
            monthlyDebt: parseFloat(inputs.monthlyDebtNumber.value) || 0
        };
    }
    
    function calculateMortgagePayment(principal, annualRate, termYears) {
        if (principal <= 0) return 0;
        const mr = annualRate / 100 / 12, n = termYears * 12;
        if (mr > 0) { const f = Math.pow(1 + mr, n); return (principal * mr * f) / (f - 1); }
        return principal / n;
    }
    
    function calculateTotalInterest(principal, annualRate, termYears) {
        return calculateMortgagePayment(principal, annualRate, termYears) * termYears * 12 - principal;
    }
    
    function calculateRemainingInterest(balance, annualRate, remainingYears) {
        const mr = annualRate / 100 / 12, n = remainingYears * 12;
        let totalInt = 0, bal = balance;
        const mp = calculateMortgagePayment(balance, annualRate, remainingYears);
        for (let i = 0; i < n && bal > 0; i++) { const int = bal * mr; totalInt += int; bal -= (mp - int); }
        return totalInt;
    }
    
    function simulateLoanWithExtraPayment(principal, annualRate, termYears, extraPayment) {
        const mr = annualRate / 100 / 12, basePayment = calculateMortgagePayment(principal, annualRate, termYears), totalPayment = basePayment + extraPayment;
        let balance = principal, totalInterest = 0, months = 0;
        while (balance > 0.01 && months < termYears * 24) { months++; const interest = balance * mr; totalInterest += interest; let prin = totalPayment - interest; if (prin > balance) prin = balance; balance -= prin; }
        return { months, totalInterest, totalPaid: totalInterest + principal };
    }
    
    function calculateNetEffectiveRate(interestRate, totalIntWith, totalIntNo) {
        if (totalIntNo > 0 && totalIntWith < totalIntNo) return interestRate * (totalIntWith / totalIntNo);
        return interestRate === 0 || totalIntNo === 0 ? 0 : interestRate;
    }
    
    function generateAmortizationSchedule(principal, annualRate, termYears, extraPayment, totalClosingCosts, monthlySavings, homeValue, loanType) {
        const mr = annualRate / 100 / 12, basePayment = calculateMortgagePayment(principal, annualRate, termYears), totalPaymentWithExtra = basePayment + extraPayment;
        const schedule = [];
        let balanceNoExtra = principal, balanceWithExtra = principal, cumSavings = 0, month = 0, breakEvenFound = false, pmiDropOffFound = false;
        const trackPmiDropOff = loanType === 'conventional';
        while (balanceNoExtra > 0.01 && month < termYears * 24) {
            month++;
            const startBalanceNoExtra = balanceNoExtra, startBalanceWithExtra = balanceWithExtra;
            const interestNoExtra = balanceNoExtra * mr; let principalNoExtra = basePayment - interestNoExtra; if (principalNoExtra > balanceNoExtra) principalNoExtra = balanceNoExtra; balanceNoExtra = Math.max(0, balanceNoExtra - principalNoExtra);
            let interestWithExtra = 0, principalWithExtra = 0;
            if (balanceWithExtra > 0.01) { interestWithExtra = balanceWithExtra * mr; principalWithExtra = totalPaymentWithExtra - interestWithExtra; if (principalWithExtra > balanceWithExtra) principalWithExtra = balanceWithExtra; balanceWithExtra = Math.max(0, balanceWithExtra - principalWithExtra); }
            if (monthlySavings > 0) cumSavings += monthlySavings;
            const isBreakEven = !breakEvenFound && monthlySavings > 0 && cumSavings >= totalClosingCosts; if (isBreakEven) breakEvenFound = true;
            const ltvNoExtra = (balanceNoExtra / homeValue) * 100;
            const isPmiDropOff = trackPmiDropOff && !pmiDropOffFound && ltvNoExtra <= 78; if (isPmiDropOff) pmiDropOffFound = true;
            schedule.push({ month, startBalanceNoExtra, principalNoExtra, interestNoExtra, endBalanceNoExtra: balanceNoExtra, ltvNoExtra, startBalanceWithExtra, principalWithExtra, interestWithExtra, endBalanceWithExtra: balanceWithExtra, ltvWithExtra: (balanceWithExtra / homeValue) * 100, extraPayment, cumulativeSavings: cumSavings, isBreakEven, isPmiDropOff });
        }
        return schedule;
    }
    
    function aggregateToYearly(monthlySchedule) {
        const yearly = [];
        for (let year = 1; year <= Math.ceil(monthlySchedule.length / 12); year++) {
            const start = (year - 1) * 12, end = Math.min(year * 12, monthlySchedule.length), months = monthlySchedule.slice(start, end);
            if (!months.length) break;
            const hasBreakEven = months.some(m => m.isBreakEven), beData = months.find(m => m.isBreakEven);
            const hasPmiDropOff = months.some(m => m.isPmiDropOff), pmiData = months.find(m => m.isPmiDropOff);
            const firstMonth = months[0], lastMonth = months[months.length - 1];
            yearly.push({ year, startBalanceNoExtra: firstMonth.startBalanceNoExtra, principalNoExtra: months.reduce((s, m) => s + m.principalNoExtra, 0), interestNoExtra: months.reduce((s, m) => s + m.interestNoExtra, 0), endBalanceNoExtra: lastMonth.endBalanceNoExtra, ltvNoExtra: lastMonth.ltvNoExtra, startBalanceWithExtra: firstMonth.startBalanceWithExtra, principalWithExtra: months.reduce((s, m) => s + m.principalWithExtra, 0), interestWithExtra: months.reduce((s, m) => s + m.interestWithExtra, 0), endBalanceWithExtra: lastMonth.endBalanceWithExtra, ltvWithExtra: lastMonth.ltvWithExtra, extraPayment: months[0].extraPayment * months.length, isBreakEven: hasBreakEven, breakEvenMonth: beData ? beData.month : null, isPmiDropOff: hasPmiDropOff, pmiDropOffMonth: pmiData ? pmiData.month : null });
        }
        return yearly;
    }
    
    function renderAmortizationTable(schedule, viewMode, extraPayment, loanType) {
        if (!amortizationHead || !amortizationBody) return;
        const isYearly = viewMode === 'years', data = isYearly ? aggregateToYearly(schedule) : schedule;
        const showExtraCols = extraPayment > 0, showPmiDropOff = loanType === 'conventional';
        let headerHtml = `<tr><th>${isYearly ? 'Year' : 'Month'}</th><th>Start Balance</th><th>Principal Paid</th><th>Interest Paid</th><th>End Balance</th><th>LTV${showExtraCols ? ' (No Extra)' : ''}</th>`;
        if (showExtraCols) headerHtml += `<th class="extra-payment-col">End Balance (w/ Extra)</th><th class="extra-payment-col">LTV (w/ Extra)</th>`;
        headerHtml += `</tr>`;
        amortizationHead.innerHTML = headerHtml;
        amortizationBody.innerHTML = data.map(row => {
            const period = isYearly ? row.year : row.month;
            let label = period, rowClass = '', tooltip = '';
            if (row.isBreakEven && row.isPmiDropOff) { label = isYearly ? `${period} (Break-Even @ Mo. ${row.breakEvenMonth}, PMI Drops @ Mo. ${row.pmiDropOffMonth})` : `${period} (Break-Even & PMI Drops)`; rowClass = 'break-even-row'; }
            else if (row.isBreakEven) { label = isYearly && row.breakEvenMonth ? `${period} (Break-Even @ Mo. ${row.breakEvenMonth})` : `${period} (Break-Even)`; rowClass = 'break-even-row'; }
            else if (row.isPmiDropOff && showPmiDropOff) { label = isYearly && row.pmiDropOffMonth ? `${period} (PMI Drops @ Mo. ${row.pmiDropOffMonth})` : `${period} (PMI Drops)`; rowClass = 'pmi-dropoff-row'; tooltip = 'LTV at ' + row.ltvNoExtra.toFixed(1) + '%. You can request PMI removal.'; }
            let rowHtml = `<tr class="${rowClass}" ${tooltip ? `title="${tooltip}"` : ''}><td>${label}</td><td>${formatCurrency(row.startBalanceNoExtra)}</td><td>${formatCurrency(row.principalNoExtra)}</td><td>${formatCurrency(row.interestNoExtra)}</td><td>${formatCurrency(row.endBalanceNoExtra)}</td><td>${formatPercent(row.ltvNoExtra, 1)}</td>`;
            if (showExtraCols) rowHtml += `<td class="extra-payment-col">${formatCurrency(row.endBalanceWithExtra)}</td><td class="extra-payment-col">${formatPercent(row.ltvWithExtra, 1)}</td>`;
            return rowHtml + `</tr>`;
        }).join('');
    }
    
    // Show loading indicator on results section
    function showLoadingIndicator() {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            isCalculating = true;
            resultsSection.classList.add('calculating');
            
            // Add loading spinner if it doesn't exist
            let loadingSpinner = resultsSection.querySelector('.loading-indicator');
            if (!loadingSpinner) {
                loadingSpinner = document.createElement('div');
                loadingSpinner.className = 'loading-indicator';
                loadingSpinner.innerHTML = `
                    <div class="spinner"></div>
                    <span>Calculating...</span>
                `;
                resultsSection.insertBefore(loadingSpinner, resultsSection.firstChild);
            }
            loadingSpinner.style.display = 'flex';
        }
    }
    
    // Hide loading indicator
    function hideLoadingIndicator() {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            isCalculating = false;
            resultsSection.classList.remove('calculating');
            
            const loadingSpinner = resultsSection.querySelector('.loading-indicator');
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
        }
    }
    
    // Debounced update function with loading indicator
    function scheduleFullUpdate() {
        // Cancel any pending debounced update
        if (debounceTimerId) {
            clearTimeout(debounceTimerId);
        }
        
        // Cancel any pending animation frame
        if (updateRAFId) {
            cancelAnimationFrame(updateRAFId);
        }
        
        // Show loading indicator
        showLoadingIndicator();
        
        // Schedule debounced update
        debounceTimerId = setTimeout(() => {
            updateRAFId = requestAnimationFrame(() => { 
                updateUI(); 
                
                // Hide loading indicator
                hideLoadingIndicator();
                
                // Update all slider visual fills after UI updates
                setTimeout(() => {
                    document.querySelectorAll('input[type="range"]').forEach(slider => {
                        if (slider && !slider.disabled) {
                            updateRangeFill(slider);
                        }
                    });
                }, 50);
                
                updateRAFId = null; 
            });
            debounceTimerId = null;
        }, DEBOUNCE_DELAY);
    }
    
    function updateUI() {
        const v = getInputValues();
        updateCashoutSliderLimits(v.homeValue, v.currentBalance, v.loanType);
        
        let newLoanAmount = v.currentBalance + (v.refinanceType === 'cashout' ? v.cashoutAmount : 0);
        const ltv = (newLoanAmount / v.homeValue) * 100;
        const totalClosingCosts = v.closingCosts;
        const newPI = calculateMortgagePayment(newLoanAmount, v.newRate, v.newTerm);
        let pmi = 0;
        if (v.cfg.requiresPmi && ltv > (100 - v.cfg.pmiThreshold * 100)) pmi = (newLoanAmount * v.cfg.pmiRate) / 12;
        const newPITI = newPI + v.propertyTax + v.insurance + v.hoa + pmi;
        const monthlySavings = v.currentPayment - newPITI;
        let breakEvenMonths = monthlySavings > 0 ? Math.ceil(totalClosingCosts / monthlySavings) : 0;
        const totalIntNoExtra = calculateTotalInterest(newLoanAmount, v.newRate, v.newTerm);
        const remIntOld = calculateRemainingInterest(v.currentBalance, v.currentRate, v.remainingTerm);
        const intSavings = remIntOld - totalIntNoExtra - totalClosingCosts;
        const loanWithExtra = simulateLoanWithExtraPayment(newLoanAmount, v.newRate, v.newTerm, v.extraPayment);
        const loanNoExtra = simulateLoanWithExtraPayment(newLoanAmount, v.newRate, v.newTerm, 0);
        const monthsSaved = loanNoExtra.months - loanWithExtra.months;
        const intSavedExtra = loanNoExtra.totalInterest - loanWithExtra.totalInterest;
        const netEffRate = calculateNetEffectiveRate(v.newRate, loanWithExtra.totalInterest, loanNoExtra.totalInterest);
        const payoffDate = new Date(); payoffDate.setMonth(payoffDate.getMonth() + loanNoExtra.months);
        const payoffDateExtra = new Date(); payoffDateExtra.setMonth(payoffDateExtra.getMonth() + loanWithExtra.months);
        const addedToMortgagePayment = v.refinanceType === 'cashout' ? calculateMortgagePayment(v.cashoutAmount, v.newRate, v.newTerm) : 0;
        const consolidationSavings = v.monthlyDebt - addedToMortgagePayment;
        
        results.newPayment.textContent = `${formatCurrency(newPITI)}/mo`;
        if (results.rateChangeDisplay) results.rateChangeDisplay.textContent = `${formatPercent(v.currentRate, 2)} → ${formatPercent(v.newRate, 2)}`;
        if (results.termDisplay) results.termDisplay.textContent = `${v.newTerm} years`;
        
        const maxCashout = calculateMaxCashout(v.homeValue, v.currentBalance, v.loanType);
        const isCashoutMode = v.refinanceType === 'cashout';
        if (results.maxCashoutRow) results.maxCashoutRow.style.display = isCashoutMode ? 'flex' : 'none';
        if (results.maxCashoutDisplay) results.maxCashoutDisplay.textContent = maxCashout > 0 ? formatCurrency(maxCashout) : '$0';
        
        if (isCashoutMode && v.cashoutAmount > 0) {
            if (results.savingsMessageStandard) results.savingsMessageStandard.style.display = 'none';
            if (results.savingsMessageCashout) results.savingsMessageCashout.style.display = 'flex';
            results.cashoutEnticementAmount.textContent = formatCurrency(v.cashoutAmount);
            results.cashoutEnticementCost.textContent = `for just ${formatCurrency(Math.abs(monthlySavings))}/mo`;
        } else {
            if (results.savingsMessageStandard) results.savingsMessageStandard.style.display = 'flex';
            if (results.savingsMessageCashout) results.savingsMessageCashout.style.display = 'none';
            results.monthlySavings.textContent = monthlySavings >= 0 ? `+${formatCurrency(monthlySavings)}/mo` : `${formatCurrency(monthlySavings)}/mo`;
            results.monthlySavings.className = `result-value ${monthlySavings >= 0 ? 'positive' : 'negative'}`;
        }
        
        results.loanAmount.textContent = formatCurrency(newLoanAmount);
        results.effectiveRate.textContent = formatPercent(v.newRate, 3);
        results.ltv.textContent = formatPercent(ltv, 1);
        if (results.cashoutAmount) results.cashoutAmount.textContent = formatCurrency(v.cashoutAmount);
        results.totalClosing.textContent = formatCurrency(totalClosingCosts);
        
        const showBreakEven = monthlySavings > 0 && breakEvenMonths > 0 && breakEvenMonths <= 240;
        if (results.breakEvenRow) results.breakEvenRow.style.display = showBreakEven ? 'flex' : 'none';
        if (showBreakEven) results.breakEven.textContent = formatMonths(breakEvenMonths);
        
        // Guidance messages
        if (v.currentBalance > v.homeValue) setGuidance(guidance.balance, '⚠️ Loan exceeds home value (underwater). Options may be limited.', 'warning');
        else if (v.currentBalance > v.homeValue * 0.95) setGuidance(guidance.balance, 'ℹ️ High LTV may limit options or require PMI.', 'info');
        else setGuidance(guidance.balance, '', '');
        
        // Rate guidance - only show when getting a better rate
        if (v.newRate < v.currentRate) {
            const rateSavings = v.currentRate - v.newRate;
            if (rateSavings >= 0.5) setGuidance(guidance.rate, `✓ Great! You're saving ${formatPercent(rateSavings, 2)} on your rate.`, 'success');
            else setGuidance(guidance.rate, '', '');
        } else {
            setGuidance(guidance.rate, '', '');
        }
        
        if (isCashoutMode) {
            if (maxCashout <= 0) setGuidance(guidance.cashout, `⚠️ ${v.cfg.name} loans don't allow cash-out with your current equity.`, 'error');
            else if (v.cashoutAmount > maxCashout) setGuidance(guidance.cashout, `⚠️ Max is ${formatCurrency(maxCashout)} (${Math.round(v.cfg.maxCashoutLTV * 100)}% LTV limit).`, 'warning');
            else if (v.cashoutAmount > 0) setGuidance(guidance.cashout, `✓ ${formatCurrency(maxCashout - v.cashoutAmount)} more available if needed.`, 'success');
            else setGuidance(guidance.cashout, `ℹ️ ${v.cfg.name}: up to ${Math.round(v.cfg.maxCashoutLTV * 100)}% LTV for cash-out.`, 'info');
        } else setGuidance(guidance.cashout, '', '');
        
        results.pi.textContent = formatCurrency(newPI);
        results.tax.textContent = formatCurrency(v.propertyTax);
        results.insurance.textContent = formatCurrency(v.insurance);
        results.hoa.textContent = formatCurrency(v.hoa);
        results.pmi.textContent = formatCurrency(pmi);
        results.pmiLabel.textContent = v.loanType === 'fha' ? 'MIP' : v.loanType === 'usda' ? 'Guarantee Fee' : 'PMI';
        if (results.pmiTooltipContent) results.pmiTooltipContent.textContent = v.cfg.getPmiTooltip(ltv);
        pmi > 0 ? results.pmiContainer.classList.remove('hidden') : results.pmiContainer.classList.add('hidden');
        
        if (v.refinanceType === 'cashout') {
            const showDebtConsolidation = consolidationSavings >= 0 && v.monthlyDebt > 0;
            if (results.longTermSavingsCard) results.longTermSavingsCard.style.display = 'none';
            if (results.debtConsolidationCard) results.debtConsolidationCard.style.display = showDebtConsolidation ? 'block' : 'none';
            if (showDebtConsolidation) {
                results.consolidationSavings.textContent = `+${formatCurrency(consolidationSavings)}/mo`;
                results.consolidationSavings.className = 'positive';
                results.currentDebtPayments.textContent = `${formatCurrency(v.monthlyDebt)}/mo`;
                results.addedToMortgage.textContent = `${formatCurrency(addedToMortgagePayment)}/mo`;
                results.payoffDateConsolidation.textContent = `${payoffDate.getMonth() + 1}/${payoffDate.getDate()}/${payoffDate.getFullYear()}`;
                results.totalInterestConsolidation.textContent = formatCurrency(totalIntNoExtra);
            }
        } else {
            if (results.longTermSavingsCard) results.longTermSavingsCard.style.display = 'block';
            if (results.debtConsolidationCard) results.debtConsolidationCard.style.display = 'none';
            results.interestSavings.textContent = intSavings >= 0 ? `+${formatCurrency(intSavings)}` : formatCurrency(intSavings);
            results.interestSavings.className = intSavings >= 0 ? 'positive' : 'negative';
            results.payoffDate.textContent = `${payoffDate.getMonth() + 1}/${payoffDate.getDate()}/${payoffDate.getFullYear()}`;
            results.totalInterest.textContent = formatCurrency(totalIntNoExtra);
            results.totalCost.textContent = formatCurrency(newLoanAmount + totalIntNoExtra + totalClosingCosts);
        }
        
        if (v.extraPayment > 0 && results.extraPaymentResults) {
            results.extraPaymentResults.style.display = 'block';
            results.timeSaved.textContent = formatMonths(monthsSaved);
            results.extraInterestSaved.textContent = intSavedExtra >= 0 ? `+${formatCurrency(intSavedExtra)}` : formatCurrency(intSavedExtra);
            results.extraInterestSaved.className = intSavedExtra >= 0 ? 'positive' : 'negative';
            results.payoffDateExtra.textContent = `${payoffDateExtra.getMonth() + 1}/${payoffDateExtra.getDate()}/${payoffDateExtra.getFullYear()}`;
            results.netEffectiveRate.textContent = formatPercent(netEffRate, 3);
        } else if (results.extraPaymentResults) results.extraPaymentResults.style.display = 'none';
        
        if (loanTypeInfo) loanTypeInfo.textContent = v.cfg.description;
        if (refinanceTypeInfo) refinanceTypeInfo.textContent = refinanceTypeDescriptions[v.refinanceType];
        
        if (calculatorMode === 'advanced' && isAmortizationTableVisible) {
            const schedule = generateAmortizationSchedule(newLoanAmount, v.newRate, v.newTerm, v.extraPayment, totalClosingCosts, monthlySavings, v.homeValue, v.loanType);
            renderAmortizationTable(schedule, amortizationViewMode, v.extraPayment, v.loanType);
        }
    }
    
    function updateRefinanceTypeUI() {
        const v = getInputValues();
        const isCashout = v.refinanceType === 'cashout';
        containers.cashoutAmountGroup.style.display = isCashout ? 'block' : 'none';
        containers.monthlyDebtGroup.style.display = isCashout ? 'block' : 'none';
        containers.cashoutResultRow.style.display = isCashout ? 'flex' : 'none';
        if (containers.streamlineOption && containers.streamlineLabel) {
            if (v.cfg.streamlineAvailable) { containers.streamlineOption.style.display = ''; containers.streamlineLabel.style.display = ''; }
            else { containers.streamlineOption.style.display = 'none'; containers.streamlineLabel.style.display = 'none'; if (v.refinanceType === 'streamline') document.getElementById('rate-term').checked = true; }
        }
        if (containers.cashoutOption && containers.cashoutLabel) {
            if (v.cfg.cashoutAvailable) { containers.cashoutOption.style.display = ''; containers.cashoutLabel.style.display = ''; }
            else { containers.cashoutOption.style.display = 'none'; containers.cashoutLabel.style.display = 'none'; if (v.refinanceType === 'cashout') document.getElementById('rate-term').checked = true; }
        }
    }
    
    function setCalculatorMode(mode) {
        calculatorMode = mode;
        if (mode === 'simple') {
            calculatorContainer.classList.add('simple-mode');
            simpleModeBtn.classList.add('active');
            advancedModeBtn.classList.remove('active');
            // Update payment label for simple mode (P&I only)
            if (results.paymentLabel) results.paymentLabel.textContent = 'New Monthly Payment (P&I)';
        } else {
            calculatorContainer.classList.remove('simple-mode');
            simpleModeBtn.classList.remove('active');
            advancedModeBtn.classList.add('active');
            // Update payment label for advanced mode (full PITI)
            if (results.paymentLabel) results.paymentLabel.textContent = 'New Monthly Payment (PITI)';
        }
        scheduleFullUpdate();
    }
    
    function syncSliderAndNumber(slider, number) {
        if (!slider || !number) return;
        slider.addEventListener('input', () => { number.value = slider.value; updateRangeFill(slider); scheduleFullUpdate(); });
        number.addEventListener('input', () => { slider.value = number.value; updateRangeFill(slider); scheduleFullUpdate(); });
        number.addEventListener('change', () => { let val = parseFloat(number.value); val = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), val)); number.value = val; slider.value = val; updateRangeFill(slider); scheduleFullUpdate(); });
    }
    
    function syncLoanTermSlider(slider, number) {
        if (!slider || !number) return;
        slider.addEventListener('input', () => { const snapped = snapToNearestLoanTerm(parseFloat(slider.value)); slider.value = snapped; number.value = snapped; updateRangeFill(slider); scheduleFullUpdate(); });
        number.addEventListener('change', () => { const snapped = snapToNearestLoanTerm(parseFloat(number.value)); number.value = snapped; slider.value = snapped; updateRangeFill(slider); scheduleFullUpdate(); });
    }
    
    function updateRangeFill(el) {
        if (!el || el.type !== 'range') return;
        const min = parseFloat(el.min) || 0;
        const max = parseFloat(el.max) || 100;
        const val = parseFloat(el.value) || min;
        let pct = ((val - min) * 100) / (max - min);
        pct = Math.max(0, Math.min(100, pct)); // clamp
        el.style.background = `linear-gradient(to right, var(--text-color) 0%, var(--text-color) ${pct}%, var(--input-bg-color) ${pct}%)`;
    }
    
    function setupEventListeners() {
        simpleModeBtn.addEventListener('click', () => setCalculatorMode('simple'));
        advancedModeBtn.addEventListener('click', () => setCalculatorMode('advanced'));
        inputs.loanType.addEventListener('change', () => { updateRefinanceTypeUI(); scheduleFullUpdate(); });
        inputs.refinanceTypeRadios.forEach(r => r.addEventListener('change', () => { updateRefinanceTypeUI(); scheduleFullUpdate(); }));
        inputs.amortizationViewRadios.forEach(r => r.addEventListener('change', () => { amortizationViewMode = r.value; scheduleFullUpdate(); }));
        syncSliderAndNumber(inputs.homeValueSlider, inputs.homeValueNumber);
        syncSliderAndNumber(inputs.currentBalanceSlider, inputs.currentBalanceNumber);
        syncSliderAndNumber(inputs.currentRateSlider, inputs.currentRateNumber);
        syncSliderAndNumber(inputs.currentPaymentSlider, inputs.currentPaymentNumber);
        syncSliderAndNumber(inputs.remainingTermSlider, inputs.remainingTermNumber);
        syncSliderAndNumber(inputs.newRateSlider, inputs.newRateNumber);
        syncLoanTermSlider(inputs.newTermSlider, inputs.newTermNumber);
        syncSliderAndNumber(inputs.cashoutAmountSlider, inputs.cashoutAmountNumber);
        syncSliderAndNumber(inputs.closingCostsSlider, inputs.closingCostsNumber);
        syncSliderAndNumber(inputs.propertyTaxSlider, inputs.propertyTaxNumber);
        syncSliderAndNumber(inputs.insuranceSlider, inputs.insuranceNumber);
        syncSliderAndNumber(inputs.hoaSlider, inputs.hoaNumber);
        syncSliderAndNumber(inputs.extraPaymentSlider, inputs.extraPaymentNumber);
        syncSliderAndNumber(inputs.monthlyDebtSlider, inputs.monthlyDebtNumber);
        const tableContainer = document.querySelector('.amortization-section .table-container');
        const tableFade = document.querySelector('.table-fade');
        const expandBtn = document.querySelector('.expand-table-btn');
        const hideBtn = document.getElementById('hide-table');
        if (expandBtn && tableFade && tableContainer) expandBtn.addEventListener('click', () => { tableFade.classList.add('hidden'); tableContainer.classList.add('expanded'); isAmortizationTableVisible = true; scheduleFullUpdate(); });
        if (hideBtn && tableFade && tableContainer) hideBtn.addEventListener('click', () => { tableFade.classList.remove('hidden'); tableContainer.classList.remove('expanded'); });
    }
    
    function initialize() { 
        setCalculatorMode('simple'); 
        setupEventListeners(); 
        // Initialize all sliders after a brief delay to ensure DOM is ready
        setTimeout(() => {
            document.querySelectorAll('input[type="range"]').forEach(updateRangeFill);
        }, 50);
        updateRefinanceTypeUI(); 
        updateUI(); 
    }
    initialize();
    
    // Update fills on resize with debounce
    let resizeTimer;
    window.addEventListener('resize', () => { 
        clearTimeout(resizeTimer); 
        resizeTimer = setTimeout(() => {
            document.querySelectorAll('input[type="range"]').forEach(updateRangeFill);
        }, 150); 
    });
    
    // Also update on input events (delegated listener for all sliders)
    document.addEventListener('input', (e) => {
        if (e.target.matches('input[type="range"]')) {
            updateRangeFill(e.target);
        }
    });
});
