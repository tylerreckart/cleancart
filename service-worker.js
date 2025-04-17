chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INJECT_CSS' && message.selector && sender.tab && sender.tab.id) {
    const tabId = sender.tab.id;
    const selector = message.selector;

    // Construct the CSS rule to hide the element
    const cssString = `${selector} { display: none!important; }`;

    chrome.scripting
      .insertCSS({
        target: {
          tabId: tabId,
          allFrames: true, // Inject into all frames within the tab, matching content script scope
        },
        css: cssString,
      })
      .catch((err) => {
        // Log any errors that occur during CSS injection
        console.error(
          `cleancart: Failed to inject CSS for selector "${selector}" in tab ${tabId}:`,
          err
        );
      });

    return false;
  } else {
    console.warn('cleancart worker: Received unexpected message format.', message, sender);

    return false;
  }
});
