document.addEventListener('DOMContentLoaded', function() {
	const injectButton = document.getElementById('injectButton');
	injectButton.addEventListener('click', function() {
		browser.runtime.sendMessage({ action: 'injectScript' });
		browser.runtime.sendMessage({ action: 'createWindow' });
	});
	const openListing = document.getElementById('openListing');
	openListing.addEventListener('click', function() {
		browser.runtime.sendMessage({ action: 'createList' });
	});
});
