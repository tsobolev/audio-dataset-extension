let currentSentence = 0

browser.runtime.onMessage.addListener((message) => {
	
	if (message.action === 'recordStarted') {
		currentSentence.classList.add('ext-sound-onesentence-inprogress');
	}
	if (message.action === 'recordStopped') {
		currentSentence.classList.remove('ext-sound-onesentence-inprogress');
		currentSentence.classList.add('ext-sound-onesentence-done');
	}
});


function splitParagraphs() {
	const paragraphs = document.querySelectorAll('p, li');
	
	for (const element of paragraphs) {
		
		const text = element.textContent;
		
		const sentenceEndings = /[.!?]\s|$/
		let sentences = text.split(sentenceEndings);
		sentences = sentences.filter(sentence => sentence.trim() !== '');
		sentences = sentences.map(str => `<span class="ext-sound-onesentence">${str}</span>`).join('. ');
		element.innerHTML = sentences
		element.classList.add('ext-sound-processed');
		
	}
}

function appendButtons() {
	const sentenceElements = document.querySelectorAll('.ext-sound-onesentence');
	sentenceElements.forEach(element => {
		element.addEventListener("click", () => {
			if(element.classList.contains('ext-sound-onesentence-inprogress')){
				browser.runtime.sendMessage({ action:'stopRecord',text:element.textContent })
			}else{
				browser.runtime.sendMessage({ action:'startRecord',text:element.textContent })
				currentSentence = element
			}
		});
	});
}

function addRedBorderToParagraphs() {
	splitParagraphs()
	appendButtons()
}

addRedBorderToParagraphs()
