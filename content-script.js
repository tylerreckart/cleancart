(function () {
  // Selectors for Affirm, Afterpay, and Klarna's host element
  const bnplSelectors = [
    // Affirm
    'p.affirm-as-low-as',
    '.affirm-product-modal',
    'a[href*="affirm.com/shop/"]',
    '[data-page-type*="affirm"]',
    '[class*="affirm"]',
    'affirm-placement',
    // Afterpay
    'afterpay-placement',
    'afterpay-price-table',
    'div[class*="afterpay"]',
    'span[class*="afterpay"]',
    '[data-mpid]',
    '[data-afterpay-entry-point]',
    // Klarna Host
    'klarna-placement',
  ];

  // Selectors for parts *within* Klarna's Shadow DOM
  const klarnaPartSelectors = [
    'klarna-placement::part(osm-container)',
    'klarna-placement::part(osm-message)',
    'klarna-placement::part(osm-legal)',
    'klarna-placement::part(osm-cta)',
    'klarna-placement::part(osm-badge)',
    'klarna-placement::part(osm-deal-badge)',
    'klarna-placement::part(osm-logo)',
  ];

  /**
   * Sends a message to the service worker to inject CSS for a given selector.
   * @param {string} selector The CSS selector to hide.
   */
  function requestCSSInjection(selector) {
    console.log(`cleancart content: requesting CSS injection for: ${selector}`); // Debug log
    chrome.runtime.sendMessage({ type: 'INJECT_CSS', selector: selector }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          `cleancart: error sending message for selector "${selector}":`,
          chrome.runtime.lastError.message
        );
      }
    });
  }

  function checkNodeForBNPL(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return; // Only process element nodes
    }

    bnplSelectors.forEach((bnplSelector) => {
      try {
        // 1. Check if the node itself matches
        if (node.matches(bnplSelector)) {
          if (bnplSelector === 'klarna-placement') {
            // Klarna host found: request injection for all internal parts
            klarnaPartSelectors.forEach((partSelector) => requestCSSInjection(partSelector));
          } else {
            // Affirm/Afterpay match: request injection for the element selector
            requestCSSInjection(bnplSelector);
          }
        }

        // 2. Check if the node contains matching descendants
        // Use querySelectorAll cautiously; might be slow on very large nodes being added
        const descendants = node.querySelectorAll(bnplSelector);
        if (descendants.length > 0) {
          if (bnplSelector === 'klarna-placement') {
            // Klarna host(s) found within the node: request injection for parts for each instance
            descendants.forEach((klarnaHostInstance) => {
              klarnaPartSelectors.forEach((partSelector) => requestCSSInjection(partSelector));
            });
          } else {
            // Affirm/Afterpay descendants found: ensure the main rule is injected
            requestCSSInjection(bnplSelector);
          }
        }
      } catch (error) {
        console.error(
          `cleancart: error checking node for selector "${bnplSelector}":`,
          error,
          node
        );
        // Continue checking other selectors/nodes
      }
    });
  }

  function processAddedNodes(nodeList) {
    nodeList.forEach((node) => {
      checkNodeForBNPL(node);
    });
  }

  const mutationCallback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // console.log('cleancart: detected added nodes:', mutation.addedNodes);
        processAddedNodes(mutation.addedNodes);
      }
    }
  };

  // Create the observer instance
  const observer = new MutationObserver(mutationCallback);

  // Configuration for the observer
  const config = {
    childList: true,
    subtree: true,
  };

  function initializeHiding() {
    console.log('cleancart: initializing content script.');

    // 1. Initial scan of the document body
    processAddedNodes([document.body]);

    // 2. Start observing the body for future changes
    try {
      observer.observe(document.body, config);
    } catch (error) {
      console.error('cleancart: failed to start observer:', error);
    }
  }

  // Ensure initialization runs after the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHiding);
  } else {
    initializeHiding();
  }

  // Disconnect the observer when the page is unloaded to prevent memory leaks
  window.addEventListener('unload', () => {
    if (observer) {
      observer.disconnect();
      console.log('cleancart: observer disconnected on page unload.');
    }
  });
})();
