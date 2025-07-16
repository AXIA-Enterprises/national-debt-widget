document.addEventListener('DOMContentLoaded', () => {
    fetchDebtAndPopulation();
});

async function fetchDebtAndPopulation() {
    try {
        // Fetch latest national debt from Treasury API
        const debtResponse = await fetch('https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?fields=tot_pub_debt_out_amt,record_date&sort=-record_date&page[size]=1');
        const debtData = await debtResponse.json();
        const debt = parseFloat(debtData.data[0].tot_pub_debt_out_amt);
        const recordDate = debtData.data[0].record_date;
        
        // Fetch latest US population estimate from Census API (use latest vintage year, e.g., 2024)
        const popResponse = await fetch('https://api.census.gov/data/2024/pep/population?get=POP,DATE_DESC&for=us:*');
        const popData = await popResponse.json();
        const population = parseInt(popData[1][0]);  // popData[1] is the data row, [0] is POP
        
        // Calculate per capita
        const perCapita = (debt / population).toFixed(2);
        
        // Update UI
        document.getElementById('debt').textContent = `$${debt.toLocaleString()} (as of ${recordDate})`;
        document.getElementById('population').textContent = population.toLocaleString();
        document.getElementById('per-capita').textContent = `$${perCapita}`;
        document.getElementById('last-updated').textContent = `Data last updated: ${recordDate}`;
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('debt').textContent = 'Error loading data';
    }
}

function calculateProjection() {
    const currentDebt = parseFloat(document.getElementById('debt').textContent.replace(/[^0-9.]/g, ''));
    const deficit = parseFloat(document.getElementById('deficit').value) * 1e12;  // Convert trillions to actual value
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const years = parseInt(document.getElementById('years').value);
    
    let projected = currentDebt;
    for (let i = 0; i < years; i++) {
        projected += deficit;  // Add annual deficit
        projected *= (1 + interestRate);  // Apply interest (simple compounding)
    }
    
    document.getElementById('projected-debt').textContent = `$${projected.toLocaleString()}`;
}