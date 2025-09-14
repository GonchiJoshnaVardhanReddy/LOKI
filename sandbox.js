// Sandbox environment for safe file analysis
class FileSandbox {
    constructor() {
        this.initializeSandbox();
    }

    initializeSandbox() {
        console.log('File sandbox initialized');
        
        // Listen for messages from the background script
        window.addEventListener('message', (event) => {
            if (event.data.action === 'analyzeFileInSandbox') {
                this.analyzeFile(new Uint8Array(event.data.fileData), event.data.fileName);
            }
        });
    }

    async analyzeFile(fileData, fileName) {
        try {
            // Display file information
            this.displayFileInfo(fileData, fileName);
            
            // Perform comprehensive file analysis
            const analysisResult = await this.compreh+ensiveFileAnalysis(fileData, fileName);
            
            // Display results
            this.displayAnalysisResults(analysisResult);
            
            // Send results back to background script
            window.parent.postMessage({
                action: 'sandboxAnalysisComplete',
                result: analysisResult
            }, '*');
            
        } catch (error) {
            console.error('Sandbox analysis error:', error);
            this.displayError('Analysis failed: ' + error.message);
        }
    }

    displayFileInfo(fileData, fileName) {
        document.getElementById('filename').textContent = fileName;
        document.getElementById('filetype').textContent = this.getFileType(fileName);
        document.getElementById('filesize').textContent = this.formatFileSize(fileData.length);
    }

    async comprehensiveFileAnalysis(fileData, fileName) {
        const analysis = {
            fileName: fileName,
            fileType: this.getFileType(fileName),
            fileSize: fileData.length,
            riskScore: 0,
            isMalicious: false,
            detectedFeatures: [],
            warnings: []
        };

        // 1. File Type Analysis
        this.analyzeFileType(analysis, fileName);
        
        // 2. Content Analysis
        await this.analyzeFileContent(analysis, fileData, fileName);
        
        // 3. Structural Analysis
        this.analyzeFileStructure(analysis, fileData);
        
        // 4. Heuristic Analysis
        this.applyHeuristics(analysis);
        
        // Calculate final risk score
        analysis.riskScore = Math.min(1, Math.max(0, analysis.riskScore));
        analysis.isMalicious = analysis.riskScore > 0.7;
        
        return analysis;
    }

    analyzeFileType(analysis, fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const riskyExtensions = ['exe', 'bat', 'cmd', 'ps1', 'vbs', 'js', 'jar', 'scr'];
        
        if (riskyExtensions.includes(extension)) {
            analysis.riskScore += 0.3;
            analysis.detectedFeatures.push(`Risky file extension: .${extension}`);
        }
    }

    async analyzeFileContent(analysis, fileData, fileName) {
        try {
            const textContent = await this.extractTextContent(fileData, fileName);
            
            if (textContent) {
                // Check for suspicious patterns
                this.checkForSuspiciousPatterns(analysis, textContent);
                
                // Check for URLs and domains
                this.extractAndCheckUrls(analysis, textContent);
                
                // Check for encoded content
                this.checkForEncodedContent(analysis, textContent);
            }
        } catch (error) {
            analysis.warnings.push(`Content analysis failed: ${error.message}`);
        }
    }

    async extractTextContent(fileData, fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        try {
            // For text files, try to read as text
            if (fileData.length < 1000000) {
                const decoder = new TextDecoder('utf-8', { fatal: false });
                return decoder.decode(fileData);
            }
            return null;
        } catch (error) {
            console.warn(`Text extraction failed for ${fileName}:`, error);
            return null;
        }
    }

    checkForSuspiciousPatterns(analysis, text) {
        const lowerText = text.toLowerCase();
        
        const suspiciousPatterns = [
            { pattern: /exec.*shell|powershell|cmd\.exe/i, score: 0.2, desc: "Shell execution commands" },
            { pattern: /download.*file|wget|curl/i, score: 0.15, desc: "File download commands" },
            { pattern: /registry|regedit|reg\.exe/i, score: 0.15, desc: "Registry modification" },
            { pattern: /autoopen|autoe?xec/i, score: 0.1, desc: "Auto-execution patterns" },
            { pattern: /eval.*\(|function.*\(/i, score: 0.1, desc: "Dynamic code execution" },
            { pattern: /base64.*decode|atob/i, score: 0.1, desc: "Base64 encoding detected" }
        ];
        
        suspiciousPatterns.forEach(({ pattern, score, desc }) => {
            if (pattern.test(text)) {
                analysis.riskScore += score;
                analysis.detectedFeatures.push(desc);
            }
        });
    }

    extractAndCheckUrls(analysis, text) {
        const urlRegex = /https?:\/\/[^\s]+/g;
        const urls = text.match(urlRegex) || [];
        
        urls.forEach(url => {
            try {
                const domain = new URL(url).hostname;
                if (this.isSuspiciousDomain(domain)) {
                    analysis.riskScore += 0.1;
                    analysis.detectedFeatures.push(`Suspicious domain: ${domain}`);
                }
            } catch (error) {
                // Invalid URL, might be obfuscated
                analysis.riskScore += 0.05;
                analysis.detectedFeatures.push(`Malformed URL: ${url.substring(0, 50)}`);
            }
        });
    }

    isSuspiciousDomain(domain) {
        const suspiciousPatterns = [
            /\.tk$/, /\.ml$/, /\.ga$/, /\.cf$/, /\.gq$/,
            /[0-9]{3,}\./,
            /-.+\..+\./
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(domain));
    }

    analyzeFileStructure(analysis, fileData) {
        // Check file entropy (simple approximation)
        const entropy = this.calculateEntropy(fileData);
        if (entropy > 0.85 && analysis.fileSize > 1000) {
            analysis.riskScore += 0.1;
            analysis.detectedFeatures.push("High entropy (possible encryption/obfuscation)");
        }
    }

    calculateEntropy(data) {
        // Simple entropy calculation
        const frequency = new Array(256).fill(0);
        for (let i = 0; i < data.length; i++) {
            frequency[data[i]]++;
        }
        
        let entropy = 0;
        for (let i = 0; i < 256; i++) {
            if (frequency[i] > 0) {
                const p = frequency[i] / data.length;
                entropy -= p * Math.log2(p);
            }
        }
        
        return entropy / 8;
    }

    applyHeuristics(analysis) {
        // Additional heuristic checks
        if (analysis.detectedFeatures.length > 3) {
            analysis.riskScore += 0.1;
        }
        
        if (analysis.riskScore > 0.5 && analysis.fileSize < 5000) {
            analysis.detectedFeatures.push("Small file with high risk score");
        }
    }

    displayAnalysisResults(result) {
        const resultDiv = document.getElementById('analysis-result');
        const featuresSection = document.getElementById('features-section');
        const featuresList = document.getElementById('features-list');
        
        // Clear previous results
        featuresList.innerHTML = '';
        
        // Set appropriate styling based on risk
        resultDiv.className = 'analysis-result ' + 
            (result.riskScore > 0.7 ? 'malicious' : 
             result.riskScore > 0.3 ? 'suspicious' : 'safe');
        
        // Display results
        document.getElementById('result-content').innerHTML = `
            <p><strong>Risk Score:</strong> ${Math.round(result.riskScore * 100)}%</p>
            <p><strong>Verdict:</strong> ${result.isMalicious ? '⚠️ MALICIOUS' : '✅ LIKELY SAFE'}</p>
            <p><strong>Features Analyzed:</strong> ${result.detectedFeatures.length} detected</p>
        `;
        
        // Display detected features
        if (result.detectedFeatures.length > 0) {
            featuresSection.style.display = 'block';
            result.detectedFeatures.forEach(feature => {
                const li = document.createElement('div');
                li.className = 'feature-item';
                li.textContent = feature;
                featuresList.appendChild(li);
            });
        }
    }

    displayError(message) {
        document.getElementById('result-content').innerHTML = `
            <div style="color: red;">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }

    getFileType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const typeMap = {
            'exe': 'Executable', 'dll': 'Dynamic Link Library', 'bat': 'Batch File',
            'cmd': 'Command Script', 'ps1': 'PowerShell Script', 'vbs': 'VBScript',
            'js': 'JavaScript', 'pdf': 'PDF Document', 'docx': 'Word Document',
            'xlsx': 'Excel Spreadsheet', 'zip': 'Zip Archive', 'rar': 'RAR Archive'
        };
        return typeMap[extension] || extension.toUpperCase() + ' File';
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }
}

// Initialize the sandbox when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.fileSandbox = new FileSandbox();
});