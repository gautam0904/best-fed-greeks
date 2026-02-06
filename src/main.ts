import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Add error handling for bootstrap
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    console.error('Failed to bootstrap application:', err);
    
    // Try to show a user-friendly error message
    try {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #f44336;
        color: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        z-index: 9999;
        font-family: Arial, sans-serif;
      `;
      errorDiv.innerHTML = `
        <h3>Application Error</h3>
        <p>The application failed to start. Please try refreshing the page.</p>
        <button onclick="location.reload()" style="
          background: white;
          color: #f44336;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        ">Refresh Page</button>
      `;
      document.body.appendChild(errorDiv);
    } catch (displayError) {
      console.error('Could not display error message:', displayError);
    }
  });
