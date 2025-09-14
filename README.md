# 🛡️ Loki - AI Phishing Detection Chrome Extension

**Loki** is a powerful Chrome extension designed to detect **AI-driven phishing attacks** using machine learning.  
It operates **entirely offline**, ensuring maximum **privacy** and **security** for users.

---

## 🚀 Features

- 🤖 **ML-Powered Detection**: Uses TensorFlow.js with an **LSTM neural network** to identify phishing content.  
- 🔒 **Complete Offline Operation**: No internet connection required, no data leaves your device.  
- 📧 **Email Analysis**: Analyze email content via text input or file upload (`.eml` / `.txt`).  
- 📁 **File Sandbox**: Secure environment to analyze potentially malicious files.  
- 🎯 **Risk Scoring**: Visual risk assessment with detailed feature explanations.  
- 🛡️ **Security First**: Sandboxed execution ensures safe file analysis.  

---

## 📦 Installation

### Prerequisites
- Google Chrome (version **88+**)
- Python **3.8+** (for model training)

### Quick Setup
1. Download or clone this repository:
   ```bash
   git clone https://github.com/your-username/loki-extension.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in top-right corner)
4. Click **Load Unpacked** and select the `loki-extension/` folder
5. The extension will appear in your toolbar 🎉

---

## 🏗️ Building from Source

### Install Python dependencies
```bash
pip install tensorflow numpy pandas scikit-learn tensorflowjs
```

### Train the ML model (optional)
```bash
python train_model.py
```

### Convert to TensorFlow.js format
```bash
tensorflowjs_converter --input_format keras model.h5 models/
```

Place the converted model inside the `models/` directory.

---

## 🎯 Usage

### 🔍 Email Analysis
1. Click the **Loki extension icon**
2. Select **Email Analysis** tab
3. Paste email content or upload `.eml` / `.txt` file
4. Click **Analyze Email** → get phishing detection results

### 📂 File Analysis
1. Click the **Loki extension icon**
2. Select **File Analysis** tab
3. Upload a file for sandboxed analysis
4. Click **Analyze File** → scan for risks

### 📊 Understanding Results
- **Risk Score**: `0–100%` probability of phishing  
- **Visual Indicator**: Color-coded risk meter (Green → Yellow → Red)  
- **Feature Analysis**: List of detected suspicious patterns  
- **Verdict**: "✅ Legitimate" or "❌ Phishing"  

---

## 🏗️ Architecture

### System Design
```
┌─────────────────────────────────────────────────┐
│               Chrome Browser                    │
│                                                 │
│  ┌─────────────────┐    ┌─────────────────────┐ │
│  │   User Interface│    │   ML Engine         │ │
│  │   (Popup)       │◄──►│   (TensorFlow.js)   │ │
│  └─────────────────┘    └─────────────────────┘ │
│           │                     │               │
│           ▼                     ▼               │
│  ┌─────────────────┐    ┌─────────────────────┐ │
│  │   Content       │    │   Security Sandbox  │ │
│  │   Scanner       │    │   (File Analysis)   │ │
│  └─────────────────┘    └─────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Machine Learning Model
- **Type**: LSTM Neural Network with Embedding Layer  
- **Input**: Preprocessed email text (tokenized + padded)  
- **Output**: Binary classification → *Phishing* vs *Legitimate*  
- **Features**: Text patterns, linguistic features, structural analysis  

### Security Features
- 🛑 Sandboxed Execution for file analysis  
- 🔐 No Data Transmission (all local)  
- 🧹 Content Sanitization & input validation  
- ⚡ Resource Limits (safe memory + execution)  

---

## 📂 Project Structure
```
loki-extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── popup.css
├── content.js
├── sandbox.html
├── sandbox.js
├── models/
│   ├── model.json
│   └── group1-shard1of1.bin
└── libs/
    ├── tensorflow.js
    ├── pdf.js
    └── mammoth.js
```

---

## 🔧 Development

### Customizing the ML Model
1. Prepare training data with labeled phishing / legitimate emails  
2. Modify `train_model.py` for your dataset  
3. Train model & convert to TensorFlow.js format  
4. Replace model files in `models/` directory  

---

## 🚨 Troubleshooting

- **"Model not loaded" errors** → Check TensorFlow.js + model files exist  
- **Sandbox timeout** → Large files may need more time  
- **Performance issues** → Optimized for typical email sizes  

### Debugging
- Open Chrome **Developer Tools (F12)**  
- Check **Console tab** for errors  
- Inspect **Service Worker** logs  
- Add `console.log()` for tracing  

---

## 📊 Performance
- **Memory Usage**: ~50–100MB (with TensorFlow.js)  
- **Analysis Time**: < 2s for typical emails  
- **Extension Size**: < 10MB  
- **Compatibility**: Chrome 88+, Chromium-based browsers  

---

## 🔮 Future Enhancements
- 📩 Real-time email scanning  
- 📬 Integration with email clients  
- 📂 Advanced file type support  
- 🔄 Model update system  
- 🌍 Multi-language support  
- 🧠 Advanced heuristic analysis  

---

## ⚠️ Disclaimer
This tool is designed to **assist in phishing detection** but should **not** be relied upon as the sole security measure.  
Always practice good security hygiene and use multiple layers of protection.
