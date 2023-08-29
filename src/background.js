let textTabId = 0

function onCreated(windowInfo) {
	windowId = windowInfo.id
}

function onError(error) {
	console.log(`Error: ${error}`);
}

browser.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
	
	//content script injection requested in poopup
	if (message.action === 'injectScript') {
		const activeTabs = await browser.tabs.query({ active: true, currentWindow: true });
		const activeTab = activeTabs[0];
		
		if (activeTab) {
			browser.scripting.executeScript({
				target: { tabId: activeTab.id },
				files: ['content.js']
			});
		} else {
			console.error("No active tab found.");
		}
	}
	//createWindow requested from popup
	if (message.action === 'createWindow') {
    const screenWidth = window.screen.availWidth;
    const windowWidth = 130;  
    const leftPosition = screenWidth - windowWidth;
		let createData = {
			type: "detached_panel",
			url: "window.html",
			width: 120,
			height: 140,
      top: 150,
      left: leftPosition
    };
		let creating = browser.windows.create(createData);
		creating.then(function(windowInfo) {
      browser.storage.session.set({ windowId: windowInfo.id });
		}, onError);
	}
	if (message.action === 'createList') {
	  const screenWidth = window.screen.availWidth;
    const windowWidth = 510; // Adjust this value as needed
    const leftPosition = screenWidth - windowWidth;
		let createData = {
			type: "detached_panel",
			url: "list.html",
			width: 500,
			height: 700,
      top: 320,
      left: leftPosition
		};
		let creating = browser.windows.create(createData);
		creating.then(function(windowInfo) {
			console.log(`Created window: ${windowInfo.id}`);
		}, onError);
	}
	// Forward recordStarted confirmation message to content script
	if (message.action === 'recordStarted') {
		browser.tabs.sendMessage(textTabId, {
			action: "recordStarted",
		});
	}
	if (message.action === 'recordStopped') {
		browser.tabs.sendMessage(textTabId, {
			action: "recordStopped",
		});
	}
	// Focus to windows on startRecord
	if (message.action === "startRecord") {
		browser.tabs.query({active: true, currentWindow: true})
		.then(function(tabs) {
			textTabId = tabs[0].id
		})
		.catch(function(error) {
			console.error(`Could not send message to content: ${error}`);
		});
		let result = await browser.storage.session.get('windowId')

		browser.windows.update(result.windowId, { focused: true })
	}
	
	if (message.action === "stopRecord") {
		browser.tabs.query({active: true, currentWindow: true})
		.then(function(tabs) {
			textTabId = tabs[0].id
		})
		.catch(function(error) {
			console.error(`Could not send message to content: ${error}`);
		});
	}
});

