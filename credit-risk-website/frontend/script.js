// ==========================
// HAMBURGER MENU LOGIC
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });

        // Close nav when any link clicked (mobile)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
            });
        });
    }

    // Initialize page-specific logic
    const path = window.location.pathname;

    if (path.includes('predict.html')) {
        initPredictPage();
    } else if (path.includes('result.html')) {
        initResultPage();
    } else if (path.includes('history.html')) {
        initHistoryPage();
    }
});

// ==========================
// PREDICT PAGE LOGIC
// ==========================
function initPredictPage() {
    const form = document.getElementById('prediction-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide previous errors
        const errorMsg = document.getElementById('error-message');
        errorMsg.classList.add('hide');
        errorMsg.textContent = '';

        // Collect data
        const id = new Date().getTime(); // unique timestamp ID
        const dateObj = new Date();
        const dateStr = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY approx
        const timeStr = dateObj.toLocaleTimeString('en-US'); // HH:MM:SS AM/PM

        const payload = {
            id: id,
            name: document.getElementById('name').value.trim(),
            date: dateStr,
            time: timeStr,
            age: parseInt(document.getElementById('age').value),
            income: parseFloat(document.getElementById('income').value),
            loan_amount: parseFloat(document.getElementById('loan_amount').value),
            loan_duration: document.getElementById('loan_duration').value,
            credit_score: parseInt(document.getElementById('credit_score').value),
            employment_years: parseInt(document.getElementById('employment_years').value),
            existing_loans: parseInt(document.getElementById('existing_loans').value),
            loan_purpose: document.getElementById('loan_purpose').value
        };

        // Form Validation UI check (Browser HTML5 handled most, custom checks)
        if (payload.credit_score < 300 || payload.credit_score > 850) {
            showError("Credit Score must be between 300 and 850");
            return;
        }
        if (payload.age < 18 || payload.age > 70) {
            showError("Age must be between 18 and 70");
            return;
        }

        // Show Spinner
        const submitBtn = document.getElementById('submit-btn');
        const btnText = document.getElementById('btn-text');
        const spinner = document.getElementById('spinner');

        submitBtn.disabled = true;
        btnText.textContent = "Predicting...";
        spinner.classList.remove('hide');

        // Show wake-up message after 5 seconds
        const wakeMsg = setTimeout(() => {
            btnText.textContent = "Waking up server... (30s)";
        }, 5000);
        try {
            // Determine backend URL (handle local Live Server vs Flask hosting)
            const backendUrl = window.location.port === '5500' ? 'http://127.0.0.1:5001' : 'https://disparagingly-acrobatic-waylon.ngrok-free.app';

            // Fetch API POST to backend
            const response = await fetch(`${backendUrl}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'X-Pinggy-No-Screen': 'true'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMsg = "Server Error";
                try {
                    const errData = await response.json();
                    if (errData.error) errorMsg = errData.error;
                } catch (parseErr) {
                    // Fallback if response is not JSON (e.g., 404 HTML page)
                    errorMsg = `Server returned ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();

            // Add result to payload
            payload.result = data.result;
            payload.confidence = data.confidence;
            payload.message = data.message;
            payload.savedToHistory = false; // Flag to prevent duplicate saves

            // Save Temporary result
            // Save Temporary result
            localStorage.setItem('currentPrediction', JSON.stringify(payload));

            // Small delay to ensure localStorage is saved on mobile
            setTimeout(() => {
                window.location.href = 'result.html';
            }, 300);
        } catch (error) {
            showError(error.message || "Failed to connect to the server. Is it running?");
        } finally {
            clearTimeout(wakeMsg);
            submitBtn.disabled = false;
            btnText.textContent = "Predict";
            spinner.classList.add('hide');
        }
    });

    function showError(msg) {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = msg;
        errorEl.classList.remove('hide');
    }
}

// ==========================
// RESULT PAGE LOGIC
// ==========================
function initResultPage() {
    const currentDataStr = localStorage.getItem('currentPrediction');
    if (!currentDataStr) {
        window.location.href = 'predict.html';
        return;
    }

    const data = JSON.parse(currentDataStr);

    // Populate UI
    document.getElementById('result-user-name').textContent = `Prediction for ${data.name}`;

    const badge = document.getElementById('result-badge');
    badge.textContent = `${data.result} ${data.result === 'Low Risk' ? '🟢' : '🔴'}`;
    if (data.result === 'Low Risk') {
        badge.classList.add('low');
    } else {
        badge.classList.add('high');
    }

    document.getElementById('result-confidence').textContent = data.confidence;
    document.getElementById('result-message').textContent = data.message;

    // AUTO-SAVE to history logic
    if (!data.savedToHistory) {
        // Read history
        let history = JSON.parse(localStorage.getItem('creditRiskHistory') || '[]');

        // Remove 'savedToHistory' and 'message' for neatness if desired, but we can keep it
        const historyRecord = {
            id: data.id,
            name: data.name,
            date: data.date,
            time: data.time,
            age: data.age,
            income: `₹${data.income.toLocaleString('en-IN')}`,
            loan_amount: `₹${data.loan_amount.toLocaleString('en-IN')}`,
            loan_duration: data.loan_duration,
            credit_score: data.credit_score,
            employment_years: data.employment_years,
            existing_loans: `${data.existing_loans} Loan${data.existing_loans !== 1 ? 's' : ''}`,
            loan_purpose: data.loan_purpose,
            result: data.result,
            confidence: data.confidence
        };

        history.push(historyRecord);
        localStorage.setItem('creditRiskHistory', JSON.stringify(history));

        // Mark current as saved to prevent refresh duplicates
        data.savedToHistory = true;
        localStorage.setItem('currentPrediction', JSON.stringify(data));
    }
}

// ==========================
// HISTORY PAGE LOGIC
// ==========================
function initHistoryPage() {
    const container = document.getElementById('history-container');
    const emptyState = document.getElementById('empty-state');
    const searchBar = document.getElementById('search-bar');
    const clearBtn = document.getElementById('clear-all-btn');
    const totalCount = document.getElementById('total-count');

    let history = JSON.parse(localStorage.getItem('creditRiskHistory') || '[]');

    function renderHistory(dataToRender) {
        container.innerHTML = '';

        if (dataToRender.length === 0) {
            container.classList.add('hide');
            emptyState.classList.remove('hide');
            totalCount.textContent = `Total Records: 0`;
            return;
        }

        container.classList.remove('hide');
        emptyState.classList.add('hide');
        totalCount.textContent = `Total Records: ${dataToRender.length}`;

        // Reverse to show latest first
        const reversedData = [...dataToRender].reverse();

        reversedData.forEach(item => {
            const isLow = item.result === 'Low Risk';
            const riskClass = isLow ? 'low' : 'high';
            const riskIcon = isLow ? '🟢' : '🔴';

            const card = document.createElement('div');
            card.className = `history-card ${riskClass}`;
            card.innerHTML = `
                <div class="hc-section">
                    <div class="hc-header">
                        <strong>👤 ${item.name}</strong> <br>
                        📅 ${item.date} ${item.time} <br>
                        🏷️ Result: ${item.result} ${riskIcon} <br>
                        📊 Confidence: ${item.confidence}
                    </div>
                    <hr style="margin: 10px 0; border: 0; border-top: 1px dashed var(--border-color);">
                    <div class="hc-grid">
                        <div>💰 <strong>Income:</strong> ${item.income}</div>
                        <div>🏦 <strong>Loan:</strong> ${item.loan_amount}</div>
                        <div>⏳ <strong>Duration:</strong> ${item.loan_duration}</div>
                        <div>📈 <strong>Score:</strong> ${item.credit_score}</div>
                        <div>👔 <strong>Employment:</strong> ${item.employment_years} Yrs</div>
                        <div>📋 <strong>Existing:</strong> ${item.existing_loans}</div>
                        <div>🎯 <strong>Purpose:</strong> ${item.loan_purpose}</div>
                    </div>
                </div>
                <div class="hc-actions">
                    <button class="btn btn-danger btn-small delete-btn" data-id="${item.id}">🗑️ Delete</button>
                </div>
            `;
            container.appendChild(card);
        });

        // Add delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToDelete = parseInt(e.target.getAttribute('data-id'));
                deleteRecord(idToDelete);
            });
        });
    }

    function deleteRecord(id) {
        history = history.filter(item => item.id !== id);
        localStorage.setItem('creditRiskHistory', JSON.stringify(history));

        // Re-filter if search is active
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm) {
            const filtered = history.filter(item => item.name.toLowerCase().includes(searchTerm));
            renderHistory(filtered);
        } else {
            renderHistory(history);
        }
    }

    // Initial render
    renderHistory(history);

    // Search filter
    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = history.filter(item => item.name.toLowerCase().includes(searchTerm));
        renderHistory(filtered);
    });

    // Clear all
    clearBtn.addEventListener('click', () => {
        if (history.length === 0) return;
        if (confirm("Are you sure you want to clear all prediction history? This cannot be undone.")) {
            history = [];
            localStorage.setItem('creditRiskHistory', JSON.stringify(history));
            renderHistory(history);
            searchBar.value = '';
        }
    });
}
