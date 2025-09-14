// Background service worker for PhishGuard AI
let model = null;
let isModelLoaded = false;

console.log('PhishGuard AI background service worker loaded');

// Load TensorFlow.js and the model
async function loadModel() {
  try {
    console.log('Starting model loading process...');
    
    // Import TensorFlow.js from the libs folder
    const tfjsScript = chrome.runtime.getURL('libs/tensorflow.js');
    await import(tfjsScript);
    console.log('TensorFlow.js loaded successfully');
    
    // Now load the pre-trained model
    const modelUrl = chrome.runtime.getURL('models/model.json');
    model = await tf.loadLayersModel(modelUrl);
    
    console.log('ML Model loaded successfully');
    isModelLoaded = true;
    return true;
  } catch (error) {
    console.error('Error loading model:', error);
    isModelLoaded = false;
    return false;
  }
}

// Initialize when extension starts
loadModel().then(success => {
  if (success) {
    console.log('PhishGuard AI initialized successfully with ML model');
  } else {
    console.log('PhishGuard AI running with simulated analysis');
  }
});

// Analyze email content
async function analyzeEmail(content) {
  if (!isModelLoaded) {
    console.log('ML model not available, using simulated analysis');
    return simulateAnalysis(content);
  }
  
  try {
    // Preprocess the text
    const processedText = preprocessText(content);
    
    // In a real implementation, we would convert text to tensors
    // For now, use simulated analysis
    const phishingProbability = calculatePhishingProbability(content);
    const features = extractSuspiciousFeatures(content);
    
    return {
      score: phishingProbability,
      isPhishing: phishingProbability > 0.5,
      features: features,
      usedML: false // Simulated for now
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return simulateAnalysis(content);
  }
}

// Simulated analysis fallback
function simulateAnalysis(content) {
  const phishingProbability = calculatePhishingProbability(content);
  const features = extractSuspiciousFeatures(content);
  
  return {
    score: phishingProbability,
    isPhishing: phishingProbability > 0.5,
    features: features,
    usedML: false
  };
}

// Calculate phishing probability based on patterns
function calculatePhishingProbability(text) {
  let score = 0;
  const lowerText = text.toLowerCase();
  
  // Urgent language patterns
  const urgentPatterns = [
    'urgent', 'immediately', 'action required', 'verify your account',
    'suspended', 'security alert', 'account verification', 'limited time',
    'click here', 'bank account', 'password expired'
  ];
  
  urgentPatterns.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      score += 0.1;
    }
  });
  
  // Suspicious link patterns
  const linkRegex = /https?:\/\/[^\s]+/g;
  const links = text.match(linkRegex) || [];
  
  links.forEach(link => {
    if (link.includes('@') || link.split('/')[2].includes('-')) {
      score += 0.15;
    }
  });
  
  // Grammar and style patterns
  const suspiciousPatterns = [
    /dear (customer|user|valued)/i,
    /click (here|below|link)/i,
    /bank.*account/i,
    /password.*expir/i,
    /unusual activity/i,
    /social security/i,
    /credit card/i
  ];
  
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      score += 0.08;
    }
  });
  
  // Cap score at 0.95 (never 100% certain)
  return Math.min(0.95, score);
}

// Extract suspicious features from text
function extractSuspiciousFeatures(text) {
  const features = [];
  const lowerText = text.toLowerCase();
  
  // Check for urgent language
  const urgentPatterns = [
    'urgent', 'immediately', 'action required', 'verify your account',
    'suspended', 'security alert', 'account verification'
  ];
  
  urgentPatterns.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      features.push(`Urgent language detected: "${pattern}"`);
    }
  });
  
  // Check for suspicious links
  const linkRegex = /https?:\/\/[^\s]+/g;
  const links = text.match(linkRegex) || [];
  
  links.forEach(link => {
    if (link.includes('@') || 
        link.split('/')[2].includes('-') || 
        !link.includes('.') ||
        link.length > 50) {
      features.push(`Suspicious link: ${link.substring(0, 50)}...`);
    }
  });
  
  // Check for grammar issues
  const grammarIssues = [
    /dear (customer|user|valued)/i,
    /click (here|below|link)/i,
    /bank.*account/i,
    /password.*expir/i
  ];
  
  grammarIssues.forEach(pattern => {
    if (pattern.test(text)) {
      features.push(`Suspicious pattern: ${pattern.source}`);
    }
  });
  
  return features;
}

// Preprocess text for the model
function preprocessText(text) {
  // Convert to lowercase and remove special characters
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// File analysis with sandbox
async function analyzeFileWithSandbox(fileData, fileName) {
  return new Promise((resolve, reject) => {
    // Create sandbox iframe
    const sandboxUrl = chrome.runtime.getURL('sandbox.html');
    const iframe = document.createElement('iframe');
    iframe.sandbox = 'allow-scripts allow-same-origin';
    iframe.style.display = 'none';
    iframe.src = sandboxUrl;
    
    document.body.appendChild(iframe);
    
    // Listen for messages from sandbox
    const messageHandler = (event) => {
      if (event.data.action === 'sandboxAnalysisComplete') {
        document.body.removeChild(iframe);
        window.removeEventListener('message', messageHandler);
        resolve(event.data.result);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Send file data to sandbox after it loads
    iframe.onload = () => {
      iframe.contentWindow.postMessage({
        action: 'analyzeFileInSandbox',
        fileData: Array.from(fileData),
        fileName: fileName
      }, '*');
    };
    
    // Timeout for safety
    setTimeout(() => {
      document.body.removeChild(iframe);
      window.removeEventListener('message', messageHandler);
      reject(new Error('Sandbox analysis timeout'));
    }, 30000);
  });
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeEmail') {
    analyzeEmail(request.content)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  
  if (request.action === 'analyzeFile') {
    analyzeFileWithSandbox(new Uint8Array(request.fileData), request.fileName)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  
  if (request.action === 'getModelStatus') {
    sendResponse({ loaded: isModelLoaded });
  }
});