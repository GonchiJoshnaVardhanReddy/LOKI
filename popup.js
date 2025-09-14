document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      
      // Update active tab button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show selected tab content
      tabContents.forEach(content => content.classList.add('hidden'));
      document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    });
  });
  
  // Email analysis
  const analyzeEmailBtn = document.getElementById('analyze-email-btn');
  const emailContent = document.getElementById('email-content');
  const emailFile = document.getElementById('email-file');
  
  analyzeEmailBtn.addEventListener('click', analyzeEmail);
  
  // File upload for email
  emailFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      emailContent.value = e.target.result;
    };
    reader.readAsText(file);
  });
  
  // File analysis
  const analyzeFileBtn = document.getElementById('analyze-file-btn');
  const maliciousFile = document.getElementById('malicious-file');
  
  analyzeFileBtn.addEventListener('click', analyzeFile);
  
  // New analysis button
  const newAnalysisBtn = document.getElementById('new-analysis-btn');
  newAnalysisBtn.addEventListener('click', resetAnalysis);
  
  // Check if model is loaded
  chrome.runtime.sendMessage({ action: 'getModelStatus' }, response => {
    if (!response || !response.loaded) {
      showError('Model not loaded. Using pattern-based analysis.');
    }
  });
});

function analyzeEmail() {
  const content = document.getElementById('email-content').value.trim();
  
  if (!content) {
    showError('Please enter email content or upload a file.');
    return;
  }
  
  showLoading(true);
  
  chrome.runtime.sendMessage(
    { action: 'analyzeEmail', content: content },
    response => {
      showLoading(false);
      
      if (response.error) {
        showError(response.error);
        return;
      }
      
      displayResults(response);
    }
  );
}

function analyzeFile() {
  const fileInput = document.getElementById('malicious-file');
  const file = fileInput.files[0];
  
  if (!file) {
    showError('Please select a file to analyze.');
    return;
  }
  
  showLoading(true);
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const fileData = new Uint8Array(e.target.result);
    
    chrome.runtime.sendMessage(
      { 
        action: 'analyzeFile', 
        fileData: Array.from(fileData),
        fileName: file.name 
      },
      response => {
        showLoading(false);
        
        if (response.error) {
          showError(response.error);
          return;
        }
        
        displayFileResults(response);
      }
    );
  };
  reader.readAsArrayBuffer(file);
}

function displayResults(result) {
  // Hide analysis UI and show results
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.add('hidden');
  });
  document.getElementById('results').classList.remove('hidden');
  
  // Update score meter
  const scorePercent = Math.round(result.score * 100);
  const meterFill = document.getElementById('meter-fill');
  const scoreText = document.getElementById('score-text');
  
  meterFill.style.width = `${scorePercent}%`;
  scoreText.textContent = `${scorePercent}%`;
  
  // Set meter color based on score
  if (scorePercent < 30) {
    meterFill.style.backgroundColor = '#2ecc71';
  } else if (scorePercent < 70) {
    meterFill.style.backgroundColor = '#f39c12';
  } else {
    meterFill.style.backgroundColor = '#e74c3c';
  }
  
  // Update verdict
  const verdictEl = document.getElementById('verdict');
  verdictEl.textContent = result.isPhishing ? 
    'This content appears to be phishing!' : 
    'This content appears to be legitimate.';
  verdictEl.style.color = result.isPhishing ? '#e74c3c' : '#2ecc71';
  
  // Display features
  const featuresList = document.getElementById('features-list');
  featuresList.innerHTML = '';
  
  if (result.features && result.features.length > 0) {
    result.features.forEach(feature => {
      const featureEl = document.createElement('div');
      featureEl.classList.add('feature-item');
      featureEl.textContent = feature;
      featuresList.appendChild(featureEl);
    });
  } else {
    featuresList.innerHTML = '<p>No suspicious features detected.</p>';
  }
}

function displayFileResults(result) {
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.add('hidden');
  });
  document.getElementById('results').classList.remove('hidden');
  
  const scorePercent = Math.round(result.riskScore * 100);
  const meterFill = document.getElementById('meter-fill');
  const scoreText = document.getElementById('score-text');
  
  meterFill.style.width = `${scorePercent}%`;
  scoreText.textContent = `${scorePercent}%`;
  
  if (scorePercent < 30) {
    meterFill.style.backgroundColor = '#2ecc71';
  } else if (scorePercent < 70) {
    meterFill.style.backgroundColor = '#f39c12';
  } else {
    meterFill.style.backgroundColor = '#e74c3c';
  }
  
  const verdictEl = document.getElementById('verdict');
  verdictEl.textContent = result.isMalicious ? 
    '⚠️ This file appears to be malicious!' : 
    '✅ This file appears to be safe.';
  verdictEl.style.color = result.isMalicious ? '#e74c3c' : '#2ecc71';
  
  const featuresList = document.getElementById('features-list');
  featuresList.innerHTML = '';
  
  if (result.detectedFeatures && result.detectedFeatures.length > 0) {
    result.detectedFeatures.forEach(feature => {
      const featureEl = document.createElement('div');
      featureEl.classList.add('feature-item');
      featureEl.textContent = feature;
      featuresList.appendChild(featureEl);
    });
  } else {
    featuresList.innerHTML = '<p>No suspicious features detected.</p>';
  }
  
  const fileInfo = document.createElement('div');
  fileInfo.innerHTML = `<p><strong>File Type:</strong> ${result.fileType}</p>
                       <p><strong>File Size:</strong> ${result.fileSize} bytes</p>`;
  featuresList.parentNode.insertBefore(fileInfo, featuresList);
}

function resetAnalysis() {
  document.getElementById('email-content').value = '';
  document.getElementById('email-file').value = '';
  document.getElementById('malicious-file').value = '';
  
  document.getElementById('results').classList.add('hidden');
  document.getElementById('email-tab').classList.remove('hidden');
  
  document.querySelectorAll('.tab-btn').forEach((btn, index) => {
    btn.classList.remove('active');
    if (index === 0) btn.classList.add('active');
  });
  
  hideError();
}

function showLoading(show) {
  const loadingEl = document.getElementById('loading');
  if (show) {
    loadingEl.classList.remove('hidden');
  } else {
    loadingEl.classList.add('hidden');
  }
}

function showError(message) {
  const errorEl = document.getElementById('error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function hideError() {
  const errorEl = document.getElementById('error');
  errorEl.classList.add('hidden');
}