<img src="./images/branding.png">

## Overview
Clean Cart is a Chrome browser extension designed to automatically detect and hide promotional and ubiquitous "Buy Now, Pay Later" (BNPL) messaging elements injected into websites by services like Affirm, Klarna, and Afterpay.

## Mission
To empower users to reclaim control over their online shopping environment by seamlessly removing intrusive BNPL advertising and financing prompts, fostering mindful consumption and a cleaner, less distracting browsing experience.

## Features
- Automatic Hiding: Automatically detects and hides BNPL promotional widgets and messaging on page load.
- Dynamic Detection: Uses MutationObserver to find and hide elements that are loaded dynamically via JavaScript after the initial page load.
- Provider Coverage: Targets promotional messaging from major BNPL providers:
  - Affirm
  - Klarna (including handling its Shadow DOM implementation)
  - Afterpay
- Clean Browsing: Reduces visual clutter and potential distractions on e-commerce product, cart, and category pages.

## Installation (for Development/Testing)
- Clone or download the project source code to your local machine.
- Open Google Chrome and navigate to `chrome://extensions`.
- Enable Developer mode using the toggle switch in the top-right corner.   
- Click the Load unpacked button.   
- Select the directory containing the extension's source code (the folder with manifest.json).
- The extension should now be loaded and active.

## Usage
Once installed, the extension runs automatically in the background. Visit websites that typically display Affirm, Klarna, or Afterpay promotional messaging (e.g., e-commerce product pages, cart pages) to see the hiding effect. There is no browser action button; the hiding is passive and automatic.

![Example showing Clean Cart's DOM injection](/images/example.png)

## Limitations
Selector Dependency: The extension relies on specific CSS selectors (HTML tags, classes, attributes) used by BNPL providers. If providers update their code, the selectors may become outdated, requiring updates to the extension to maintain effectiveness.
Scope: This extension only hides promotional messaging. It does not block or interfere with the actual BNPL payment options during the final checkout process.