// Display API results with error handling
function displayApiResult(containerId, data) {
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }
    
    if (data.error) {
      container.innerHTML = '<div class="error-message">ERROR: ' + data.error + '</div>';
    } else {
      container.innerHTML = '<pre>' + JSON.stringify(data.result, null, 2) + '</pre>';
    }
  }
  