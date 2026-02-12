// Load predictions when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPredictions();
    setupFilters();
});

// Load predictions from JSON file
async function loadPredictions() {
    try {
        const response = await fetch('predictions.json');
        const data = await response.json();
        
        // Update stats
        updateStats(data.stats);
        
        // Update last update time
        document.getElementById('lastUpdate').textContent = 
            `Last Updated: ${data.timestamp}`;
        
        // Display predictions
        displayPredictions(data.predictions);
        
    } catch (error) {
        console.error('Error loading predictions:', error);
        document.getElementById('predictions').innerHTML = 
            '<div class="loading">Error loading predictions. Please try again later.</div>';
    }
}

// Update stats cards
function updateStats(stats) {
    document.getElementById('totalGames').textContent = stats.total_games || '--';
    document.getElementById('highConfidence').textContent = stats.high_confidence || '--';
    document.getElementById('winRate7d').textContent = 
        stats.model_win_rate_7d ? (stats.model_win_rate_7d * 100).toFixed(1) + '%' : '--';
    document.getElementById('winRate30d').textContent = 
        stats.model_win_rate_30d ? (stats.model_win_rate_30d * 100).toFixed(1) + '%' : '--';
}

// Display predictions
function displayPredictions(predictions) {
    const container = document.getElementById('predictions');
    
    if (!predictions || predictions.length === 0) {
        container.innerHTML = '<div class="loading">No predictions available for today.</div>';
        return;
    }
    
    container.innerHTML = '';
    
    predictions.forEach(pred => {
        const card = createPredictionCard(pred);
        container.appendChild(card);
    });
}

// Create individual prediction card
function createPredictionCard(pred) {
    const card = document.createElement('div');
    card.className = 'prediction-card';
    
    // Determine if it's over or under
    const isUnder = pred.recommendation.includes('UNDER');
    
    // Set data attributes for filtering
    card.dataset.type = isUnder ? 'under' : 'over';
    
    // Determine confidence level
    const probability = typeof pred.probability === 'number' ? pred.probability : parseFloat(pred.probability);
    let confidenceClass = 'confidence-low';
    let confidenceText = 'Medium';
    
    if (probability >= 75 || probability <= 25) {
        confidenceClass = 'confidence-high';
        confidenceText = 'High';
        card.dataset.confidence = 'high';
    } else if (probability >= 65 && probability <= 35) {
        confidenceClass = 'confidence-medium';
        confidenceText = 'Medium';
        card.dataset.confidence = 'medium';
    } else {
        card.dataset.confidence = 'low';
    }
    
    // Format values
    const line = typeof pred.line === 'number' ? pred.line.toFixed(1) : pred.line;
    const expectedSO = typeof pred.expected_so === 'number' ? pred.expected_so.toFixed(1) : pred.expected_so;
    const probability_display = typeof pred.probability === 'number' ? pred.probability.toFixed(1) : pred.probability;
    
    card.innerHTML = `
        <div class="matchup">
            <span>${pred.pitcher_name}</span>
            <span class="vs-label">vs</span>
            <span>${pred.opponent}</span>
        </div>
        
        <div class="prediction-stats">
            <div class="stat-item">
                <div class="stat-item-label">Betting Line</div>
                <div class="stat-item-value">${line}</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Expected SO</div>
                <div class="stat-item-value">${expectedSO}</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Probability</div>
                <div class="stat-item-value">${probability_display}%</div>
            </div>
        </div>
        
        <div class="recommendation ${isUnder ? 'under' : 'over'}">
            ${pred.recommendation}
        </div>
        
        <span class="confidence-badge ${confidenceClass}">${confidenceText}</span>
    `;
    
    return card;
}

// Filter functionality
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter predictions
            const filter = btn.dataset.filter;
            filterPredictions(filter);
        });
    });
}

function filterPredictions(filter) {
    const cards = document.querySelectorAll('.prediction-card');
    
    cards.forEach(card => {
        let show = false;
        
        switch(filter) {
            case 'all':
                show = true;
                break;
            case 'high':
                show = card.dataset.confidence === 'high';
                break;
            case 'over':
                show = card.dataset.type === 'over';
                break;
            case 'under':
                show = card.dataset.type === 'under';
                break;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Optional: Auto-refresh every 5 minutes
// Uncomment if you want the page to automatically check for updates
// setInterval(loadPredictions, 5 * 60 * 1000);
