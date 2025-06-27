// Content script that runs on Metabase pages
class QueryAssistant {
  constructor() {
    this.isMetabasePage = this.checkIfMetabasePage();
    this.apiEndpoint = 'http://localhost:8000/api/query-assistant/';
    this.init();
  }

  checkIfMetabasePage() {
    const url = window.location.href;
    return url.includes('metabase') || 
           url.includes('/question/') || 
           url.includes('/dashboard/');
  }

  init() {
    if (!this.isMetabasePage) return;
    
    this.createFloatingButton();
    this.createModal();
    this.attachEventListeners();
  }

  createFloatingButton() {
    const button = document.createElement('div');
    button.id = 'query-assistant-btn';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 9h8m-8 4h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    button.title = 'Open Query Assistant';
    document.body.appendChild(button);
  }

  createModal() {
    const modal = document.createElement('div');
    modal.id = 'query-assistant-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Query Assistant</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="context-info">
            <p><strong>Current Page:</strong> <span id="current-url">${window.location.href}</span></p>
            <p><strong>Instructions:</strong> Describe your query in plain English</p>
          </div>
          <form id="query-form">
            <div class="form-group">
              <label for="query-input">Your Query:</label>
              <textarea 
                id="query-input" 
                placeholder="e.g., Show me sales by region for the last 3 months where revenue > $10,000"
                rows="4"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label for="output-format">Output Format:</label>
              <select id="output-format">
                <option value="mbql">MBQL (Metabase Query Language)</option>
                <option value="sql">SQL</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" id="cancel-btn">Cancel</button>
              <button type="submit" id="submit-btn">
                <span class="btn-text">Generate Query</span>
                <span class="loading-spinner" style="display: none;">●●●</span>
              </button>
            </div>
          </form>
          <div id="result-container" style="display: none;">
            <div class="result-header">
              <h4>Generated Query:</h4>
              <button id="copy-btn">Copy</button>
            </div>
            <div id="result-content"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  attachEventListeners() {
    const button = document.getElementById('query-assistant-btn');
    const modal = document.getElementById('query-assistant-modal');
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('query-form');
    const copyBtn = document.getElementById('copy-btn');

    button.addEventListener('click', () => this.openModal());
    closeBtn.addEventListener('click', () => this.closeModal());
    cancelBtn.addEventListener('click', () => this.closeModal());
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    copyBtn.addEventListener('click', () => this.copyResult());

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        this.closeModal();
      }
    });
  }

  openModal() {
    const modal = document.getElementById('query-assistant-modal');
    modal.style.display = 'block';
    document.getElementById('query-input').focus();
    this.clearResults();
  }

  closeModal() {
    const modal = document.getElementById('query-assistant-modal');
    modal.style.display = 'none';
    document.getElementById('query-form').reset();
    this.clearResults();
  }

  clearResults() {
    const resultContainer = document.getElementById('result-container');
    resultContainer.style.display = 'none';
    document.getElementById('result-content').innerHTML = '';
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.loading-spinner');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'inline';

    try {
      const queryText = document.getElementById('query-input').value;
      const outputFormat = document.getElementById('output-format').value;
      
      const response = await this.sendQuery({
        query: queryText,
        format: outputFormat,
        context: {
          url: window.location.href,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      });

      this.displayResult(response);
    } catch (error) {
      this.displayError(error.message);
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
    }
  }

  async sendQuery(data) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate query');
    }

    return await response.json();
  }

  displayResult(result) {
    const resultContainer = document.getElementById('result-container');
    const resultContent = document.getElementById('result-content');
    
    let html = '';
    
    if (result.mbql) {
      html += `
        <div class="query-result">
          <h5>MBQL Query:</h5>
          <pre><code>${JSON.stringify(result.mbql, null, 2)}</code></pre>
        </div>
      `;
    }
    
    if (result.sql) {
      html += `
        <div class="query-result">
          <h5>SQL Query:</h5>
          <pre><code>${result.sql}</code></pre>
        </div>
      `;
    }

    if (result.explanation) {
      html += `
        <div class="query-explanation">
          <h5>Explanation:</h5>
          <p>${result.explanation}</p>
        </div>
      `;
    }

    resultContent.innerHTML = html;
    resultContainer.style.display = 'block';
    
    // Store result for copying
    this.lastResult = result;
  }

  displayError(message) {
    const resultContainer = document.getElementById('result-container');
    const resultContent = document.getElementById('result-content');
    
    resultContent.innerHTML = `
      <div class="error-message">
        <h5>Error:</h5>
        <p>${message}</p>
      </div>
    `;
    
    resultContainer.style.display = 'block';
  }

  copyResult() {
    if (!this.lastResult) return;
    
    let textToCopy = '';
    
    if (this.lastResult.mbql) {
      textToCopy += 'MBQL Query:\n' + JSON.stringify(this.lastResult.mbql, null, 2) + '\n\n';
    }
    
    if (this.lastResult.sql) {
      textToCopy += 'SQL Query:\n' + this.lastResult.sql + '\n\n';
    }
    
    if (this.lastResult.explanation) {
      textToCopy += 'Explanation:\n' + this.lastResult.explanation;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      const copyBtn = document.getElementById('copy-btn');
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    });
  }
}

// Initialize the extension when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new QueryAssistant());
} else {
  new QueryAssistant();
}