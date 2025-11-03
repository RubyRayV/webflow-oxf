document.addEventListener("DOMContentLoaded", () => {
      let currentCalculationMode = 'default'; 
      let amortizationViewMode = 'years';
      let calculatorMode = 'simple'; // 'simple' or 'advanced'
      let simpleCalcMode = 'home-price'; // 'home-price' or 'affordability'

      const validLoanTerms = [5, 10, 15, 20, 25, 30, 35, 40];
      
      function snapToNearestLoanTerm(value) {
        let nearest = validLoanTerms[0];
        let minDiff = Math.abs(value - nearest);
        
        for (let term of validLoanTerms) {
          const diff = Math.abs(value - term);
          if (diff < minDiff) {
            minDiff = diff;
            nearest = term;
          }
        }
        return nearest;
      }

      const inputs = {
        loanType: document.getElementById("loan-type"),
        calculationModeOverrideRadios: document.querySelectorAll('input[name="calculation-mode-override"]'),
        clearModeButton: document.getElementById("clear-mode-button"),
        amortizationViewRadios: document.querySelectorAll('input[name="amortization-view"]'),
        simpleCalcModeRadios: document.querySelectorAll('input[name="simple-calc-mode"]'), 

        simpleLoanAmountSlider: document.getElementById("simple-loan-amount-slider"),
        simpleLoanAmountNumber: document.getElementById("simple-loan-amount-number"),
        simpleAnnualIncomeSlider: document.getElementById("simple-annual-income-slider"),
        simpleAnnualIncomeNumber: document.getElementById("simple-annual-income-number"),
        simpleMonthlyDebtSlider: document.getElementById("simple-monthly-debt-slider"),
        simpleMonthlyDebtNumber: document.getElementById("simple-monthly-debt-number"),

        annualIncomeSlider: document.getElementById("annual-income-slider"),
        annualIncomeNumber: document.getElementById("annual-income-number"),
        monthlyDebtSlider: document.getElementById("monthly-debt-slider"),
        monthlyDebtNumber: document.getElementById("monthly-debt-number"),
        targetDTISlider: document.getElementById("target-dti-slider"),
        targetDTINumber: document.getElementById("target-dti-number"),
        targetMonthlyPaymentSlider: document.getElementById("target-monthly-payment-slider"),
        targetMonthlyPaymentNumber: document.getElementById("target-monthly-payment-number"),
        loanAmountOverrideSlider: document.getElementById("loan-amount-override-slider"),
        loanAmountOverrideNumber: document.getElementById("loan-amount-override-number"),
        clearLoanOverrideButton: document.getElementById("clear-loan-override-button"),
        downPaymentSlider: document.getElementById("down-payment-slider"),
        downPaymentNumber: document.getElementById("down-payment-number"),
        interestRateSlider: document.getElementById("interest-rate-slider"), 
        interestRateNumber: document.getElementById("interest-rate-number"),
        sellerCreditsPercentSlider: document.getElementById("seller-credits-percent-slider"),
        sellerCreditsPercentNumber: document.getElementById("seller-credits-percent-number"),
        sellerCreditsDollarValue: document.getElementById("seller-credits-dollar-value"),
        sellerCreditsTooltipContent: document.getElementById("seller-credits-tooltip-content"),
        loanTermSlider: document.getElementById("loan-term-slider"),
        loanTermNumber: document.getElementById("loan-term-number"),
        propertyTaxSlider: document.getElementById("property-tax-slider"),
        propertyTaxNumber: document.getElementById("property-tax-number"),
        insuranceSlider: document.getElementById("insurance-slider"),
        insuranceNumber: document.getElementById("insurance-number"),
        hoaSlider: document.getElementById("hoa-slider"),
        hoaNumber: document.getElementById("hoa-number"),
        additionalPaymentSlider: document.getElementById("additional-payment-slider"),
        additionalPaymentNumber: document.getElementById("additional-payment-number"),
      };

      const results = {
        homePrice: document.getElementById("result-home-price"),
        loanAmount: document.getElementById("result-loan-amount"),
        downPaymentSimple: document.getElementById("result-down-payment-simple"),
        effectiveInterestRate: document.getElementById("result-effective-interest-rate"),
        ltv: document.getElementById("result-ltv"),
        monthlyPayment: document.getElementById("result-monthly-payment"),
        piSimple: document.getElementById("result-pi-simple"),
        taxSimple: document.getElementById("result-tax-simple"),
        insuranceSimple: document.getElementById("result-insurance-simple"),
        pmiContainerSimple: document.getElementById("result-pmi-container-simple"),
        pmiLabelSimple: document.getElementById("result-pmi-label-simple"),
        pmiSimple: document.getElementById("result-pmi-simple"),
        totalPaid: document.getElementById("result-total-paid"),
        totalInterest: document.getElementById("result-total-interest"),
        payoffDateSimple: document.getElementById("result-payoff-date-simple"),
        downPaymentSummary: document.getElementById("result-down-payment-summary"),
        sellerCreditsApplied: document.getElementById("result-seller-credits-applied"),
        estimatedCashToClose: document.getElementById("result-estimated-cash-to-close"),
        pi: document.getElementById("result-pi"),
        tax: document.getElementById("result-tax"),
        insurance: document.getElementById("result-insurance"),
        // Added HOA result element
        hoa: document.getElementById("result-hoa"),
        pmiContainer: document.getElementById("result-pmi-container"),
        pmiLabel: document.getElementById("result-pmi-label"),
        pmiTooltipContent: document.getElementById("pmi-mip-tooltip-content"),
        pmi: document.getElementById("result-pmi"),
        housingDTI: document.getElementById("result-housing-dti"),
        totalDTI: document.getElementById("result-total-dti"),
        timeSaved: document.getElementById("result-time-saved"),
        interestSaved: document.getElementById("result-interest-saved"),
        payoffDate: document.getElementById("result-payoff-date"),
        pmiDropoffExtraContainer: document.getElementById("result-pmi-dropoff-extra-container"),
        pmiDropoffExtraDate: document.getElementById("result-pmi-dropoff-extra-date"),
        effectiveRate: document.getElementById("result-effective-rate"), 
      };
      const containers = {
        modeSelector: document.querySelector('.mode-selector-container'),
        annualIncomeGroup: document.getElementById('annual-income-group'),
        monthlyDebtGroup: document.getElementById('monthly-debt-group'),
        targetDtiInputGroup: document.getElementById("target-dti-input-group"),
        targetMonthlyPaymentInputGroup: document.getElementById("target-monthly-payment-input-group"),
        targetPaymentInputSection: document.getElementById("target-payment-input-section"),
        extraPaymentResults: document.getElementById("extra-payment-results"),
      };
      const amortizationHead = document.getElementById("amortization-head");
      const amortizationBody = document.getElementById("amortization-body");
      const loanTypeInfo = document.getElementById("loan-type-info");
      const downPaymentWarning = document.getElementById("down-payment-warning");

      const simpleModeBtn = document.getElementById("simple-mode-btn");
      const advancedModeBtn = document.getElementById("advanced-mode-btn");
      const calculatorContainer = document.querySelector(".calculator-container");
      const simpleLoanAmountGroup = document.getElementById("simple-loan-amount-group");
      const simpleCalcModeToggle = document.getElementById("simple-calc-mode-toggle"); 

      const loanTypeConfig = {
        conventional: { 
            name: "Conventional", 
            minDownPayment: 0.03, 
            maxDtiTotalDefault: 43, 
            requiresPmi: true, 
            pmiThreshold: 0.2, 
            pmiTargetLtvLower: 78, 
            pmiTargetLtvUpper: 80, 
            canRemovePmi: true,
            description: "Standard mortgage. PMI usually required if down payment < 20%.",
            getMaxSellerCreditPercent: (dpPercent) => { 
                if (dpPercent < 0.10) return 0.03; 
                if (dpPercent < 0.25) return 0.06; 
                return 0.09; 
            },
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
        fha: { 
            name: "FHA", 
            minDownPayment: 0.035, 
            maxDtiTotalDefault: 43, 
            requiresPmi: true, 
            pmiThreshold: 0.0, 
            pmiTargetLtvLower: 78, 
            pmiTargetLtvUpper: 80, 
            canRemovePmi: false,
            description: "FHA-insured. Allows lower down payments. Includes MIP.",
            getMaxSellerCreditPercent: () => 0.06,
            getPmiDropoffTooltip: (ltv, initialLtv, loanTermMonths, currentMonth) => {
                if (initialLtv <= 0.90 && loanTermMonths > 132 && currentMonth >= 132) {
                    return `MIP has been removed after 11 years (132 months) as initial LTV was ≤ 90%.`;
                } else if (initialLtv <= 0.90 && loanTermMonths > 132) {
                    return `LTV at ${formatPercent(ltv, 1)}. MIP will be removed after 11 years (132 months) as initial LTV was ≤ 90%.`;
                } else {
                    return `LTV at ${formatPercent(ltv, 1)}. MIP remains for the life of the loan. Consider refinancing to a conventional loan when LTV reaches 80% to eliminate mortgage insurance.`;
                }
            }
        },
        va: { 
            name: "VA", 
            minDownPayment: 0, 
            maxDtiTotalDefault: 41, 
            requiresPmi: false, 
            pmiThreshold: 0, 
            pmiTargetLtvLower: 0, 
            pmiTargetLtvUpper: 0, 
            canRemovePmi: false,
            description: "For eligible veterans/military. Often no down payment/PMI.",
            getMaxSellerCreditPercent: () => 0.04,
            getPmiDropoffTooltip: () => ""
        },
        usda: { 
            name: "USDA", 
            minDownPayment: 0, 
            maxDtiTotalDefault: 41, 
            requiresPmi: true, 
            pmiThreshold: 0.0, 
            pmiTargetLtvLower: 0, 
            pmiTargetLtvUpper: 0, 
            canRemovePmi: false,
            description: "USDA Rural Development loan. No down payment required. Must meet income limits (typically 115% of area median income) and property must be in eligible rural/suburban area. Includes guarantee fee that remains for life of loan.",
            getMaxSellerCreditPercent: () => 0.06,
            getPmiDropoffTooltip: (ltv) => {
                return `LTV at ${formatPercent(ltv, 1)}. The USDA guarantee fee remains for the life of the loan and cannot be removed. Consider refinancing to a conventional loan when LTV reaches 80% to eliminate mortgage insurance.`;
            }
        }
      };

      const formatCurrency = val => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
      const formatPercent = (val, digits = 1) => `${Number(val).toFixed(digits)}%`;
      const formatYears = val => `${Number(val).toFixed(1)} years`;

      function deriveMonthlyRates({ nominalApr, monthlyTax, monthlyInsurance, monthlyHoa, annualIncome }) {
        const r_m = nominalApr/100/12; 
        const tau_m = monthlyTax;
        const ins_m = monthlyInsurance;
        const hoa_m = monthlyHoa;
        const I_m = annualIncome>0?annualIncome/12:0;
        return {r_m, tau_m, ins_m, hoa_m, I_m};
      }

      function computeMaxPiti({ targetDti, targetPayment, monthlyDebt }, I_m, cfgForAutoDti, mode) {
        if (mode === 'default') {
            return Math.max(0, I_m * (cfgForAutoDti.maxDtiTotalDefault / 100) - monthlyDebt);
        } else if (mode === 'dti') {
            return Math.max(0, I_m * (targetDti / 100) - monthlyDebt);
        } else { 
            return targetPayment;
        }
      }

      function estimateHomeAndLoan({pmiRate,pmiThreshold,requiresPmi}, PITI_max, r_m, tau_m, ins_m, hoa_m, n, downPayment) {
        let HP=0,L=0;
        for(let k=0;k<10;k++){ 
          const escrows = tau_m + ins_m + hoa_m;
          let pmi=0;
          if(requiresPmi&&HP>0&&pmiRate>0){
              const curLoan=Math.max(0,HP-downPayment);
              if (HP > 0 && curLoan / HP > 1 - pmiThreshold) pmi=(curLoan*pmiRate)/12;
          }
          const availPI=PITI_max-escrows-pmi;
          if(availPI<=0){HP=L=0;break;}
          L=r_m>0?availPI*((1-Math.pow(1+r_m,-n))/r_m):availPI*n;
          HP=L+downPayment;
        }
        return {homePrice:HP,loanAmount:L};
      }

      function computeBasePI(L,r_m,n){
        if(L<=0)return 0;
        if(r_m>0){const f=Math.pow(1+r_m,n);return(L*r_m*f)/(f-1);}return L/n;
      }

      function computeEscrowsAndPmi(HP,L,monthlyTax,monthlyInsurance,monthlyHoa,{requiresPmi,pmiThreshold,pmiRate}){
        const tax = monthlyTax;
        const insurance = monthlyInsurance;
        const hoa = monthlyHoa;
        let pmi=0;
        if(requiresPmi&&L>0&&HP>0&&pmiRate>0){
            if (L/HP > 1-pmiThreshold) pmi=(L*pmiRate)/12;
        }
        return{tax,insurance,hoa,pmi};
      }

      function computeDti(PITI,monthlyDebt,I_m){
        return{housingDti:I_m?PITI/I_m*100:0,totalDti:I_m?(PITI+monthlyDebt)/I_m*100:0};
      }

      function simulatePayoff(homePrice, loanAmount, basePI, extraPayment, r_m, n_original, cfg, loanTermYears) {
        let totalInterestNoExtra = 0;
        if (loanAmount > 0 && basePI > 0) {
            let balance = loanAmount;
            for (let m = 0; m < n_original; m++) {
                const interestThisMonth = balance * r_m; 
                totalInterestNoExtra += interestThisMonth;
                const principalThisMonth = basePI - interestThisMonth;
                balance -= principalThisMonth;
                if (balance <= 0.005) { balance = 0; break; }
            }
        }

        let monthsToPayoff = n_original;
        let totalInterestWithExtra = totalInterestNoExtra; 
        let pmiDropOffMonthsWithExtra = -1; 

        if (loanAmount > 0 && basePI > 0) {
            let balanceWithExtra = loanAmount;
            let currentMonths = 0;
            let currentTotalInterestWithExtra = 0;
            const totalMonthlyPaymentWithExtra = basePI + extraPayment;

            if (totalMonthlyPaymentWithExtra > balanceWithExtra * r_m || r_m === 0) {
                while (balanceWithExtra > 0.005 && currentMonths < n_original * 2) { 
                    const interestThisMonth = balanceWithExtra * r_m;
                    currentTotalInterestWithExtra += interestThisMonth;
                    const principalThisMonth = totalMonthlyPaymentWithExtra - interestThisMonth;
                    
                    if (principalThisMonth <= 0 && balanceWithExtra > 0.005 && extraPayment > 0) { 
                        currentMonths = n_original * 2; 
                        currentTotalInterestWithExtra = totalInterestNoExtra; 
                        break;
                    }
                    balanceWithExtra -= principalThisMonth;
                    currentMonths++;
                }
                if (balanceWithExtra <= 0.005 && extraPayment > 0) { 
                    monthsToPayoff = currentMonths;
                    totalInterestWithExtra = currentTotalInterestWithExtra;
                } else if (extraPayment === 0) {
                    monthsToPayoff = n_original;
                    totalInterestWithExtra = totalInterestNoExtra;
                }
            }
            if (cfg.requiresPmi && homePrice > 0 && extraPayment > 0) { 
                const initialLtv = loanAmount / homePrice;
                if (cfg.name === "Conventional") {
                    if (initialLtv > (1 - cfg.pmiThreshold)) { 
                        pmiDropOffMonthsWithExtra = monthsToPayoff; 
                        let tempBalanceConv = loanAmount;
                        let tempMonthsConv = 0;
                        if (totalMonthlyPaymentWithExtra > tempBalanceConv * r_m || r_m === 0) {
                            while (tempBalanceConv > 0.005 && tempMonthsConv < monthsToPayoff) {
                                const ltvCurrentConv = (tempBalanceConv / homePrice);
                                if (ltvCurrentConv <= (1 - cfg.pmiThreshold)) {
                                    pmiDropOffMonthsWithExtra = tempMonthsConv + 1;
                                    break;
                                }
                                const interestConv = tempBalanceConv * r_m;
                                const principalConv = totalMonthlyPaymentWithExtra - interestConv;
                                if (principalConv <= 0 && tempBalanceConv > 0.005) { break; }
                                tempBalanceConv -= principalConv;
                                tempMonthsConv++;
                            }
                        }
                    } else { pmiDropOffMonthsWithExtra = 0; }
                } else if (cfg.name === "FHA") {
                     if (initialLtv > 0) { 
                        if (loanTermYears * 12 > 132 && initialLtv <= 0.90) { 
                            pmiDropOffMonthsWithExtra = Math.min(132, monthsToPayoff);
                        } else { 
                            pmiDropOffMonthsWithExtra = monthsToPayoff;
                        }
                    }
                }
            }
        } else if (loanAmount <= 0) { 
            monthsToPayoff = 0;
            totalInterestWithExtra = 0;
        }
        
        const yearsSaved = Math.max(0, (n_original - monthsToPayoff) / 12);
        const interestSaved = Math.max(0, totalInterestNoExtra - totalInterestWithExtra);
        const payoffDate = new Date();
        if (monthsToPayoff > 0) payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);
        else payoffDate.setTime(new Date().getTime()); 

        return { monthsToPayoff, yearsSaved, interestSaved, payoffDate, totalInterestNoExtra, totalInterestWithExtra, pmiDropOffMonthsWithExtra };
      }

      function calculateAll(){
        const V={
          loanType: inputs.loanType.value,
          annualIncome: calculatorMode === 'simple' && simpleCalcMode === 'affordability' 
            ? +inputs.simpleAnnualIncomeNumber.value 
            : +inputs.annualIncomeNumber.value,
          monthlyDebt: calculatorMode === 'simple' && simpleCalcMode === 'affordability'
            ? +inputs.simpleMonthlyDebtNumber.value
            : +inputs.monthlyDebtNumber.value,
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
        

        const cfg={...loanTypeConfig[V.loanType]}; 
        if (V.loanType === 'fha') {
            cfg.pmiRate = 0.0055; 
        } else if (V.loanType === 'usda') {
            cfg.pmiRate = 0.0035;
        } else if (V.loanType === 'conventional' && cfg.requiresPmi) {
            cfg.pmiRate = 0.005; 
        } else {
            cfg.pmiRate = 0; 
        }

        const {r_m, tau_m, ins_m, hoa_m, I_m}=deriveMonthlyRates({
            nominalApr: V.interestRate, 
            monthlyTax: V.monthlyPropertyTax,
            monthlyInsurance: V.monthlyInsurance,
            monthlyHoa: V.monthlyHoa,
            annualIncome: V.annualIncome
        });
        
        let homePrice, loanAmount;
        if (calculatorMode === 'simple' && simpleCalcMode === 'home-price' && V.simpleHomePrice > 0) {
            homePrice = V.simpleHomePrice;
            loanAmount = Math.max(0, homePrice - V.downPayment);
        } else if (calculatorMode === 'simple' && simpleCalcMode === 'affordability') {
            // Use affordability calculation in simple mode
            const PITI_max = computeMaxPiti(V, I_m, cfg, 'default');
            const estimation = estimateHomeAndLoan(cfg, PITI_max, r_m, tau_m, ins_m, hoa_m, V.loanTerm*12, V.downPayment);
            homePrice = estimation.homePrice;
            loanAmount = estimation.loanAmount;
        } else if (V.loanAmountOverride > 0) {
            homePrice = V.loanAmountOverride;
            loanAmount = Math.max(0, homePrice - V.downPayment);
        } else {
            const PITI_max=computeMaxPiti(V,I_m, cfg, currentCalculationMode); 
            const estimation = estimateHomeAndLoan(cfg,PITI_max,r_m,tau_m,ins_m,hoa_m,V.loanTerm*12,V.downPayment);
            homePrice = estimation.homePrice;
            loanAmount = estimation.loanAmount;
        }
        
        const dpPercentForSellerCredit = homePrice > 0 ? V.downPayment / homePrice : 0;
        const maxAllowableSellerCreditPercent = cfg.getMaxSellerCreditPercent(dpPercentForSellerCredit) * 100; 
        
        V.sellerCreditsPercent = Math.min(V.sellerCreditsPercent, maxAllowableSellerCreditPercent);
        inputs.sellerCreditsPercentSlider.max = maxAllowableSellerCreditPercent.toFixed(1);
        inputs.sellerCreditsPercentNumber.max = maxAllowableSellerCreditPercent.toFixed(1);
        if (+inputs.sellerCreditsPercentNumber.value > maxAllowableSellerCreditPercent) {
             inputs.sellerCreditsPercentNumber.value = maxAllowableSellerCreditPercent.toFixed(1);
             inputs.sellerCreditsPercentSlider.value = maxAllowableSellerCreditPercent.toFixed(1);
        }

        const sellerCreditsDollarAmount = homePrice > 0 ? homePrice * (V.sellerCreditsPercent / 100) : 0;
        
        const requiredMinDownPayment = homePrice > 0 ? homePrice * cfg.minDownPayment : 0;
        
        let estimatedCashToClose = Math.max(0, V.downPayment - sellerCreditsDollarAmount);

        const basePI=computeBasePI(loanAmount,r_m,V.loanTerm*12);
        const {tax,insurance,hoa,pmi}=computeEscrowsAndPmi(homePrice,loanAmount,V.monthlyPropertyTax,V.monthlyInsurance,V.monthlyHoa,cfg);
        const PITI=basePI+tax+insurance+hoa+pmi;
        const displayedPayment=PITI+V.additionalPayment;
        const {housingDti,totalDti}=computeDti(PITI,V.monthlyDebt,I_m);
        
        const payoffDetails = simulatePayoff(homePrice, loanAmount, basePI,V.additionalPayment,r_m,V.loanTerm*12, cfg, V.loanTerm);

        let netEffectiveRateFromExtraPayments = V.interestRate; 
        if (V.additionalPayment > 0 && payoffDetails.totalInterestNoExtra > 0 && payoffDetails.totalInterestWithExtra < payoffDetails.totalInterestNoExtra) {
            netEffectiveRateFromExtraPayments = V.interestRate * (payoffDetails.totalInterestWithExtra / payoffDetails.totalInterestNoExtra);
        } else if (V.interestRate === 0 || payoffDetails.totalInterestNoExtra === 0) { 
            netEffectiveRateFromExtraPayments = 0;
        }
        netEffectiveRateFromExtraPayments = Math.max(0, netEffectiveRateFromExtraPayments);

        const ltv = homePrice > 0 ? (loanAmount / homePrice) * 100 : 0;
        
        const actualDownPaymentAmount = V.downPayment;
        const dpOK = actualDownPaymentAmount >= requiredMinDownPayment;
        
        let pmiDropOffDateWithExtra = null;
        if (payoffDetails.pmiDropOffMonthsWithExtra >= 0) { 
            pmiDropOffDateWithExtra = new Date();
            if (payoffDetails.pmiDropOffMonthsWithExtra > 0) {
                 pmiDropOffDateWithExtra.setMonth(pmiDropOffDateWithExtra.getMonth() + payoffDetails.pmiDropOffMonthsWithExtra);
            }
        }
        
        const initialLtv = homePrice > 0 ? (loanAmount / homePrice) * 100 : 0;
        
        const monthlyAmortization = [];
        if (loanAmount > 0 && homePrice > 0) {
            let bal = loanAmount, balX = loanAmount;
            for (let mo = 1; mo <= V.loanTerm * 12; mo++) {
                const paymentDate = new Date();
                paymentDate.setMonth(paymentDate.getMonth() + mo);

                let p = 0, i = 0, pX = 0, iX = 0;
                
                if (bal > 0.005) {
                    i = bal * r_m;
                    p = Math.min(bal, basePI - i);
                    bal -= p;
                    if (bal < 0.005) bal = 0;
                }
                if (balX > 0.005) {
                    iX = balX * r_m;
                    const paymentWithExtra = basePI + V.additionalPayment;
                    pX = Math.min(balX, paymentWithExtra - iX);
                    if (paymentWithExtra - iX < 0 && balX > 0.005 && V.additionalPayment > 0) { pX = 0; }
                    else { balX -= pX; }
                    if (balX < 0.005) balX = 0;
                }

                const ltvNoExtra = homePrice > 0 ? (bal / homePrice) * 100 : 101;
                const ltvWithExtra = homePrice > 0 ? (balX / homePrice) * 100 : 101;

                let pmiDropoffCandidate = false;
                let pmiTooltip = "";
                
                if (V.loanType === 'conventional' && cfg.requiresPmi) {
                    if (ltvNoExtra >= cfg.pmiTargetLtvLower && ltvNoExtra <= cfg.pmiTargetLtvUpper) {
                        pmiDropoffCandidate = true;
                        pmiTooltip = cfg.getPmiDropoffTooltip(ltvNoExtra);
                    }
                }
                else if (V.loanType === 'fha' && cfg.requiresPmi) {
                    const initialLtvRatio = loanAmount / homePrice;
                    if ((initialLtvRatio <= 0.90 && mo >= 132) || 
                        (ltvNoExtra >= cfg.pmiTargetLtvLower && ltvNoExtra <= cfg.pmiTargetLtvUpper && initialLtvRatio > 0.90)) {
                        pmiDropoffCandidate = true;
                        pmiTooltip = cfg.getPmiDropoffTooltip(ltvNoExtra, initialLtvRatio, V.loanTerm * 12, mo);
                    }
                }
                else if (V.loanType === 'usda' && cfg.requiresPmi) {
                    if (ltvNoExtra >= 78 && ltvNoExtra <= 80) {
                        pmiDropoffCandidate = true;
                        pmiTooltip = cfg.getPmiDropoffTooltip(ltvNoExtra);
                    }
                }

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

        return{
            V,
            cfg,
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

      function updateUI(){
        const R=calculateAll();
        const showExtra = R.loanAmount > 0 && R.V.additionalPayment > 0 && R.yearsSaved > 0.001; 

        const isLoanOverrideActive = R.V.loanAmountOverride > 0;
        containers.modeSelector.classList.toggle('disabled-visual', isLoanOverrideActive);
        containers.annualIncomeGroup.classList.toggle('disabled-visual', isLoanOverrideActive);
        containers.monthlyDebtGroup.classList.toggle('disabled-visual', isLoanOverrideActive);
        containers.targetDtiInputGroup.classList.toggle('disabled-visual', isLoanOverrideActive);
        containers.targetPaymentInputSection.classList.toggle('disabled-visual', isLoanOverrideActive);
        
        // Update inputs based on calculation results if needed (e.g., for display consistency)
        // This ensures the displayed input values reflect what was used in the calculation,
        // especially important when values are derived (e.g., from affordability)
        inputs.annualIncomeSlider.value = R.V.annualIncome;
        inputs.annualIncomeNumber.value = R.V.annualIncome;
        inputs.monthlyDebtSlider.value = R.V.monthlyDebt;
        inputs.monthlyDebtNumber.value = R.V.monthlyDebt;
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
        
        inputs.sellerCreditsPercentSlider.value = R.V.sellerCreditsPercent.toFixed(1);
        inputs.sellerCreditsPercentNumber.value = R.V.sellerCreditsPercent.toFixed(1);
        inputs.sellerCreditsDollarValue.textContent = `(${formatCurrency(R.sellerCreditsDollarAmount)})`;
        
        const maxSCPercent = R.maxAllowableSellerCreditPercent.toFixed(1);
        const maxSCDollar = formatCurrency(R.homePrice * (R.maxAllowableSellerCreditPercent / 100));
        let tooltipText = `Seller credits are a percentage of the home price (${formatCurrency(R.homePrice)}) that the seller contributes towards your closing costs. This reduces your out-of-pocket expenses. <br><br><strong>Current Max for ${R.cfg.name} loan: ${maxSCPercent}% (${maxSCDollar}).</strong><br>`;
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

        results.homePrice.textContent = formatCurrency(R.homePrice);
        results.loanAmount.textContent = formatCurrency(R.loanAmount);
        
        const downPaymentPercent = R.homePrice > 0 ? (R.V.downPayment / R.homePrice) * 100 : 0;
        results.downPaymentSimple.textContent = `${formatCurrency(R.V.downPayment)} (${formatPercent(downPaymentPercent, 1)})`;
        
        results.piSimple.textContent = formatCurrency(R.basePI);
        results.taxSimple.textContent = formatCurrency(R.tax);
        results.insuranceSimple.textContent = formatCurrency(R.insurance);
        
        results.pmiContainerSimple.classList.toggle('hidden', R.pmi <= 0);
        if (R.pmi > 0) {
            if (R.V.loanType === 'fha') {
                results.pmiLabelSimple.textContent = 'MIP';
            } else if (R.V.loanType === 'usda') {
                results.pmiLabelSimple.textContent = 'Guarantee Fee';
            } else {
                results.pmiLabelSimple.textContent = 'PMI';
            }
            results.pmiSimple.textContent = formatCurrency(R.pmi);
        }
        
        // For simple mode, total paid is calculated based on the displayed payment
        // and total interest is the calculated interest without extra payments.
        const totalPaidSimple = R.basePI * R.V.loanTerm * 12; 
        const totalInterestSimple = R.totalInterestNoExtra || 0; // Use the value from payoff simulation
        results.totalPaid.textContent = formatCurrency(totalPaidSimple);
        results.totalInterest.textContent = formatCurrency(totalInterestSimple);
        
        const payoffDateSimple = new Date();
        payoffDateSimple.setMonth(payoffDateSimple.getMonth() + (R.V.loanTerm * 12));
        results.payoffDateSimple.textContent = payoffDateSimple.toLocaleDateString();
        
        results.effectiveInterestRate.textContent = formatPercent(R.V.interestRate, 3);
        results.ltv.textContent = formatPercent(R.ltv, 1);
        results.monthlyPayment.textContent = `${formatCurrency(R.displayedPayment)}/mo`;

        // Advanced Mode Results (retained for context, but toggled by .advanced-only class)
        results.downPaymentSummary.textContent = formatCurrency(R.V.downPayment);
        results.sellerCreditsApplied.textContent = formatCurrency(R.sellerCreditsDollarAmount);
        results.estimatedCashToClose.textContent = formatCurrency(R.estimatedCashToClose);
        results.pi.textContent = formatCurrency(R.basePI);
        results.tax.textContent = formatCurrency(R.tax);
        results.insurance.textContent = formatCurrency(R.insurance);
        // Added HOA to results
        results.hoa.textContent = formatCurrency(R.hoa);
        
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

        results.housingDTI.textContent = formatPercent(R.housingDti);
        results.totalDTI.textContent = formatPercent(R.totalDti);

        containers.extraPaymentResults.classList.toggle('hidden', !showExtra);
        if (showExtra) {
            results.timeSaved.textContent = formatYears(R.yearsSaved);
            results.interestSaved.textContent = formatCurrency(R.interestSaved);
            results.payoffDate.textContent = R.payoffDate.toLocaleDateString();

            if (R.cfg.requiresPmi && R.pmi > 0 && R.pmiDropOffDateWithExtra && R.cfg.canRemovePmi) {
                 results.pmiDropoffExtraContainer.classList.remove('hidden');
                 results.pmiDropoffExtraDate.textContent = R.pmiDropOffDateWithExtra.toLocaleDateString();
            } else {
                results.pmiDropoffExtraContainer.classList.add('hidden');
            }
             results.effectiveRate.textContent = formatPercent(R.netEffectiveRateFromExtraPayments, 3); 
        } else {
             results.pmiDropoffExtraContainer.classList.add('hidden');
        }

        downPaymentWarning.classList.toggle('hidden', R.dpOK || R.homePrice <= 0);
        if (!R.dpOK && R.homePrice > 0) {
            downPaymentWarning.textContent = `Min down payment for ${R.cfg.name}: ${formatCurrency(R.requiredMinDownPayment)}`;
        }
        
        amortizationBody.innerHTML = ""; 
        if (amortizationViewMode === 'years') {
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
            
            const yearlyAmortization = [];
            for (let yr = 0; yr < R.V.loanTerm; yr++) {
                const yearData = R.monthlyAmortization.slice(yr * 12, (yr + 1) * 12);
                if (yearData.length === 0) break;

                const lastMonthOfYear = yearData[yearData.length - 1];
                
                const yearlyRow = {
                    year: yr + 1,
                    startBalance: yearData[0].endBalance + yearData[0].principal,
                    principal: yearData.reduce((sum, m) => sum + m.principal, 0),
                    interest: yearData.reduce((sum, m) => sum + m.interest, 0),
                    endBalance: lastMonthOfYear.endBalance,
                    ltvNoExtra: lastMonthOfYear.ltvNoExtra,
                    extraEndBalance: lastMonthOfYear.extraEndBalance,
                    ltvWithExtra: lastMonthOfYear.ltvWithExtra,
                    pmiDropoffCandidate: yearData.some(m => m.pmiDropoffCandidate),
                    pmiTooltip: yearData.find(m => m.pmiDropoffCandidate)?.pmiTooltip || "",
                    pmiDropoffCandidateExtra: yearData.some(m => m.pmiDropoffCandidateExtra),
                    pmiTooltipExtra: yearData.find(m => m.pmiDropoffCandidateExtra)?.pmiTooltipExtra || ""
                };
                yearlyAmortization.push(yearlyRow);
            }

            yearlyAmortization.forEach(row => {
                const tr = document.createElement("tr");
                
                let ltvNoExtraCell = `<td${row.pmiDropoffCandidate ? ' class="pmi-dropoff-candidate"' : ''}>
                    ${formatPercent(row.ltvNoExtra, 1)}
                    ${row.pmiDropoffCandidate && row.pmiTooltip ? `
                        <div class="tooltip">
                            <span class="tooltip-trigger">?</span>
                            <div class="tooltip-content">${row.pmiTooltip}</div>
                        </div>` : ''}
                </td>`;
                
                let ltvWithExtraCell = `<td class="${row.pmiDropoffCandidateExtra ? 'pmi-dropoff-candidate extra-col' : 'extra-col'}">
                    ${showExtra ? (row.ltvWithExtra > 100 ? '-' : formatPercent(row.ltvWithExtra, 1)) : '-'}
                    ${showExtra && row.pmiDropoffCandidateExtra && row.pmiTooltipExtra ? `
                        <div class="tooltip">
                            <span class="tooltip-trigger">?</span>
                            <div class="tooltip-content">${row.pmiTooltipExtra}</div>
                        </div>` : ''}
                </td>`;
                
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
            
            R.monthlyAmortization.forEach(row => {
                const tr = document.createElement("tr");
                
                let ltvNoExtraCell = `<td${row.pmiDropoffCandidate ? ' class="pmi-dropoff-candidate"' : ''}>
                    ${formatPercent(row.ltvNoExtra, 1)}
                    ${row.pmiDropoffCandidate && row.pmiTooltip ? `
                        <div class="tooltip">
                            <span class="tooltip-trigger">?</span>
                            <div class="tooltip-content">${row.pmiTooltip}</div>
                        </div>` : ''}
                </td>`;
                
                let ltvWithExtraCell = `<td class="${row.pmiDropoffCandidateExtra ? 'pmi-dropoff-candidate extra-col' : 'extra-col'}">
                    ${showExtra ? (row.ltvWithExtra > 100 ? '-' : formatPercent(row.ltvWithExtra, 1)) : '-'}
                    ${showExtra && row.pmiDropoffCandidateExtra && row.pmiTooltipExtra ? `
                        <div class="tooltip">
                            <span class="tooltip-trigger">?</span>
                            <div class="tooltip-content">${row.pmiTooltipExtra}</div>
                        </div>` : ''}
                </td>`;
                
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
      }
      
      let updateRAFId = null;
      function scheduleFullUpdate() {
        if (updateRAFId) cancelAnimationFrame(updateRAFId);
        updateRAFId = requestAnimationFrame(() => { updateUI(); updateRAFId = null; });
      }
      
      function setMode(mode) {
        currentCalculationMode = mode;
        const loanCfg = loanTypeConfig[inputs.loanType.value];

        const targetDtiGroupEl = containers.targetDtiInputGroup;
        const targetDTISliderEl = inputs.targetDTISlider;
        const targetDTINumberEl = inputs.targetDTINumber;

        if (mode === 'dti') {
            targetDTISliderEl.disabled = false;
            targetDTINumberEl.disabled = false;
            targetDtiGroupEl.classList.remove('disabled-visual');
        } else {
            targetDTISliderEl.disabled = true;
            targetDTINumberEl.disabled = true;
            targetDtiGroupEl.classList.add('disabled-visual');
            if (mode === 'default') {
                targetDTISliderEl.value = loanCfg.maxDtiTotalDefault;
                targetDTINumberEl.value = loanCfg.maxDtiTotalDefault;
            }
        }

        const targetPaymentGroupEl = containers.targetMonthlyPaymentInputGroup;
        const targetPaymentSliderEl = inputs.targetMonthlyPaymentSlider;
        const targetPaymentNumberEl = inputs.targetMonthlyPaymentNumber;
        const targetPaymentSectionEl = containers.targetPaymentInputSection;

        if (mode === 'payment') {
            targetPaymentSliderEl.disabled = false;
            targetPaymentNumberEl.disabled = false;
            targetPaymentGroupEl.classList.remove('disabled-visual');
            targetPaymentSectionEl.style.opacity = "1";
            targetPaymentSectionEl.style.maxHeight = "200px"; 
            targetPaymentSectionEl.style.padding = "1rem";
            targetPaymentSectionEl.style.border = "1px solid var(--border-color)";
        } else {
            targetPaymentSliderEl.disabled = true;
            targetPaymentNumberEl.disabled = true;
            targetPaymentGroupEl.classList.add('disabled-visual');
            targetPaymentSectionEl.style.opacity = "0.6";
            if (mode === 'default') { 
                 targetPaymentSectionEl.style.maxHeight = "0";
                 targetPaymentSectionEl.style.padding = "0 1rem"; 
                 targetPaymentSectionEl.style.borderWidth = "0 1px"; 
            } else { 
                 targetPaymentSectionEl.style.maxHeight = "200px";
                 targetPaymentSectionEl.style.padding = "1rem";
                 targetPaymentSectionEl.style.border = "1px solid var(--border-color)";
            }
        }
        scheduleFullUpdate();
      }

      inputs.calculationModeOverrideRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.checked) {
                setMode(event.target.value);
            }
        });
      });
      
      inputs.clearModeButton.addEventListener('click', () => {
        inputs.calculationModeOverrideRadios.forEach(radio => radio.checked = false); 
        setMode('default');
      });

      inputs.amortizationViewRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.checked) {
                amortizationViewMode = event.target.value;
                scheduleFullUpdate();
            }
        });
      });

      inputs.clearLoanOverrideButton.addEventListener('click', () => {
        inputs.loanAmountOverrideNumber.value = 0;
        inputs.loanAmountOverrideSlider.value = 0;
        scheduleFullUpdate();
      });

      function handleLoanTypeChange() {
        const config = loanTypeConfig[inputs.loanType.value];
        loanTypeInfo.textContent = config.description;
        
        if (currentCalculationMode === 'default' || currentCalculationMode === 'dti') {
            inputs.targetDTISlider.value = config.maxDtiTotalDefault;
            inputs.targetDTINumber.value = config.maxDtiTotalDefault;
        }
        
        if (inputs.loanType.value === 'usda' || inputs.loanType.value === 'va') {
            inputs.downPaymentSlider.value = 0;
            inputs.downPaymentNumber.value = 0;
        }
        
        setMode(currentCalculationMode); 
      }
      
      function setCalculatorMode(mode) {
        calculatorMode = mode;
        
        if (mode === 'simple') {
          calculatorContainer.classList.add('simple-mode');
          simpleModeBtn.classList.add('active');
          advancedModeBtn.classList.remove('active');
          simpleCalcModeToggle.style.display = 'block';
          simpleCalcModeToggle.classList.remove('advanced-only');
          setSimpleCalcMode(simpleCalcMode); // Apply current simple calc mode
          
          const currentLoanAmount = +inputs.loanAmountOverrideNumber.value || 400000;
          const currentDownPayment = +inputs.downPaymentNumber.value || 50000;
          const currentHomePrice = currentLoanAmount + currentDownPayment;
          inputs.simpleLoanAmountSlider.value = currentHomePrice;
          inputs.simpleLoanAmountNumber.value = currentHomePrice;
        } else {
          calculatorContainer.classList.remove('simple-mode');
          advancedModeBtn.classList.add('active');
          simpleModeBtn.classList.remove('active');
          simpleCalcModeToggle.style.display = 'none';
          simpleCalcModeToggle.classList.add('advanced-only');
          // Hide all simple-only elements
          document.querySelectorAll('.simple-affordability-only, .simple-home-price-only').forEach(el => {
            el.style.display = 'none';
          });
          
          const simpleHomePrice = +inputs.simpleLoanAmountNumber.value;
          const downPayment = +inputs.downPaymentNumber.value;
          const calculatedLoan = Math.max(0, simpleHomePrice - downPayment);
          inputs.loanAmountOverrideSlider.value = calculatedLoan;
          inputs.loanAmountOverrideNumber.value = calculatedLoan;
        }
        
        scheduleFullUpdate();
      }

      function setSimpleCalcMode(mode) {
        simpleCalcMode = mode;
        
        const homePriceElements = document.querySelectorAll('.simple-home-price-only');
        const affordabilityElements = document.querySelectorAll('.simple-affordability-only');
        
        if (mode === 'home-price') {
          homePriceElements.forEach(el => el.style.display = 'block');
          affordabilityElements.forEach(el => el.style.display = 'none');
        } else {
          homePriceElements.forEach(el => el.style.display = 'none');
          affordabilityElements.forEach(el => el.style.display = 'block');
        }
        
        scheduleFullUpdate();
      }

      inputs.simpleCalcModeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
          if (event.target.checked) {
            setSimpleCalcMode(event.target.value);
          }
        });
      });

      simpleModeBtn.addEventListener('click', () => setCalculatorMode('simple'));
      advancedModeBtn.addEventListener('click', () => setCalculatorMode('advanced'));
      
      const sliderNumberPairs = [
        { slider: inputs.simpleLoanAmountSlider, number: inputs.simpleLoanAmountNumber },
        { slider: inputs.simpleAnnualIncomeSlider, number: inputs.simpleAnnualIncomeNumber },
        { slider: inputs.simpleMonthlyDebtSlider, number: inputs.simpleMonthlyDebtNumber },
        { slider: inputs.annualIncomeSlider, number: inputs.annualIncomeNumber },
        { slider: inputs.monthlyDebtSlider, number: inputs.monthlyDebtNumber },
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

      sliderNumberPairs.forEach(pair => {
        pair.slider.addEventListener('input', () => {
            if (!pair.slider.disabled) { 
                if (pair.slider === inputs.loanTermSlider) {
                    const snappedValue = snapToNearestLoanTerm(parseFloat(pair.slider.value));
                    pair.number.value = snappedValue;
                    pair.slider.value = snappedValue;
                } else {
                    pair.number.value = pair.slider.value;
                }
                scheduleFullUpdate();
            }
        });
        pair.number.addEventListener('input', () => {
             if (!pair.number.disabled) {
                let value = parseFloat(pair.number.value);
                const min = parseFloat(pair.number.min);
                const max = parseFloat(pair.slider.max); 
                
                if (isNaN(value)) { 
                    // Allow temporary invalid input
                } else {
                     pair.slider.value = Math.min(Math.max(value, min), max); 
                }
                scheduleFullUpdate(); 
            }
        });
         pair.number.addEventListener('change', () => { 
            if (!pair.number.disabled) {
                let value = parseFloat(pair.number.value);
                const min = parseFloat(pair.number.min);
                const max = parseFloat(pair.slider.max); 
                const step = parseFloat(pair.number.step) || 1;

                if (isNaN(value)) {
                    value = min; 
                } else if (value < min) {
                    value = min;
                } else if (value > max) { 
                    value = max;
                } else {
                    if (pair.number === inputs.loanTermNumber) {
                        value = snapToNearestLoanTerm(value);
                    } else {
                        value = Math.round(value / step) * step;
                        value = Math.min(Math.max(value, min), max);
                    }
                }
                const decimals = (step.toString().split('.')[1] || '').length;
                pair.number.value = value.toFixed(decimals);
                pair.slider.value = value.toFixed(decimals);
                scheduleFullUpdate();
            }
        });
      });

      
      inputs.loanType.addEventListener('change', handleLoanTypeChange);
      
      function initialize() {
        inputs.calculationModeOverrideRadios.forEach(r => r.checked = false); 
        setMode('default'); 
        handleLoanTypeChange();
        setCalculatorMode('simple');
      }

       // helper so you can reuse it anywhere
      function updateRangeFill(el) {
        const min = +el.min || 0;
        const max = +el.max || 100;
        const val = +el.value;
        let pct = ((val - min) * 100) / (max - min);
        pct = Math.max(0, Math.min(100, pct)); // clamp
        el.style.background =
          `linear-gradient(to right, var(--primary-color) ${pct}%, var(--input-bg-color) ${pct}%)`;
      }
      
      // delegated listener (keeps working with dozens of sliders)
      document.addEventListener('input', (e) => {
        if (!e.target.matches('input[type="range"]')) return;
        updateRangeFill(e.target);
      });
      
      // init once
      document.querySelectorAll('input[type="range"]')
        .forEach(updateRangeFill);


      initialize();
    });


