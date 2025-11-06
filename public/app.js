// ============================================================================
// MORTGAGE CALCULATOR - COMPREHENSIVE COMMENTED VERSION
// ============================================================================
// This calculator supports both simple and advanced modes, multiple loan types,
// and calculates affordability, payments, amortization schedules, and more.
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================================================
  // STATE VARIABLES - Track the current mode and settings of the calculator
  // ==========================================================================
  
  // Controls whether we use default DTI, custom DTI, or target payment
  let currentCalculationMode = 'default'; 
  
  // Controls whether amortization table shows yearly or monthly data
  let amortizationViewMode = 'years';
  
  // Controls whether calculator is in 'simple' or 'advanced' mode
  let calculatorMode = 'simple';
  
  // In simple mode: 'home-price' (user enters price) or 'affordability' (calculate max price)
  let simpleCalcMode = 'home-price';

  // Valid loan term options in years (used for snapping slider values)
  const validLoanTerms = [5, 10, 15, 20, 25, 30, 35, 40];
  
  // ==========================================================================
  // HELPER FUNCTION: Snap loan term to nearest valid value
  // ==========================================================================
  // When user drags the loan term slider, we snap it to one of the standard terms
  function snapToNearestLoanTerm(value) {
    let nearest = validLoanTerms[0];
    let minDiff = Math.abs(value - nearest);
    
    // Loop through valid terms and find the closest one
    for (let term of validLoanTerms) {
      const diff = Math.abs(value - term);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = term;
      }
    }
    return nearest;
  }

  // ==========================================================================
  // DOM REFERENCES - Store references to all input elements
  // ==========================================================================
  // This object holds references to every input field, slider, and control
  // in the calculator interface
  const inputs = {
    // Loan type dropdown (Conventional, FHA, VA, USDA)
    loanType: document.getElementById("loan-type"),
    
    // Radio buttons for calculation mode override (DTI or Payment target)
    calculationModeOverrideRadios: document.querySelectorAll('input[name="calculation-mode-override"]'),
    clearModeButton: document.getElementById("clear-mode-button"),
    
    // Radio buttons for amortization table view (years vs months)
    amortizationViewRadios: document.querySelectorAll('input[name="amortization-view"]'),
    
    // Radio buttons for simple calculator mode (home-price vs affordability)
    simpleCalcModeRadios: document.querySelectorAll('input[name="simple-calc-mode"]'), 

    // Simple mode inputs (shown only in simple mode)
    simpleLoanAmountSlider: document.getElementById("simple-loan-amount-slider"),
    simpleLoanAmountNumber: document.getElementById("simple-loan-amount-number"),
    simpleAnnualIncomeSlider: document.getElementById("simple-annual-income-slider"),
    simpleAnnualIncomeNumber: document.getElementById("simple-annual-income-number"),
    simpleMonthlyDebtSlider: document.getElementById("simple-monthly-debt-slider"),
    simpleMonthlyDebtNumber: document.getElementById("simple-monthly-debt-number"),

    // Income and debt inputs (for affordability calculations)
    // annualIncomeSlider: document.getElementById("annual-income-slider"),
    // annualIncomeNumber: document.getElementById("annual-income-number"),
    // monthlyDebtSlider: document.getElementById("monthly-debt-slider"),
    // monthlyDebtNumber: document.getElementById("monthly-debt-number"),
    
    // Target DTI input (custom debt-to-income ratio)
    targetDTISlider: document.getElementById("target-dti-slider"),
    targetDTINumber: document.getElementById("target-dti-number"),
    
    // Target monthly payment input (specify exact payment amount)
    targetMonthlyPaymentSlider: document.getElementById("target-monthly-payment-slider"),
    targetMonthlyPaymentNumber: document.getElementById("target-monthly-payment-number"),
    
    // Loan amount override (manually set loan amount instead of calculating)
    loanAmountOverrideSlider: document.getElementById("loan-amount-override-slider"),
    loanAmountOverrideNumber: document.getElementById("loan-amount-override-number"),
    
    // Down payment input
    downPaymentSlider: document.getElementById("down-payment-slider"),
    downPaymentNumber: document.getElementById("down-payment-number"),
    
    // Interest rate input
    interestRateSlider: document.getElementById("interest-rate-slider"), 
    interestRateNumber: document.getElementById("interest-rate-number"),
    
    // Seller credits (percentage of home price seller pays toward closing)
    sellerCreditsPercentSlider: document.getElementById("seller-credits-percent-slider"),
    sellerCreditsPercentNumber: document.getElementById("seller-credits-percent-number"),
    sellerCreditsDollarValue: document.getElementById("seller-credits-dollar-value"),
    sellerCreditsTooltipContent: document.getElementById("seller-credits-tooltip-content"),
    
    // Loan term (length of mortgage in years)
    loanTermSlider: document.getElementById("loan-term-slider"),
    loanTermNumber: document.getElementById("loan-term-number"),
    
    // Monthly costs
    propertyTaxSlider: document.getElementById("property-tax-slider"),
    propertyTaxNumber: document.getElementById("property-tax-number"),
    insuranceSlider: document.getElementById("insurance-slider"),
    insuranceNumber: document.getElementById("insurance-number"),
    hoaSlider: document.getElementById("hoa-slider"),
    hoaNumber: document.getElementById("hoa-number"),
    
    // Additional principal payment (extra payment toward principal each month)
    additionalPaymentSlider: document.getElementById("additional-payment-slider"),
    additionalPaymentNumber: document.getElementById("additional-payment-number"),
  };

  // ==========================================================================
  // DOM REFERENCES - Store references to all result/output elements
  // ==========================================================================
  // These elements display the calculated results to the user
  const results = {
    // Primary results
    homePrice: document.getElementById("result-home-price"),
    loanAmount: document.getElementById("result-loan-amount"),
    downPaymentSimple: document.getElementById("result-down-payment-simple"),
    effectiveInterestRate: document.getElementById("result-effective-interest-rate"),
    ltv: document.getElementById("result-ltv"), // Loan-to-Value ratio
    monthlyPayment: document.getElementById("result-monthly-payment"),
    
    // Simple mode payment breakdown
    piSimple: document.getElementById("result-pi-simple"), // Principal & Interest
    taxSimple: document.getElementById("result-tax-simple"),
    insuranceSimple: document.getElementById("result-insurance-simple"),
    pmiContainerSimple: document.getElementById("result-pmi-container-simple"),
    pmiLabelSimple: document.getElementById("result-pmi-label-simple"),
    pmiSimple: document.getElementById("result-pmi-simple"),
    
    // Loan summary
    totalPaid: document.getElementById("result-total-paid"),
    totalInterest: document.getElementById("result-total-interest"),
    payoffDateSimple: document.getElementById("result-payoff-date-simple"),
    
    // Closing costs section
    downPaymentSummary: document.getElementById("result-down-payment-summary"),
    sellerCreditsApplied: document.getElementById("result-seller-credits-applied"),
    estimatedCashToClose: document.getElementById("result-estimated-cash-to-close"),
    
    // Advanced mode payment breakdown
    pi: document.getElementById("result-pi"),
    tax: document.getElementById("result-tax"),
    insurance: document.getElementById("result-insurance"),
    hoa: document.getElementById("result-hoa"), // HOA fees
    pmiContainer: document.getElementById("result-pmi-container"),
    pmiLabel: document.getElementById("result-pmi-label"),
    pmiTooltipContent: document.getElementById("pmi-mip-tooltip-content"),
    pmi: document.getElementById("result-pmi"),
    
    // DTI (Debt-to-Income) ratios
    housingDTI: document.getElementById("result-housing-dti"), // Housing costs only
    totalDTI: document.getElementById("result-total-dti"), // Housing + other debts
    
    // Extra payment results (when additional payment is made)
    timeSaved: document.getElementById("result-time-saved"),
    interestSaved: document.getElementById("result-interest-saved"),
    payoffDate: document.getElementById("result-payoff-date"),
    pmiDropoffExtraContainer: document.getElementById("result-pmi-dropoff-extra-container"),
    pmiDropoffExtraDate: document.getElementById("result-pmi-dropoff-extra-date"),
    effectiveRate: document.getElementById("result-effective-rate"), 
  };

  // ==========================================================================
  // DOM REFERENCES - Container elements that can be shown/hidden
  // ==========================================================================
  const containers = {
    modeSelector: document.querySelector('.mode-selector-container'),
    targetDtiInputGroup: document.getElementById("target-dti-input-group"),
    targetMonthlyPaymentInputGroup: document.getElementById("target-monthly-payment-input-group"),
    targetPaymentInputSection: document.getElementById("target-payment-input-section"),
    extraPaymentResults: document.getElementById("extra-payment-results"),
  };

  // ==========================================================================
  // DOM REFERENCES - Amortization table elements
  // ==========================================================================
  const amortizationHead = document.getElementById("amortization-head");
  const amortizationBody = document.getElementById("amortization-body");
  
  // Information and warning displays
  const loanTypeInfo = document.getElementById("loan-type-info");
  const downPaymentWarning = document.getElementById("down-payment-warning");

  // ==========================================================================
  // DOM REFERENCES - Mobile-specific elements
  // ==========================================================================
  // Mobile version has a collapsible bottom bar with results
  const mobileBottomBar = document.getElementById("mobile-bottom-bar");
  const mobileBarToggle = document.getElementById("mobile-bar-toggle");
  
  // Mobile result displays (duplicates of desktop results)
  const mobileResults = {
    homePrice: document.getElementById("mobile-home-price"),
    monthlyPayment: document.getElementById("mobile-monthly-payment"),
    resultHomePrice: document.getElementById("mobile-result-home-price"),
    resultLoanAmount: document.getElementById("mobile-result-loan-amount"),
    resultDownPayment: document.getElementById("mobile-result-down-payment"),
    resultLtv: document.getElementById("mobile-result-ltv"),
    resultMonthlyPaymentFull: document.getElementById("mobile-result-monthly-payment-full"),
    resultPi: document.getElementById("mobile-result-pi"),
    resultTax: document.getElementById("mobile-result-tax"),
    resultInsurance: document.getElementById("mobile-result-insurance"),
    resultHoa: document.getElementById("mobile-result-hoa"),
    pmiContainer: document.getElementById("mobile-pmi-container"),
    pmiLabel: document.getElementById("mobile-pmi-label"),
    resultPmi: document.getElementById("mobile-result-pmi"),
    resultTotalPaid: document.getElementById("mobile-result-total-paid"),
    resultTotalInterest: document.getElementById("mobile-result-total-interest"),
    resultPayoffDate: document.getElementById("mobile-result-payoff-date"),
    resultHousingDti: document.getElementById("mobile-result-housing-dti"),
    resultTotalDti: document.getElementById("mobile-result-total-dti")
  };
  
  // Mobile amortization table
  const mobileAmortizationHead = document.getElementById("mobile-amortization-head");
  const mobileAmortizationBody = document.getElementById("mobile-amortization-body");

  // ==========================================================================
  // EVENT LISTENER: Mobile bottom bar toggle
  // ==========================================================================
  // Allows user to expand/collapse the results bar on mobile
  mobileBarToggle.addEventListener('click', () => {
    mobileBottomBar.classList.toggle('expanded');
  });

  // ==========================================================================
  // DOM REFERENCES - Mode toggle buttons
  // ==========================================================================
  const simpleModeBtn = document.getElementById("simple-mode-btn");
  const advancedModeBtn = document.getElementById("advanced-mode-btn");
  const calculatorContainer = document.querySelector(".calculator-container");
  const simpleLoanAmountGroup = document.getElementById("simple-loan-amount-group");
  const simpleCalcModeToggle = document.getElementById("simple-calc-mode-toggle"); 

  // ==========================================================================
  // LOAN TYPE CONFIGURATION
  // ==========================================================================
  // This object defines the rules and requirements for each loan type
  // Each loan type has different down payment requirements, DTI limits, PMI rules, etc.
  const loanTypeConfig = {
    // CONVENTIONAL LOAN
    conventional: { 
      name: "Conventional", 
      minDownPayment: 0.03, // Minimum 3% down payment
      maxDtiTotalDefault: 43, // Maximum total debt-to-income ratio (43%)
      requiresPmi: true, // PMI required if down payment < 20%
      pmiThreshold: 0.2, // PMI required when LTV > 80% (1 - 0.2 = 0.8)
      pmiTargetLtvLower: 78, // PMI auto-terminates at 78% LTV
      pmiTargetLtvUpper: 80, // PMI can be requested for removal at 80% LTV
      canRemovePmi: true, // PMI can be removed when conditions are met
      description: "Standard mortgage. PMI usually required if down payment < 20%.",
      
      // Seller credits limit depends on down payment percentage
      getMaxSellerCreditPercent: (dpPercent) => { 
        if (dpPercent < 0.10) return 0.03; // <10% down = 3% max seller credit
        if (dpPercent < 0.25) return 0.06; // 10-24% down = 6% max seller credit
        return 0.09; // ≥25% down = 9% max seller credit
      },
      
      // Generate tooltip explaining PMI removal for conventional loans
      getPmiDropoffTooltip: (ltv) => {
        if (ltv <= 78) {
          return `LTV at ${formatPercent(ltv, 1)}. PMI has been automatically terminated as LTV is at or below 78%.`;
        } else if (ltv <= 80) {
          return `LTV at ${formatPercent(ltv, 1)}. You can request PMI removal at this point as LTV is at or below 80%.`;
        } else {
          return `LTV at ${formatPercent(ltv, 1)}. PMI will automatically terminate at 78% LTV or can be requested for removal at 80% LTV.`;
        }
      }
    },
    
    // FHA LOAN
    fha: { 
      name: "FHA", 
      minDownPayment: 0.035, // Minimum 3.5% down payment
      maxDtiTotalDefault: 43, 
      requiresPmi: true, // MIP (mortgage insurance premium) always required
      pmiThreshold: 0.0, // MIP required regardless of down payment
      pmiTargetLtvLower: 78, 
      pmiTargetLtvUpper: 80, 
      canRemovePmi: false, // MIP cannot be removed (except in specific cases)
      description: "FHA-insured. Allows lower down payments. Includes MIP.",
      getMaxSellerCreditPercent: () => 0.06, // Fixed 6% max seller credit
      
      // FHA MIP removal rules are complex
      getPmiDropoffTooltip: (ltv, initialLtv, loanTermMonths, currentMonth) => {
        // MIP can be removed after 11 years IF initial LTV ≤ 90% AND loan term > 11 years
        if (initialLtv <= 0.90 && loanTermMonths > 132 && currentMonth >= 132) {
          return `MIP has been removed after 11 years (132 months) as initial LTV was ≤ 90%.`;
        } else if (initialLtv <= 0.90 && loanTermMonths > 132) {
          return `LTV at ${formatPercent(ltv, 1)}. MIP will be removed after 11 years (132 months) as initial LTV was ≤ 90%.`;
        } else {
          return `LTV at ${formatPercent(ltv, 1)}. MIP remains for the life of the loan. Consider refinancing to a conventional loan when LTV reaches 80% to eliminate mortgage insurance.`;
        }
      }
    },
    
    // VA LOAN
    va: { 
      name: "VA", 
      minDownPayment: 0, // No down payment required
      maxDtiTotalDefault: 41, 
      requiresPmi: false, // No PMI/MIP for VA loans
      pmiThreshold: 0, 
      pmiTargetLtvLower: 0, 
      pmiTargetLtvUpper: 0, 
      canRemovePmi: false, 
      description: "For eligible veterans/military. Often no down payment/PMI.",
      getMaxSellerCreditPercent: () => 0.04, // Fixed 4% max seller credit
      getPmiDropoffTooltip: () => "" // No PMI to explain
    },
    
    // USDA LOAN
    usda: { 
      name: "USDA", 
      minDownPayment: 0, // No down payment required
      maxDtiTotalDefault: 41, 
      requiresPmi: true, // Guarantee fee required for life of loan
      pmiThreshold: 0.0, // Guarantee fee required regardless of down payment
      pmiTargetLtvLower: 0, 
      pmiTargetLtvUpper: 0, 
      canRemovePmi: false, // Guarantee fee cannot be removed
      description: "USDA Rural Development loan. No down payment required. Must meet income limits (typically 115% of area median income) and property must be in eligible rural/suburban area. Includes guarantee fee that remains for life of loan.",
      getMaxSellerCreditPercent: () => 0.06, // Fixed 6% max seller credit
      
      // USDA guarantee fee never goes away
      getPmiDropoffTooltip: (ltv) => {
        return `LTV at ${formatPercent(ltv, 1)}. The USDA guarantee fee remains for the life of the loan and cannot be removed. Consider refinancing to a conventional loan when LTV reaches 80% to eliminate mortgage insurance.`;
      }
    }
  };

  // ==========================================================================
  // FORMATTING HELPER FUNCTIONS
  // ==========================================================================
  // These functions format numbers for display to the user
  
  // Format as currency (e.g., $350,000)
  const formatCurrency = val => new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD", 
    maximumFractionDigits: 0 
  }).format(val);
  
  // Format as percentage (e.g., 5.2%)
  const formatPercent = (val, digits = 1) => `${Number(val).toFixed(digits)}%`;
  
  // Format as years (e.g., 3.5 years)
  const formatYears = val => `${Number(val).toFixed(1)} years`;

  // ==========================================================================
  // CALCULATION FUNCTION: Convert annual/monthly inputs to monthly rates
  // ==========================================================================
  // Takes various inputs and converts them to monthly values for calculations
  function deriveMonthlyRates({ nominalApr, monthlyTax, monthlyInsurance, monthlyHoa, annualIncome }) {
    const r_m = nominalApr/100/12; // Monthly interest rate (annual rate / 12)
    const tau_m = monthlyTax; // Monthly property tax
    const ins_m = monthlyInsurance; // Monthly insurance
    const hoa_m = monthlyHoa; // Monthly HOA fees
    const I_m = annualIncome > 0 ? annualIncome / 12 : 0; // Monthly income
    return { r_m, tau_m, ins_m, hoa_m, I_m };
  }

  // ==========================================================================
  // CALCULATION FUNCTION: Calculate maximum PITI payment
  // ==========================================================================
  // PITI = Principal + Interest + Taxes + Insurance
  // This determines how much the user can afford to pay monthly based on their mode
  function computeMaxPiti({ targetDti, targetPayment, monthlyDebt }, I_m, cfgForAutoDti, mode) {
    if (mode === 'default') {
      // Default mode: Use standard DTI limit for the loan type
      // Formula: (Monthly Income × DTI%) - Existing Debt = Available for Housing
      return Math.max(0, I_m * (cfgForAutoDti.maxDtiTotalDefault / 100) - monthlyDebt);
    } else if (mode === 'dti') {
      // DTI mode: Use custom DTI percentage set by user
      return Math.max(0, I_m * (targetDti / 100) - monthlyDebt);
    } else { 
      // Payment mode: User specified exact monthly payment they want
      return targetPayment;
    }
  }

  // ==========================================================================
  // CALCULATION FUNCTION: Estimate home price and loan amount
  // ==========================================================================
  // Given a maximum PITI payment, this calculates how much home the user can afford
  // Uses iterative approach because PMI depends on loan amount, which depends on home price
  function estimateHomeAndLoan({pmiRate, pmiThreshold, requiresPmi}, PITI_max, r_m, tau_m, ins_m, hoa_m, n, downPayment) {
    let HP = 0; // Home Price
    let L = 0;  // Loan amount
    
    // Iterate up to 10 times to converge on accurate values
    // (PMI calculation creates circular dependency that requires iteration)
    for(let k = 0; k < 10; k++){ 
      // Calculate fixed monthly costs (escrows)
      const escrows = tau_m + ins_m + hoa_m;
      
      // Calculate PMI if required
      let pmi = 0;
      if(requiresPmi && HP > 0 && pmiRate > 0){
        const curLoan = Math.max(0, HP - downPayment);
        // PMI required if LTV > (1 - pmiThreshold)
        // e.g., for conventional: if LTV > 80% (1 - 0.2)
        if (HP > 0 && curLoan / HP > 1 - pmiThreshold) 
          pmi = (curLoan * pmiRate) / 12; // Annual PMI rate divided by 12
      }
      
      // Calculate available amount for Principal & Interest
      const availPI = PITI_max - escrows - pmi;
      
      // If no money left for P&I, user can't afford any home
      if(availPI <= 0) { 
        HP = L = 0; 
        break;
      }
      
      // Calculate loan amount using mortgage formula
      // If interest rate > 0, use standard mortgage formula
      // Formula: L = P × [(1 - (1 + r)^-n) / r]
      // where P = monthly payment, r = monthly rate, n = number of months
      if(r_m > 0) {
        L = availPI * ((1 - Math.pow(1 + r_m, -n)) / r_m);
      } else {
        // If 0% interest, just multiply payment by months
        L = availPI * n;
      }
      
      // Home price = Loan + Down payment
      HP = L + downPayment;
    }
    return { homePrice: HP, loanAmount: L };
  }

  // ==========================================================================
  // CALCULATION FUNCTION: Calculate base Principal & Interest payment
  // ==========================================================================
  // Given a loan amount, interest rate, and term, calculate monthly P&I
  function computeBasePI(L, r_m, n){
    if(L <= 0) return 0; // No loan = no payment
    
    if(r_m > 0){
      // Standard mortgage payment formula
      // M = L × [r(1+r)^n] / [(1+r)^n - 1]
      const f = Math.pow(1 + r_m, n); // (1+r)^n
      return (L * r_m * f) / (f - 1);
    }
    
    // If 0% interest, just divide loan by number of months
    return L / n;
  }

  // ==========================================================================
  // CALCULATION FUNCTION: Calculate escrows and PMI
  // ==========================================================================
  // Escrows = Taxes + Insurance + HOA
  // PMI depends on loan type and LTV ratio
  function computeEscrowsAndPmi(HP, L, monthlyTax, monthlyInsurance, monthlyHoa, {requiresPmi, pmiThreshold, pmiRate}){
    const tax = monthlyTax;
    const insurance = monthlyInsurance;
    const hoa = monthlyHoa;
    
    let pmi = 0;
    if(requiresPmi && L > 0 && HP > 0 && pmiRate > 0){
      // Calculate LTV (Loan-to-Value ratio)
      // If LTV > threshold, PMI is required
      if (L / HP > 1 - pmiThreshold) 
        pmi = (L * pmiRate) / 12; // Annual PMI rate / 12 months
    }
    
    return { tax, insurance, hoa, pmi };
  }

  // ==========================================================================
  // CALCULATION FUNCTION: Calculate DTI ratios
  // ==========================================================================
  // DTI = Debt-to-Income ratio (percentage of income going to debt)
  function computeDti(PITI, monthlyDebt, I_m){
    return {
      // Housing DTI: Housing costs as percentage of income
      housingDti: I_m ? PITI / I_m * 100 : 0,
      
      // Total DTI: All debts (housing + other) as percentage of income
      totalDti: I_m ? (PITI + monthlyDebt) / I_m * 100 : 0
    };
  }

  // ==========================================================================
  // CALCULATION FUNCTION: Simulate loan payoff with/without extra payments
  // ==========================================================================
  // This function simulates the entire life of the loan month-by-month
  // It calculates payoff time, total interest, and when PMI drops off
  function simulatePayoff(homePrice, loanAmount, basePI, extraPayment, r_m, n_original, cfg, loanTermYears) {
    
    // PART 1: Calculate total interest WITHOUT extra payments
    let totalInterestNoExtra = 0;
    if (loanAmount > 0 && basePI > 0) {
      let balance = loanAmount;
      
      // Loop through each month of the original loan term
      for (let m = 0; m < n_original; m++) {
        const interestThisMonth = balance * r_m; // Interest = Balance × Monthly Rate
        totalInterestNoExtra += interestThisMonth;
        
        const principalThisMonth = basePI - interestThisMonth; // Principal = Payment - Interest
        balance -= principalThisMonth; // Reduce balance by principal paid
        
        // If balance paid off, stop
        if (balance <= 0.005) { 
          balance = 0; 
          break; 
        }
      }
    }

    // PART 2: Calculate payoff WITH extra payments
    let monthsToPayoff = n_original; // Default to original term
    let totalInterestWithExtra = totalInterestNoExtra; // Default to no-extra interest
    let pmiDropOffMonthsWithExtra = -1; // Month when PMI drops off (if applicable)

    if (loanAmount > 0 && basePI > 0) {
      let balanceWithExtra = loanAmount;
      let currentMonths = 0;
      let currentTotalInterestWithExtra = 0;
      const totalMonthlyPaymentWithExtra = basePI + extraPayment; // Total payment each month

      // Check if payment is enough to cover interest (prevents infinite loop)
      if (totalMonthlyPaymentWithExtra > balanceWithExtra * r_m || r_m === 0) {
        
        // Simulate each month with extra payment
        while (balanceWithExtra > 0.005 && currentMonths < n_original * 2) { 
          const interestThisMonth = balanceWithExtra * r_m;
          currentTotalInterestWithExtra += interestThisMonth;
          const principalThisMonth = totalMonthlyPaymentWithExtra - interestThisMonth;
          
          // Safety check: If principal payment is negative, something's wrong
          if (principalThisMonth <= 0 && balanceWithExtra > 0.005 && extraPayment > 0) { 
            currentMonths = n_original * 2; // Exit loop
            currentTotalInterestWithExtra = totalInterestNoExtra; 
            break;
          }
          
          balanceWithExtra -= principalThisMonth;
          currentMonths++;
        }
        
        // If loan paid off early, update values
        if (balanceWithExtra <= 0.005 && extraPayment > 0) { 
          monthsToPayoff = currentMonths;
          totalInterestWithExtra = currentTotalInterestWithExtra;
        } else if (extraPayment === 0) {
          // No extra payment = same as original
          monthsToPayoff = n_original;
          totalInterestWithExtra = totalInterestNoExtra;
        }
      }
      
      // PART 3: Calculate when PMI drops off with extra payments
      if (cfg.requiresPmi && homePrice > 0 && extraPayment > 0) { 
        const initialLtv = loanAmount / homePrice;
        
        // CONVENTIONAL LOAN: PMI drops at 80% LTV
        if (cfg.name === "Conventional") {
          if (initialLtv > (1 - cfg.pmiThreshold)) { 
            pmiDropOffMonthsWithExtra = monthsToPayoff; // Default to payoff month
            let tempBalanceConv = loanAmount;
            let tempMonthsConv = 0;
            
            if (totalMonthlyPaymentWithExtra > tempBalanceConv * r_m || r_m === 0) {
              // Simulate to find when LTV reaches 80%
              while (tempBalanceConv > 0.005 && tempMonthsConv < monthsToPayoff) {
                const ltvCurrentConv = (tempBalanceConv / homePrice);
                
                // Check if LTV has dropped below threshold
                if (ltvCurrentConv <= (1 - cfg.pmiThreshold)) {
                  pmiDropOffMonthsWithExtra = tempMonthsConv + 1;
                  break;
                }
                
                const interestConv = tempBalanceConv * r_m;
                const principalConv = totalMonthlyPaymentWithExtra - interestConv;
                
                if (principalConv <= 0 && tempBalanceConv > 0.005) { 
                  break; 
                }
                
                tempBalanceConv -= principalConv;
                tempMonthsConv++;
              }
            }
          } else { 
            pmiDropOffMonthsWithExtra = 0; // Already below threshold
          }
        } 
        // FHA LOAN: MIP drops after 11 years IF initial LTV ≤ 90%
        else if (cfg.name === "FHA") {
          if (initialLtv > 0) { 
            if (loanTermYears * 12 > 132 && initialLtv <= 0.90) { 
              // MIP drops at 132 months or payoff, whichever is earlier
              pmiDropOffMonthsWithExtra = Math.min(132, monthsToPayoff);
            } else { 
              // MIP for life of loan
              pmiDropOffMonthsWithExtra = monthsToPayoff;
            }
          }
        }
      }
    } else if (loanAmount <= 0) { 
      // No loan = no payoff time
      monthsToPayoff = 0;
      totalInterestWithExtra = 0;
    }
    
    // Calculate time and money saved by extra payments
    const yearsSaved = Math.max(0, (n_original - monthsToPayoff) / 12);
    const interestSaved = Math.max(0, totalInterestNoExtra - totalInterestWithExtra);
    
    // Calculate payoff date
    const payoffDate = new Date();
    if (monthsToPayoff > 0) 
      payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);
    else 
      payoffDate.setTime(new Date().getTime()); 

    return { 
      monthsToPayoff, 
      yearsSaved, 
      interestSaved, 
      payoffDate, 
      totalInterestNoExtra, 
      totalInterestWithExtra, 
      pmiDropOffMonthsWithExtra 
    };
  }

  // ==========================================================================
  // MAIN CALCULATION FUNCTION: Calculate all mortgage values
  // ==========================================================================
  // This is the heart of the calculator - it runs all calculations and returns results
  function calculateAll(){
    
    // STEP 1: Gather all input values into an object
    const V = {
      loanType: inputs.loanType.value,
      
      // Use simple mode inputs if in simple affordability mode, otherwise use advanced inputs
      // annualIncome: calculatorMode === 'simple' && simpleCalcMode === 'affordability' 
      //   ? +inputs.simpleAnnualIncomeNumber.value 
      //   : +inputs.annualIncomeNumber.value,
      // monthlyDebt: calculatorMode === 'simple' && simpleCalcMode === 'affordability'
      //   ? +inputs.simpleMonthlyDebtNumber.value
      //   : +inputs.monthlyDebtNumber.value,
        annualIncome: +inputs.simpleAnnualIncomeNumber.value || 0,
        monthlyDebt: +inputs.simpleMonthlyDebtNumber.value || 0,
      
      targetDti: +inputs.targetDTINumber.value, 
      targetPayment: +inputs.targetMonthlyPaymentNumber.value,
      loanAmountOverride: calculatorMode === 'simple' ? 0 : +inputs.loanAmountOverrideNumber.value,
      simpleHomePrice: calculatorMode === 'simple' && simpleCalcMode === 'home-price' ? +inputs.simpleLoanAmountNumber.value : 0,
      downPayment: +inputs.downPaymentNumber.value,
      interestRate: +inputs.interestRateNumber.value, 
      sellerCreditsPercent: +inputs.sellerCreditsPercentNumber.value, 
      loanTerm: +inputs.loanTermNumber.value,
      monthlyPropertyTax: +inputs.propertyTaxNumber.value,
      monthlyInsurance: +inputs.insuranceNumber.value,
      monthlyHoa: +inputs.hoaNumber.value,
      additionalPayment: +inputs.additionalPaymentNumber.value
    };
    
    // STEP 2: Get configuration for selected loan type and set PMI rate
    const cfg = {...loanTypeConfig[V.loanType]}; 
    if (V.loanType === 'fha') {
      cfg.pmiRate = 0.0055; // 0.55% annual MIP for FHA
    } else if (V.loanType === 'usda') {
      cfg.pmiRate = 0.0035; // 0.35% annual guarantee fee for USDA
    } else if (V.loanType === 'conventional' && cfg.requiresPmi) {
      cfg.pmiRate = 0.005; // 0.5% annual PMI for conventional (estimated)
    } else {
      cfg.pmiRate = 0; // No PMI (e.g., VA loans or 20%+ down)
    }

    // STEP 3: Convert inputs to monthly rates
    const {r_m, tau_m, ins_m, hoa_m, I_m} = deriveMonthlyRates({
      nominalApr: V.interestRate, 
      monthlyTax: V.monthlyPropertyTax,
      monthlyInsurance: V.monthlyInsurance,
      monthlyHoa: V.monthlyHoa,
      annualIncome: V.annualIncome
    });
    
    // STEP 4: Determine home price and loan amount based on mode
    let homePrice, loanAmount;
    
    if (calculatorMode === 'simple' && simpleCalcMode === 'home-price' && V.simpleHomePrice > 0) {
      // SIMPLE HOME-PRICE MODE: User entered home price directly
      homePrice = V.simpleHomePrice;
      loanAmount = Math.max(0, homePrice - V.downPayment);
    } 
    else if (calculatorMode === 'simple' && simpleCalcMode === 'affordability') {
      // SIMPLE AFFORDABILITY MODE: Calculate max home price based on income
      const PITI_max = computeMaxPiti(V, I_m, cfg, 'default');
      const estimation = estimateHomeAndLoan(cfg, PITI_max, r_m, tau_m, ins_m, hoa_m, V.loanTerm*12, V.downPayment);
      homePrice = estimation.homePrice;
      loanAmount = estimation.loanAmount;
    } 
    else if (V.loanAmountOverride > 0) {
      // LOAN OVERRIDE MODE: User manually set the loan amount
      homePrice = V.loanAmountOverride;
      loanAmount = Math.max(0, homePrice - V.downPayment);
    } 
    else {
      // ADVANCED MODE: Calculate based on current calculation mode (default/DTI/payment)
      const PITI_max = computeMaxPiti(V, I_m, cfg, currentCalculationMode); 
      const estimation = estimateHomeAndLoan(cfg, PITI_max, r_m, tau_m, ins_m, hoa_m, V.loanTerm*12, V.downPayment);
      homePrice = estimation.homePrice;
      loanAmount = estimation.loanAmount;
    }
    
    // STEP 5: Calculate seller credits and validate
    const dpPercentForSellerCredit = homePrice > 0 ? V.downPayment / homePrice : 0;
    const maxAllowableSellerCreditPercent = cfg.getMaxSellerCreditPercent(dpPercentForSellerCredit) * 100; 
    
    // Cap seller credits at maximum allowed for this loan type
    V.sellerCreditsPercent = Math.min(V.sellerCreditsPercent, maxAllowableSellerCreditPercent);
    
    // Update slider/input maximums
    inputs.sellerCreditsPercentSlider.max = maxAllowableSellerCreditPercent.toFixed(1);
    inputs.sellerCreditsPercentNumber.max = maxAllowableSellerCreditPercent.toFixed(1);
    
    // If user's input exceeds max, reduce it
    if (+inputs.sellerCreditsPercentNumber.value > maxAllowableSellerCreditPercent) {
      inputs.sellerCreditsPercentNumber.value = maxAllowableSellerCreditPercent.toFixed(1);
      inputs.sellerCreditsPercentSlider.value = maxAllowableSellerCreditPercent.toFixed(1);
    }

    // Calculate dollar amount of seller credits
    const sellerCreditsDollarAmount = homePrice > 0 ? homePrice * (V.sellerCreditsPercent / 100) : 0;
    
    // Calculate minimum down payment required for this loan type
    const requiredMinDownPayment = homePrice > 0 ? homePrice * cfg.minDownPayment : 0;
    
    // Calculate estimated cash needed at closing (down payment minus seller credits)
    let estimatedCashToClose = Math.max(0, V.downPayment - sellerCreditsDollarAmount);

    // STEP 6: Calculate monthly payment components
    const basePI = computeBasePI(loanAmount, r_m, V.loanTerm * 12); // Principal & Interest
    const {tax, insurance, hoa, pmi} = computeEscrowsAndPmi(homePrice, loanAmount, V.monthlyPropertyTax, V.monthlyInsurance, V.monthlyHoa, cfg);
    const PITI = basePI + tax + insurance + hoa + pmi; // Total housing payment
    const displayedPayment = PITI + V.additionalPayment; // Including extra payment
    
    // Calculate DTI ratios
    const {housingDti, totalDti} = computeDti(PITI, V.monthlyDebt, I_m);
    
    // STEP 7: Simulate payoff schedule with and without extra payments
    const payoffDetails = simulatePayoff(homePrice, loanAmount, basePI, V.additionalPayment, r_m, V.loanTerm*12, cfg, V.loanTerm);

    // STEP 8: Calculate "effective" interest rate when making extra payments
    // This shows how extra payments reduce the effective cost of the loan
    let netEffectiveRateFromExtraPayments = V.interestRate; 
    if (V.additionalPayment > 0 && payoffDetails.totalInterestNoExtra > 0 && payoffDetails.totalInterestWithExtra < payoffDetails.totalInterestNoExtra) {
      // Scale interest rate by ratio of actual interest paid vs original
      netEffectiveRateFromExtraPayments = V.interestRate * (payoffDetails.totalInterestWithExtra / payoffDetails.totalInterestNoExtra);
    } else if (V.interestRate === 0 || payoffDetails.totalInterestNoExtra === 0) { 
      netEffectiveRateFromExtraPayments = 0;
    }
    netEffectiveRateFromExtraPayments = Math.max(0, netEffectiveRateFromExtraPayments);

    // Calculate LTV (Loan-to-Value) ratio
    const ltv = homePrice > 0 ? (loanAmount / homePrice) * 100 : 0;
    
    // Check if down payment meets minimum requirement
    const actualDownPaymentAmount = V.downPayment;
    const dpOK = actualDownPaymentAmount >= requiredMinDownPayment;
    
    // Calculate when PMI drops off with extra payments
    let pmiDropOffDateWithExtra = null;
    if (payoffDetails.pmiDropOffMonthsWithExtra >= 0) { 
      pmiDropOffDateWithExtra = new Date();
      if (payoffDetails.pmiDropOffMonthsWithExtra > 0) {
        pmiDropOffDateWithExtra.setMonth(pmiDropOffDateWithExtra.getMonth() + payoffDetails.pmiDropOffMonthsWithExtra);
      }
    }
    
    const initialLtv = homePrice > 0 ? (loanAmount / homePrice) * 100 : 0;
    
    // STEP 9: Generate month-by-month amortization schedule
    const monthlyAmortization = [];
    if (loanAmount > 0 && homePrice > 0) {
      let bal = loanAmount;   // Balance without extra payments
      let balX = loanAmount;  // Balance with extra payments
      
      // Loop through each month of the loan term
      for (let mo = 1; mo <= V.loanTerm * 12; mo++) {
        // Calculate payment date
        const paymentDate = new Date();
        paymentDate.setMonth(paymentDate.getMonth() + mo);

        // Variables for this month's payment
        let p = 0;  // Principal paid (no extra)
        let i = 0;  // Interest paid (no extra)
        let pX = 0; // Principal paid (with extra)
        let iX = 0; // Interest paid (with extra)
        
        // CALCULATE WITHOUT EXTRA PAYMENT
        if (bal > 0.005) {
          i = bal * r_m; // Interest = Balance × Rate
          p = Math.min(bal, basePI - i); // Principal = Payment - Interest (capped at balance)
          bal -= p; // Reduce balance
          if (bal < 0.005) bal = 0; // Round to zero if very small
        }
        
        // CALCULATE WITH EXTRA PAYMENT
        if (balX > 0.005) {
          iX = balX * r_m;
          const paymentWithExtra = basePI + V.additionalPayment;
          pX = Math.min(balX, paymentWithExtra - iX);
          
          // Safety check for negative principal
          if (paymentWithExtra - iX < 0 && balX > 0.005 && V.additionalPayment > 0) { 
            pX = 0; 
          } else { 
            balX -= pX; 
          }
          if (balX < 0.005) balX = 0;
        }

        // Calculate LTV for both scenarios
        const ltvNoExtra = homePrice > 0 ? (bal / homePrice) * 100 : 101;
        const ltvWithExtra = homePrice > 0 ? (balX / homePrice) * 100 : 101;

        // Check if this month is a PMI drop-off candidate (for highlighting in table)
        let pmiDropoffCandidate = false;
        let pmiTooltip = "";
        
        // CONVENTIONAL: Check if LTV is in 78-80% range
        if (V.loanType === 'conventional' && cfg.requiresPmi) {
          if (ltvNoExtra >= cfg.pmiTargetLtvLower && ltvNoExtra <= cfg.pmiTargetLtvUpper) {
            pmiDropoffCandidate = true;
            pmiTooltip = cfg.getPmiDropoffTooltip(ltvNoExtra);
          }
        }
        // FHA: Check if eligible for MIP removal
        else if (V.loanType === 'fha' && cfg.requiresPmi) {
          const initialLtvRatio = loanAmount / homePrice;
          // MIP drops after 11 years if initial LTV ≤ 90%
          if ((initialLtvRatio <= 0.90 && mo >= 132) || 
              (ltvNoExtra >= cfg.pmiTargetLtvLower && ltvNoExtra <= cfg.pmiTargetLtvUpper && initialLtvRatio > 0.90)) {
            pmiDropoffCandidate = true;
            pmiTooltip = cfg.getPmiDropoffTooltip(ltvNoExtra, initialLtvRatio, V.loanTerm * 12, mo);
          }
        }
        // USDA: Highlight 78-80% range (even though it doesn't drop off)
        else if (V.loanType === 'usda' && cfg.requiresPmi) {
          if (ltvNoExtra >= 78 && ltvNoExtra <= 80) {
            pmiDropoffCandidate = true;
            pmiTooltip = cfg.getPmiDropoffTooltip(ltvNoExtra);
          }
        }

        // Same checks for "with extra payment" scenario
        let pmiDropoffCandidateExtra = false;
        let pmiTooltipExtra = "";
        
        if (V.additionalPayment > 0) {
          if (V.loanType === 'conventional' && cfg.requiresPmi) {
            if (ltvWithExtra >= cfg.pmiTargetLtvLower && ltvWithExtra <= cfg.pmiTargetLtvUpper) {
              pmiDropoffCandidateExtra = true;
              pmiTooltipExtra = cfg.getPmiDropoffTooltip(ltvWithExtra);
            }
          }
          else if (V.loanType === 'fha' && cfg.requiresPmi) {
            const initialLtvRatio = loanAmount / homePrice;
            if ((initialLtvRatio <= 0.90 && mo >= 132) || 
                (ltvWithExtra >= cfg.pmiTargetLtvLower && ltvWithExtra <= cfg.pmiTargetLtvUpper && initialLtvRatio > 0.90)) {
              pmiDropoffCandidateExtra = true;
              pmiTooltipExtra = cfg.getPmiDropoffTooltip(ltvWithExtra, initialLtvRatio, V.loanTerm * 12, mo);
            }
          }
          else if (V.loanType === 'usda' && cfg.requiresPmi) {
            if (ltvWithExtra >= 78 && ltvWithExtra <= 80) {
              pmiDropoffCandidateExtra = true;
              pmiTooltipExtra = cfg.getPmiDropoffTooltip(ltvWithExtra);
            }
          }
        }

        // Store this month's data
        monthlyAmortization.push({
          month: mo,
          date: paymentDate.toLocaleDateString(),
          principal: p, 
          interest: i, 
          endBalance: bal, 
          ltvNoExtra,
          principalX: pX, 
          interestX: iX, 
          extraEndBalance: balX, 
          ltvWithExtra,
          pmiDropoffCandidate,
          pmiTooltip,
          pmiDropoffCandidateExtra,
          pmiTooltipExtra
        });
      }
    }

    // STEP 10: Return all calculated values
    return {
      V, // All input values
      cfg, // Loan configuration
      homePrice,
      loanAmount,
      sellerCreditsDollarAmount,
      estimatedCashToClose,
      ltv,
      basePI,
      tax,
      insurance,
      hoa,
      pmi,
      PITI,
      displayedPayment,
      housingDti,
      totalDti,
      yearsSaved: payoffDetails.yearsSaved,
      interestSaved: payoffDetails.interestSaved,
      payoffDate: payoffDetails.payoffDate,
      pmiDropOffDateWithExtra,
      netEffectiveRateFromExtraPayments,
      requiredMinDownPayment,
      dpOK,
      monthlyAmortization, 
      maxAllowableSellerCreditPercent,
      initialLtv,
      totalInterestNoExtra: payoffDetails.totalInterestNoExtra 
    };
  }

  // ==========================================================================
  // UI UPDATE FUNCTION: Update all display elements with calculated values
  // ==========================================================================
  // This function takes the results from calculateAll() and updates the HTML
  function updateUI(){
    // Run all calculations
    const R = calculateAll();
    
    // Determine if we should show extra payment results section
    const showExtra = R.loanAmount > 0 && R.V.additionalPayment > 0 && R.yearsSaved > 0.001; 

    // PART 1: Sync input elements with calculated values
    // This ensures displayed values match what was actually used in calculations
    // PART 2: Sync input elements with calculated values
    // This ensures displayed values match what was actually used in calculations
    inputs.simpleAnnualIncomeSlider.value = R.V.annualIncome;
    inputs.simpleAnnualIncomeNumber.value = R.V.annualIncome;
    inputs.simpleMonthlyDebtSlider.value = R.V.monthlyDebt;
    inputs.simpleMonthlyDebtNumber.value = R.V.monthlyDebt;
    inputs.targetDTISlider.value = R.V.targetDti; 
    inputs.targetDTINumber.value = R.V.targetDti;
    inputs.targetMonthlyPaymentSlider.value = R.V.targetPayment;
    inputs.targetMonthlyPaymentNumber.value = R.V.targetPayment;
    inputs.loanAmountOverrideSlider.value = R.V.loanAmountOverride;
    inputs.loanAmountOverrideNumber.value = R.V.loanAmountOverride;
    inputs.downPaymentSlider.value = R.V.downPayment;
    inputs.downPaymentNumber.value = R.V.downPayment;
    inputs.interestRateSlider.value = R.V.interestRate; 
    inputs.interestRateNumber.value = R.V.interestRate;
    
    // Update seller credits display and limits
    inputs.sellerCreditsPercentSlider.value = R.V.sellerCreditsPercent.toFixed(1);
    inputs.sellerCreditsPercentNumber.value = R.V.sellerCreditsPercent.toFixed(1);
    inputs.sellerCreditsDollarValue.textContent = `(${formatCurrency(R.sellerCreditsDollarAmount)})`;
    
    // Generate tooltip explaining seller credits for this loan type
    const maxSCPercent = R.maxAllowableSellerCreditPercent.toFixed(1);
    const maxSCDollar = formatCurrency(R.homePrice * (R.maxAllowableSellerCreditPercent / 100));
    let tooltipText = `Seller credits are a percentage of the home price (${formatCurrency(R.homePrice)}) that the seller contributes towards your closing costs. This reduces your out-of-pocket expenses. <br><br><strong>Current Max for ${R.cfg.name} loan: ${maxSCPercent}% (${maxSCDollar}).</strong><br>`;
    
    // Add loan-type-specific explanation
    if (R.V.loanType === 'conventional') {
      tooltipText += "Conventional: Up to 3% (DP < 10%), 6% (DP 10-24.99%), or 9% (DP >= 25%).";
    } else if (R.V.loanType === 'fha') {
      tooltipText += "FHA: Up to 6% of sales price.";
    } else if (R.V.loanType === 'va') {
      tooltipText += "VA: Up to 4% of sales price (can cover funding fee & other costs; actual VA rules are more nuanced).";
    } else if (R.V.loanType === 'usda') {
      tooltipText += "USDA: Up to 6% of sales price (can cover closing costs, prepaid items, and discount points).";
    }
    inputs.sellerCreditsTooltipContent.innerHTML = tooltipText;

    // Update remaining input displays
    inputs.loanTermSlider.value = R.V.loanTerm;
    inputs.loanTermNumber.value = R.V.loanTerm;
    inputs.propertyTaxSlider.value = R.V.monthlyPropertyTax;
    inputs.propertyTaxNumber.value = R.V.monthlyPropertyTax;
    inputs.insuranceSlider.value = R.V.monthlyInsurance;
    inputs.insuranceNumber.value = R.V.monthlyInsurance;
    inputs.hoaSlider.value = R.V.monthlyHoa;
    inputs.hoaNumber.value = R.V.monthlyHoa;
    inputs.additionalPaymentSlider.value = R.V.additionalPayment;
    inputs.additionalPaymentNumber.value = R.V.additionalPayment;

    // PART 3: Update primary results display (Simple Mode)
    results.homePrice.textContent = formatCurrency(R.homePrice);
    results.loanAmount.textContent = formatCurrency(R.loanAmount);
    
    // Show down payment as dollar amount and percentage
    const downPaymentPercent = R.homePrice > 0 ? (R.V.downPayment / R.homePrice) * 100 : 0;
    results.downPaymentSimple.textContent = `${formatCurrency(R.V.downPayment)} (${formatPercent(downPaymentPercent, 1)})`;
    
    // Payment breakdown
    results.piSimple.textContent = formatCurrency(R.basePI);
    results.taxSimple.textContent = formatCurrency(R.tax);
    results.insuranceSimple.textContent = formatCurrency(R.insurance);
    
    // PMI/MIP display (hide if zero)
    results.pmiContainerSimple.classList.toggle('hidden', R.pmi <= 0);
    if (R.pmi > 0) {
      // Change label based on loan type
      if (R.V.loanType === 'fha') {
        results.pmiLabelSimple.textContent = 'MIP';
      } else if (R.V.loanType === 'usda') {
        results.pmiLabelSimple.textContent = 'Guarantee Fee';
      } else {
        results.pmiLabelSimple.textContent = 'PMI';
      }
      results.pmiSimple.textContent = formatCurrency(R.pmi);
    }
    
    // Total paid and interest (for simple mode, use base payment without extra)
    const totalPaidSimple = R.basePI * R.V.loanTerm * 12; 
    const totalInterestSimple = R.totalInterestNoExtra || 0;
    results.totalPaid.textContent = formatCurrency(totalPaidSimple);
    results.totalInterest.textContent = formatCurrency(totalInterestSimple);
    
    // Payoff date (without extra payments)
    const payoffDateSimple = new Date();
    payoffDateSimple.setMonth(payoffDateSimple.getMonth() + (R.V.loanTerm * 12));
    results.payoffDateSimple.textContent = payoffDateSimple.toLocaleDateString();
    
    // Other key metrics
    results.effectiveInterestRate.textContent = formatPercent(R.V.interestRate, 3);
    results.ltv.textContent = formatPercent(R.ltv, 1);
    results.monthlyPayment.textContent = `${formatCurrency(R.displayedPayment)}/mo`;

    // PART 4: Update Advanced Mode Results
    results.downPaymentSummary.textContent = formatCurrency(R.V.downPayment);
    results.sellerCreditsApplied.textContent = formatCurrency(R.sellerCreditsDollarAmount);
    results.estimatedCashToClose.textContent = formatCurrency(R.estimatedCashToClose);
    results.pi.textContent = formatCurrency(R.basePI);
    results.tax.textContent = formatCurrency(R.tax);
    results.insurance.textContent = formatCurrency(R.insurance);
    results.hoa.textContent = formatCurrency(R.hoa);
    
    // PMI/MIP for advanced mode (with detailed tooltip)
    results.pmiContainer.classList.toggle('hidden', R.pmi <= 0);
    if (R.pmi > 0) {
      if (R.V.loanType === 'fha') {
        results.pmiLabel.textContent = 'MIP';
        results.pmiTooltipContent.textContent = "Mortgage Insurance Premium (MIP) is required for FHA loans. It typically includes an upfront premium (not calculated here) and an annual premium paid monthly. MIP duration depends on your loan-to-value (LTV) ratio and loan term (often 11 years or the life of the loan).";
      } else if (R.V.loanType === 'usda') {
        results.pmiLabel.textContent = 'Guarantee Fee';
        results.pmiTooltipContent.textContent = "USDA Guarantee Fee is required for all USDA loans regardless of down payment. It includes an upfront fee (not calculated here) and an annual fee paid monthly. The guarantee fee remains for the life of the loan and cannot be removed.";
      } else { 
        results.pmiLabel.textContent = 'PMI';
        results.pmiTooltipContent.textContent = "Private Mortgage Insurance (PMI) is usually required for conventional loans if your down payment is less than 20% of the home's price. It protects the lender if you default. PMI can often be requested for removal once your LTV reaches 80%, and automatically terminates around 78% LTV.";
      }
      results.pmi.textContent = formatCurrency(R.pmi);
    }

    // DTI ratios
    results.housingDTI.textContent = formatPercent(R.housingDti);
    results.totalDTI.textContent = formatPercent(R.totalDti);

    // PART 5: Update Mobile Results (duplicate of desktop results)
    mobileResults.homePrice.textContent = formatCurrency(R.homePrice);
    mobileResults.monthlyPayment.textContent = `${formatCurrency(R.displayedPayment)}/mo`;
    mobileResults.resultHomePrice.textContent = formatCurrency(R.homePrice);
    mobileResults.resultLoanAmount.textContent = formatCurrency(R.loanAmount);
    mobileResults.resultDownPayment.textContent = `${formatCurrency(R.V.downPayment)} (${formatPercent(downPaymentPercent, 1)})`;
    mobileResults.resultLtv.textContent = formatPercent(R.ltv, 1);
    mobileResults.resultMonthlyPaymentFull.textContent = `${formatCurrency(R.displayedPayment)}/mo`;
    mobileResults.resultPi.textContent = formatCurrency(R.basePI);
    mobileResults.resultTax.textContent = formatCurrency(R.tax);
    mobileResults.resultInsurance.textContent = formatCurrency(R.insurance);
    mobileResults.resultHoa.textContent = formatCurrency(R.hoa);
    
    // Mobile PMI display
    mobileResults.pmiContainer.classList.toggle('hidden', R.pmi <= 0);
    if (R.pmi > 0) {
      if (R.V.loanType === 'fha') {
        mobileResults.pmiLabel.textContent = 'MIP';
      } else if (R.V.loanType === 'usda') {
        mobileResults.pmiLabel.textContent = 'Guarantee Fee';
      } else {
        mobileResults.pmiLabel.textContent = 'PMI';
      }
      mobileResults.resultPmi.textContent = formatCurrency(R.pmi);
    }
    
    mobileResults.resultTotalPaid.textContent = formatCurrency(totalPaidSimple);
    mobileResults.resultTotalInterest.textContent = formatCurrency(totalInterestSimple);
    mobileResults.resultPayoffDate.textContent = payoffDateSimple.toLocaleDateString();
    mobileResults.resultHousingDti.textContent = formatPercent(R.housingDti);
    mobileResults.resultTotalDti.textContent = formatPercent(R.totalDti);

    // PART 6: Update Extra Payment Results (shown only when extra payment is made)
    containers.extraPaymentResults.classList.toggle('hidden', !showExtra);
    if (showExtra) {
      results.timeSaved.textContent = formatYears(R.yearsSaved);
      results.interestSaved.textContent = formatCurrency(R.interestSaved);
      results.payoffDate.textContent = R.payoffDate.toLocaleDateString();

      // Show when PMI drops off with extra payments (if applicable)
      if (R.cfg.requiresPmi && R.pmi > 0 && R.pmiDropOffDateWithExtra && R.cfg.canRemovePmi) {
        results.pmiDropoffExtraContainer.classList.remove('hidden');
        results.pmiDropoffExtraDate.textContent = R.pmiDropOffDateWithExtra.toLocaleDateString();
      } else {
        results.pmiDropoffExtraContainer.classList.add('hidden');
      }
      
      // Show effective interest rate (reduced by extra payments)
      results.effectiveRate.textContent = formatPercent(R.netEffectiveRateFromExtraPayments, 3); 
    } else {
      results.pmiDropoffExtraContainer.classList.add('hidden');
    }

    // PART 7: Show/hide down payment warning
    // Warning appears if down payment is below minimum for loan type
    downPaymentWarning.classList.toggle('hidden', R.dpOK || R.homePrice <= 0);
    if (!R.dpOK && R.homePrice > 0) {
      downPaymentWarning.textContent = `Min down payment for ${R.cfg.name}: ${formatCurrency(R.requiredMinDownPayment)}`;
    }
    
    // PART 8: Generate Amortization Table (Desktop)
    amortizationBody.innerHTML = ""; // Clear existing table
    
    if (amortizationViewMode === 'years') {
      // YEARLY VIEW: Show one row per year
      amortizationHead.innerHTML = `
        <tr>
          <th>Year</th>
          <th>Start Balance</th>
          <th>Principal Paid</th>
          <th>Interest Paid</th>
          <th>End Balance</th>
          <th>LTV (No Extra)</th>
          <th class="extra-col">End Balance (w/ Extra)</th>
          <th class="extra-col">LTV (w/ Extra)</th>
        </tr>`;
      
      // Aggregate monthly data into yearly data
      const yearlyAmortization = [];
      for (let yr = 0; yr < R.V.loanTerm; yr++) {
        const yearData = R.monthlyAmortization.slice(yr * 12, (yr + 1) * 12);
        if (yearData.length === 0) break;

        const lastMonthOfYear = yearData[yearData.length - 1];
        
        const yearlyRow = {
          year: yr + 1,
          startBalance: yearData[0].endBalance + yearData[0].principal, // Balance at start of year
          principal: yearData.reduce((sum, m) => sum + m.principal, 0), // Sum principal for year
          interest: yearData.reduce((sum, m) => sum + m.interest, 0), // Sum interest for year
          endBalance: lastMonthOfYear.endBalance,
          ltvNoExtra: lastMonthOfYear.ltvNoExtra,
          extraEndBalance: lastMonthOfYear.extraEndBalance,
          ltvWithExtra: lastMonthOfYear.ltvWithExtra,
          // Check if any month in this year is a PMI dropoff candidate
          pmiDropoffCandidate: yearData.some(m => m.pmiDropoffCandidate),
          pmiTooltip: yearData.find(m => m.pmiDropoffCandidate)?.pmiTooltip || "",
          pmiDropoffCandidateExtra: yearData.some(m => m.pmiDropoffCandidateExtra),
          pmiTooltipExtra: yearData.find(m => m.pmiDropoffCandidateExtra)?.pmiTooltipExtra || ""
        };
        yearlyAmortization.push(yearlyRow);
      }

      // Generate table rows
      yearlyAmortization.forEach(row => {
        const tr = document.createElement("tr");
        
        // LTV cell (no extra payment) - highlight if PMI dropoff candidate
        let ltvNoExtraCell = `<td${row.pmiDropoffCandidate ? ' class="pmi-dropoff-candidate"' : ''}>
          ${formatPercent(row.ltvNoExtra, 1)}
          ${row.pmiDropoffCandidate && row.pmiTooltip ? `
            <div class="tooltip">
              <span class="tooltip-trigger">?</span>
              <div class="tooltip-content">${row.pmiTooltip}</div>
            </div>` : ''}
        </td>`;
        
        // LTV cell (with extra payment)
        let ltvWithExtraCell = `<td class="${row.pmiDropoffCandidateExtra ? 'pmi-dropoff-candidate extra-col' : 'extra-col'}">
          ${showExtra ? (row.ltvWithExtra > 100 ? '-' : formatPercent(row.ltvWithExtra, 1)) : '-'}
          ${showExtra && row.pmiDropoffCandidateExtra && row.pmiTooltipExtra ? `
            <div class="tooltip">
              <span class="tooltip-trigger">?</span>
              <div class="tooltip-content">${row.pmiTooltipExtra}</div>
            </div>` : ''}
        </td>`;
        
        // Build complete row
        tr.innerHTML = `
          <td>${row.year}</td>
          <td>${formatCurrency(row.startBalance)}</td>
          <td>${formatCurrency(row.principal)}</td>
          <td>${formatCurrency(row.interest)}</td>
          <td>${formatCurrency(row.endBalance)}</td>
          ${ltvNoExtraCell}
          <td class="extra-col">${showExtra ? formatCurrency(row.extraEndBalance) : '-'}</td>
          ${ltvWithExtraCell}
        `;
        amortizationBody.appendChild(tr);
      });

    } else {
      // MONTHLY VIEW: Show one row per month
      amortizationHead.innerHTML = `
        <tr>
          <th>Month</th>
          <th>Date</th>
          <th>Principal Paid</th>
          <th>Interest Paid</th>
          <th>End Balance</th>
          <th>LTV</th>
          <th class="extra-col">End Balance (w/ Extra)</th>
          <th class="extra-col">LTV (w/ Extra)</th>
        </tr>`;
      
      // Generate table rows directly from monthly data
      R.monthlyAmortization.forEach(row => {
        const tr = document.createElement("tr");
        
        // LTV cell (no extra) with PMI dropoff highlighting
        let ltvNoExtraCell = `<td${row.pmiDropoffCandidate ? ' class="pmi-dropoff-candidate"' : ''}>
          ${formatPercent(row.ltvNoExtra, 1)}
          ${row.pmiDropoffCandidate && row.pmiTooltip ? `
            <div class="tooltip">
              <span class="tooltip-trigger">?</span>
              <div class="tooltip-content">${row.pmiTooltip}</div>
            </div>` : ''}
        </td>`;
        
        // LTV cell (with extra) with PMI dropoff highlighting
        let ltvWithExtraCell = `<td class="${row.pmiDropoffCandidateExtra ? 'pmi-dropoff-candidate extra-col' : 'extra-col'}">
          ${showExtra ? (row.ltvWithExtra > 100 ? '-' : formatPercent(row.ltvWithExtra, 1)) : '-'}
          ${showExtra && row.pmiDropoffCandidateExtra && row.pmiTooltipExtra ? `
            <div class="tooltip">
              <span class="tooltip-trigger">?</span>
              <div class="tooltip-content">${row.pmiTooltipExtra}</div>
            </div>` : ''}
        </td>`;
        
        // Build complete row
        tr.innerHTML = `
          <td>${row.month}</td>
          <td>${row.date}</td>
          <td>${formatCurrency(row.principal)}</td>
          <td>${formatCurrency(row.interest)}</td>
          <td>${formatCurrency(row.endBalance)}</td>
          ${ltvNoExtraCell}
          <td class="extra-col">${showExtra ? formatCurrency(row.extraEndBalance) : '-'}</td>
          ${ltvWithExtraCell}
        `;
        amortizationBody.appendChild(tr);
      });
    }

    // PART 9: Generate Mobile Amortization Table (Simplified)
    mobileAmortizationBody.innerHTML = "";
    let mobileAmortizationHeadHTML = "";
    
    if (amortizationViewMode === 'years') {
      // Mobile yearly view (simplified - fewer columns)
      mobileAmortizationHeadHTML = `
        <tr>
          <th>Year</th>
          <th>Start Balance</th>
          <th>End Balance</th>
          <th class="extra-col">End Balance (w/ Extra)</th>
        </tr>`;
      
      // Aggregate monthly data into yearly
      const yearlyAmortization = [];
      for (let yr = 0; yr < R.V.loanTerm; yr++) {
        const yearData = R.monthlyAmortization.slice(yr * 12, (yr + 1) * 12);
        if (yearData.length === 0) break;
        const lastMonthOfYear = yearData[yearData.length - 1];
        yearlyAmortization.push({
          year: yr + 1,
          startBalance: yearData[0].endBalance + yearData[0].principal,
          endBalance: lastMonthOfYear.endBalance,
          extraEndBalance: lastMonthOfYear.extraEndBalance
        });
      }

      // Generate mobile table rows
      yearlyAmortization.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.year}</td>
          <td>${formatCurrency(row.startBalance)}</td>
          <td>${formatCurrency(row.endBalance)}</td>
          <td class="extra-col">${showExtra ? formatCurrency(row.extraEndBalance) : '-'}</td>
        `;
        mobileAmortizationBody.appendChild(tr);
      });

    } else {
      // Mobile monthly view (simplified)
      mobileAmortizationHeadHTML = `
        <tr>
          <th>Month</th>
          <th>End Balance</th>
          <th class="extra-col">End Balance (w/ Extra)</th>
        </tr>`;
      
      // Generate mobile table rows
      R.monthlyAmortization.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.month}</td>
          <td>${formatCurrency(row.endBalance)}</td>
          <td class="extra-col">${showExtra ? formatCurrency(row.extraEndBalance) : '-'}</td>
        `;
        mobileAmortizationBody.appendChild(tr);
      });
    }
    mobileAmortizationHead.innerHTML = mobileAmortizationHeadHTML;
  }
  
  // ==========================================================================
  // PERFORMANCE OPTIMIZATION: Debounced update function
  // ==========================================================================
  // Instead of updating immediately on every input change, we wait until
  // the user is done adjusting (using requestAnimationFrame)
  let updateRAFId = null;
    function scheduleFullUpdate() {
      if (updateRAFId) cancelAnimationFrame(updateRAFId);
      updateRAFId = requestAnimationFrame(() => { 
        updateUI(); 
        
        // ADD THIS: Update all slider visual fills after UI updates
        setTimeout(() => {
          document.querySelectorAll('input[type="range"]').forEach(slider => {
            updateRangeFill(slider);
          });
        }, 0);
        
        updateRAFId = null; 
      });
    }
  // ==========================================================================
  // MODE MANAGEMENT: Set calculation mode (default/DTI/payment)
  // ==========================================================================
  // function setMode(mode) {
  //   currentCalculationMode = mode;
  //   const loanCfg = loanTypeConfig[inputs.loanType.value];

  //   // Get references to DTI input elements
  //   const targetDtiGroupEl = containers.targetDtiInputGroup;
  //   const targetDTISliderEl = inputs.targetDTISlider;
  //   const targetDTINumberEl = inputs.targetDTINumber;

  //   // Handle DTI input state based on mode
  //   if (mode === 'dti') {
  //     // DTI mode: Enable custom DTI input
  //     targetDTISliderEl.disabled = false;
  //     targetDTINumberEl.disabled = false;
  //     targetDtiGroupEl.classList.remove('disabled-visual');
  //   } else {
  //     // Other modes: Disable DTI input
  //     targetDTISliderEl.disabled = true;
  //     targetDTINumberEl.disabled = true;
  //     targetDtiGroupEl.classList.add('disabled-visual');
      
  //     // Reset to default DTI for the loan type
  //     if (mode === 'default') {
  //       targetDTISliderEl.value = loanCfg.maxDtiTotalDefault;
  //       targetDTINumberEl.value = loanCfg.maxDtiTotalDefault;
  //     }
  //   }

  //   // Get references to payment target elements
  //   const targetPaymentGroupEl = containers.targetMonthlyPaymentInputGroup;
  //   const targetPaymentSliderEl = inputs.targetMonthlyPaymentSlider;
  //   const targetPaymentNumberEl = inputs.targetMonthlyPaymentNumber;
  //   const targetPaymentSectionEl = containers.targetPaymentInputSection;

  //   // Handle payment target input state based on mode
  //   if (mode === 'payment') {
  //     // Payment mode: Enable target payment input and expand section
  //     targetPaymentSliderEl.disabled = false;
  //     targetPaymentNumberEl.disabled = false;
  //     targetPaymentGroupEl.classList.remove('disabled-visual');
  //     targetPaymentSectionEl.style.opacity = "1";
  //     targetPaymentSectionEl.style.maxHeight = "200px";
  //   } else {
  //     // Other modes: Disable payment target input
  //     targetPaymentSliderEl.disabled = true;
  //     targetPaymentNumberEl.disabled = true;
  //     targetPaymentGroupEl.classList.add('disabled-visual');
  //     targetPaymentSectionEl.style.opacity = "0.6";
      
  //     if (mode === 'default') { 
  //       // Default mode: Collapse payment section completel
  //       targetPaymentSectionEl.style.maxHeight = "0";
  //     } else { 
  //       // Default mode: Collapse payment section completely
  //       targetPaymentSectionEl.style.maxHeight = "0";

  //     }
  //   }
    
  //   scheduleFullUpdate(); // Recalculate with new mode
  // }

  function setMode(mode) {
    currentCalculationMode = mode;
    const loanCfg = loanTypeConfig[inputs.loanType.value];

    // Get references to all input groups
    const targetDtiGroupEl = containers.targetDtiInputGroup;
    const targetDTISliderEl = inputs.targetDTISlider;
    const targetDTINumberEl = inputs.targetDTINumber;

    const targetPaymentGroupEl = containers.targetMonthlyPaymentInputGroup;
    const targetPaymentSliderEl = inputs.targetMonthlyPaymentSlider;
    const targetPaymentNumberEl = inputs.targetMonthlyPaymentNumber;

    const loanOverrideGroupEl = document.getElementById('loan-amount-override-group');
    const loanOverrideSliderEl = inputs.loanAmountOverrideSlider;
    const loanOverrideNumberEl = inputs.loanAmountOverrideNumber;

    // Helper function to enable/disable a group with opacity effect
    const setGroupState = (groupEl, sliderEl, numberEl, enabled) => {
      if (enabled) {
        sliderEl.disabled = false;
        numberEl.disabled = false;
        groupEl.classList.remove('disabled-visual');
      } else {
        sliderEl.disabled = true;
        numberEl.disabled = true;
        groupEl.classList.add('disabled-visual');
      }
    };

    // DEFAULT MODE: All three disabled
    if (mode === 'default') {
      // Reset DTI to loan default
      targetDTISliderEl.value = loanCfg.maxDtiTotalDefault;
      targetDTINumberEl.value = loanCfg.maxDtiTotalDefault;
      setGroupState(targetDtiGroupEl, targetDTISliderEl, targetDTINumberEl, false);
      
      setGroupState(targetPaymentGroupEl, targetPaymentSliderEl, targetPaymentNumberEl, false);
      
      // Clear override value
      loanOverrideSliderEl.value = 0;
      loanOverrideNumberEl.value = 0;
      setGroupState(loanOverrideGroupEl, loanOverrideSliderEl, loanOverrideNumberEl, false);
    }
    
    // DTI MODE: Enable DTI, disable others
    else if (mode === 'dti') {
      setGroupState(targetDtiGroupEl, targetDTISliderEl, targetDTINumberEl, true);
      setGroupState(targetPaymentGroupEl, targetPaymentSliderEl, targetPaymentNumberEl, false);
      
      // Clear override value
      loanOverrideSliderEl.value = 0;
      loanOverrideNumberEl.value = 0;
      setGroupState(loanOverrideGroupEl, loanOverrideSliderEl, loanOverrideNumberEl, false);
    }
    
    // PAYMENT MODE: Enable Payment, disable others
    else if (mode === 'payment') {
      setGroupState(targetPaymentGroupEl, targetPaymentSliderEl, targetPaymentNumberEl, true);
      setGroupState(targetDtiGroupEl, targetDTISliderEl, targetDTINumberEl, false);
      
      // Clear override value
      loanOverrideSliderEl.value = 0;
      loanOverrideNumberEl.value = 0;
      setGroupState(loanOverrideGroupEl, loanOverrideSliderEl, loanOverrideNumberEl, false);
    }
    
    // OVERRIDE MODE: Enable Override, disable DTI and Payment
    else if (mode === 'override') {
      setGroupState(loanOverrideGroupEl, loanOverrideSliderEl, loanOverrideNumberEl, true);
      setGroupState(targetDtiGroupEl, targetDTISliderEl, targetDTINumberEl, false);
      setGroupState(targetPaymentGroupEl, targetPaymentSliderEl, targetPaymentNumberEl, false);
    }
    
    scheduleFullUpdate();
  }


  // ==========================================================================
  // EVENT LISTENERS: Calculation mode radio buttons
  // ==========================================================================
  inputs.calculationModeOverrideRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
      if (event.target.checked) {
        setMode(event.target.value); // Switch to selected mode
      }
    });
  });
  
  // Clear mode button: Return to default mode
  inputs.clearModeButton.addEventListener('click', () => {
    inputs.calculationModeOverrideRadios.forEach(radio => radio.checked = false); 
    setMode('default');
  });

  // ==========================================================================
  // EVENT LISTENERS: Amortization view toggle (years vs months)
  // ==========================================================================
  inputs.amortizationViewRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
      if (event.target.checked) {
        amortizationViewMode = event.target.value;
        scheduleFullUpdate(); // Regenerate table
      }
    });
  });


  // ==========================================================================
  // EVENT HANDLER: Loan type change
  // ==========================================================================
  function handleLoanTypeChange() {
    const config = loanTypeConfig[inputs.loanType.value];
    loanTypeInfo.textContent = config.description; // Update description text
    
    // Reset DTI to default for new loan type (if in default or DTI mode)
    if (currentCalculationMode === 'default' || currentCalculationMode === 'dti') {
      inputs.targetDTISlider.value = config.maxDtiTotalDefault;
      inputs.targetDTINumber.value = config.maxDtiTotalDefault;
    }
    
    // USDA and VA loans allow zero down payment
    if (inputs.loanType.value === 'usda' || inputs.loanType.value === 'va') {
      inputs.downPaymentSlider.value = 0;
      inputs.downPaymentNumber.value = 0;
    }
    
    setMode(currentCalculationMode); // Re-apply current mode
  }
  
  // ==========================================================================
  // MODE MANAGEMENT: Set calculator mode (simple vs advanced)
  // ==========================================================================
  function setCalculatorMode(mode) {
    calculatorMode = mode;
    
    if (mode === 'simple') {
      // SIMPLE MODE
      calculatorContainer.classList.add('simple-mode'); // Add CSS class to show/hide elements
      simpleModeBtn.classList.add('active');
      advancedModeBtn.classList.remove('active');
      setSimpleCalcMode(simpleCalcMode); // Apply current simple calc mode
      
      // Transfer advanced mode values to simple mode inputs
      const currentLoanAmount = +inputs.loanAmountOverrideNumber.value || 0;
      const currentDownPayment = +inputs.downPaymentNumber.value || 50000;
      const currentHomePrice = currentLoanAmount + currentDownPayment;
      inputs.simpleLoanAmountSlider.value = currentHomePrice;
      inputs.simpleLoanAmountNumber.value = currentHomePrice;
    } else {
      // ADVANCED MODE
      calculatorContainer.classList.remove('simple-mode');
      advancedModeBtn.classList.add('active');
      simpleModeBtn.classList.remove('active');
      
      // Hide simple-only input fields (but keep the mode selector visible)
      document.querySelectorAll('.simple-affordability-only, .simple-home-price-only').forEach(el => {
        el.style.display = 'none';
      });
      
      // Transfer simple mode home price to loan override in advanced mode
      const simpleHomePrice = +inputs.simpleLoanAmountNumber.value;
      const downPayment = +inputs.downPaymentNumber.value;
      const calculatedLoan = Math.max(0, simpleHomePrice - downPayment);
      inputs.loanAmountOverrideSlider.value = calculatedLoan;
      inputs.loanAmountOverrideNumber.value = calculatedLoan;
    }
    
    scheduleFullUpdate();
  }

  // ==========================================================================
  // MODE MANAGEMENT: Set simple calculator mode (home-price vs affordability)
  // ==========================================================================
    function setSimpleCalcMode(mode) {
      simpleCalcMode = mode;
      
      const homePriceElements = document.querySelectorAll('.simple-home-price-only');
      const affordabilityElements = document.querySelectorAll('.simple-affordability-only');
      
      if (mode === 'home-price') {
        homePriceElements.forEach(el => el.style.display = 'block');
        affordabilityElements.forEach(el => el.style.display = 'none');
        
        // ADD THIS: Actually check the radio button
        const homePriceRadio = document.getElementById('simple-home-price');
        if (homePriceRadio) {
          homePriceRadio.checked = true;
        }
      } else {
        homePriceElements.forEach(el => el.style.display = 'none');
        affordabilityElements.forEach(el => el.style.display = 'block');
        
        // ADD THIS: Actually check the radio button
        const affordabilityRadio = document.getElementById('simple-affordability');
        if (affordabilityRadio) {
          affordabilityRadio.checked = true;
        }
      }
      
      scheduleFullUpdate();
    }

  // ==========================================================================
  // EVENT LISTENERS: Simple calculator mode radio buttons
  // ==========================================================================
  inputs.simpleCalcModeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
      if (event.target.checked) {
        setSimpleCalcMode(event.target.value);
      }
    });
  });

  // ==========================================================================
  // EVENT LISTENERS: Mode toggle buttons
  // ==========================================================================
  simpleModeBtn.addEventListener('click', () => setCalculatorMode('simple'));
  advancedModeBtn.addEventListener('click', () => setCalculatorMode('advanced'));

  // ==========================================================================
  // INPUT SYNCHRONIZATION: Sliders and number inputs
  // ==========================================================================
  // This array lists all slider/number input pairs that need to stay in sync
  const sliderNumberPairs = [
    { slider: inputs.simpleLoanAmountSlider, number: inputs.simpleLoanAmountNumber },
    { slider: inputs.simpleAnnualIncomeSlider, number: inputs.simpleAnnualIncomeNumber },
    { slider: inputs.simpleMonthlyDebtSlider, number: inputs.simpleMonthlyDebtNumber },
    { slider: inputs.targetDTISlider, number: inputs.targetDTINumber },
    { slider: inputs.targetMonthlyPaymentSlider, number: inputs.targetMonthlyPaymentNumber },
    { slider: inputs.loanAmountOverrideSlider, number: inputs.loanAmountOverrideNumber },
    { slider: inputs.downPaymentSlider, number: inputs.downPaymentNumber },
    { slider: inputs.interestRateSlider, number: inputs.interestRateNumber },
    { slider: inputs.sellerCreditsPercentSlider, number: inputs.sellerCreditsPercentNumber }, 
    { slider: inputs.loanTermSlider, number: inputs.loanTermNumber },
    { slider: inputs.propertyTaxSlider, number: inputs.propertyTaxNumber },
    { slider: inputs.insuranceSlider, number: inputs.insuranceNumber },
    { slider: inputs.hoaSlider, number: inputs.hoaNumber },
    { slider: inputs.additionalPaymentSlider, number: inputs.additionalPaymentNumber },
  ];

  // Set up event listeners for each pair
  sliderNumberPairs.forEach(pair => {
    // SLIDER INPUT: Update number input when slider moves
    pair.slider.addEventListener('input', () => {
      if (!pair.slider.disabled) { 
        if (pair.slider === inputs.loanTermSlider) {
          // Special handling for loan term: snap to valid values
          const snappedValue = snapToNearestLoanTerm(parseFloat(pair.slider.value));
          pair.number.value = snappedValue;
          pair.slider.value = snappedValue;
        } else {
          // Normal: Just copy slider value to number input
          pair.number.value = pair.slider.value;
        }
        scheduleFullUpdate();
      }
    });
    
    // NUMBER INPUT (while typing): Update slider in real-time
    pair.number.addEventListener('input', () => {
      if (!pair.number.disabled) {
        let value = parseFloat(pair.number.value);
        const min = parseFloat(pair.number.min);
        const max = parseFloat(pair.slider.max); 
        
        if (isNaN(value)) { 
          // Allow temporary invalid input (user still typing)
        } else {
          // Clamp value to min/max and update slider
          pair.slider.value = Math.min(Math.max(value, min), max); 
        }
        scheduleFullUpdate(); 
      }
    });
    
    // NUMBER INPUT (on blur/enter): Validate and snap to valid value
    pair.number.addEventListener('change', () => { 
      if (!pair.number.disabled) {
        let value = parseFloat(pair.number.value);
        const min = parseFloat(pair.number.min);
        const max = parseFloat(pair.slider.max); 
        const step = parseFloat(pair.number.step) || 1;

        // Validate and fix invalid values
        if (isNaN(value)) {
          value = min; // Default to minimum if invalid
        } else if (value < min) {
          value = min; // Clamp to minimum
        } else if (value > max) { 
          value = max; // Clamp to maximum
        } else {
          // Round to nearest step and handle special cases
          if (pair.number === inputs.loanTermNumber) {
            value = snapToNearestLoanTerm(value); // Snap loan term to valid years
          } else {
            value = Math.round(value / step) * step; // Round to step
            value = Math.min(Math.max(value, min), max); // Clamp
          }
        }
        
        // Update both inputs with validated value
        const decimals = (step.toString().split('.')[1] || '').length;
        pair.number.value = value.toFixed(decimals);
        pair.slider.value = value.toFixed(decimals);
        scheduleFullUpdate();
      }
    });
  });

  // ==========================================================================
  // EVENT LISTENER: Loan type dropdown
  // ==========================================================================
  inputs.loanType.addEventListener('change', handleLoanTypeChange);
  
  // ==========================================================================
  // INITIALIZATION FUNCTION: Set up calculator on page load
  // ==========================================================================
  function initialize() {
    // Clear all mode radio buttons
    inputs.calculationModeOverrideRadios.forEach(r => r.checked = false); 
    
    // Set to default calculation mode
    setMode('default'); 
    
    // Initialize loan type settings
    handleLoanTypeChange();
    
    // Start in simple mode
    setCalculatorMode('simple');
  }

  // ==========================================================================
  // SLIDER VISUAL ENHANCEMENT: Fill slider track up to thumb position
  // ==========================================================================
  // This creates a visual "fill" effect on range sliders
     function updateRangeFill(el) {
      const min = parseFloat(el.min) || 0;
      const max = parseFloat(el.max) || 100;
      const val = parseFloat(el.value) || 0;
      
      // Calculate the raw percentage
      const percentage = ((val - min) / (max - min)) * 100;
      
      // Account for your 36px wide pill thumb
      const thumbWidth = 36;
      const sliderWidth = el.offsetWidth;
      
      if (sliderWidth > 0) {
        // Calculate where the thumb CENTER is positioned
        const halfThumb = thumbWidth / 2; // 18px
        const availableRange = sliderWidth - thumbWidth;
        const thumbCenterPosition = halfThumb + (percentage / 100) * availableRange;
        
        // Convert thumb center position to percentage for gradient
        const fillPercentage = (thumbCenterPosition / sliderWidth) * 100;
        const clampedFill = Math.max(0, Math.min(100, fillPercentage));
        
        // Apply gradient with precise alignment
        el.style.background = `linear-gradient(
          to right,
          var(--text-color) 0%,
          var(--text-color) ${clampedFill}%,
          var(--input-bg-color) ${clampedFill}%,
          var(--input-bg-color) 100%
        )`;
      } else {
        // Fallback
        el.style.background = `linear-gradient(
          to right,
          var(--text-color) 0%,
          var(--text-color) ${percentage}%,
          var(--input-bg-color) ${percentage}%,
          var(--input-bg-color) 100%
        )`;
      }
    }

    // Keep your existing event listeners
    document.addEventListener('input', (e) => {
      if (!e.target.matches('input[type="range"]')) return;
      updateRangeFill(e.target);
    });

    // Add change event for final position
    document.addEventListener('change', (e) => {
      if (!e.target.matches('input[type="range"]')) return;
      updateRangeFill(e.target);
    });

    // Initialize with small delay to ensure elements are rendered
    setTimeout(() => {
      document.querySelectorAll('input[type="range"]').forEach(updateRangeFill);
    }, 100);

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        document.querySelectorAll('input[type="range"]').forEach(updateRangeFill);
      }, 150);
    });
  
  // ==========================================================================
  // EVENT DELEGATION: Update slider fill on any range input change
  // ==========================================================================
  // Using delegation so it works even for dynamically created sliders
  document.addEventListener('input', (e) => {
    if (!e.target.matches('input[type="range"]')) return; // Only handle range inputs
    updateRangeFill(e.target);
  });
  
  // ==========================================================================
  // INITIALIZE SLIDER FILLS: Run once on page load
  // ==========================================================================
  document.querySelectorAll('input[type="range"]')
    .forEach(updateRangeFill);

  // ==========================================================================
  // START THE CALCULATOR
  // ==========================================================================
  initialize();
});