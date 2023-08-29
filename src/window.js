const extSoundCounter = document.getElementById('extSoundCounter');
const extSoundRecordingStatus = document.getElementById('extSoundRecordingStatus');
const dropLastRecord = document.getElementById('dropLastRecord')
const dbName = "asrDatasetDb";
const dbVersion = 1;
const dbStoreName = "asrDatasetDbStore";
let lastRecord = null
let recording = false
let recordsCounter = 0

function saveBlobToIndexDB(blob,comment){
	
	const request = indexedDB.open(dbName, dbVersion);
	
	request.onerror = event => {
		console.error("IndexedDB error:", event.target.error);
	};
	
	request.onupgradeneeded = event => {
		const db = event.target.result;
		const store = db.createObjectStore(dbStoreName, { autoIncrement: true });
	};
	
	request.onsuccess = event => {
		const db = event.target.result;
		const transaction = db.transaction([dbStoreName], "readwrite");
		const store = transaction.objectStore(dbStoreName);
		
		const audioObject = { audio: blob, comment: comment };
		const addRequest = store.add(audioObject);
		
		addRequest.onsuccess = () => {
      lastRecord = addRequest.result
		};
		
		addRequest.onerror = () => {
			console.error("Error saving audio blob to IndexedDB.");
		};
	};
}

function removeRecordFromIndexedDB(key) {
	console.log(key)
	
	const request = indexedDB.open(dbName, dbVersion);
	
	request.onerror = event => {
		console.error("IndexedDB error:", event.target.error);
	};
	
	request.onsuccess = event => {
		const db = event.target.result;
		const transaction = db.transaction([dbStoreName], "readwrite");
		const store = transaction.objectStore(dbStoreName);
		store.delete(key);
	};
}

async function startAudioRecording(text) {	
	let comment = text
	if (recording) {
		if (mediaRecorder && mediaRecorder.state === "recording") {
			mediaRecorder.stop();
			recording = false
		}
	} else {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				mediaRecorder = new MediaRecorder(stream);
				
				mediaRecorder.ondataavailable = event => {
					if (event.data.size > 0) {
						browser.runtime.sendMessage({ action: "recordStopped" });
						recordsCounter = recordsCounter + 1
						extSoundCounter.innerHTML = recordsCounter
						extSoundRecordingStatus.innerHTML = 'Stopped'
						saveBlobToIndexDB(event.data,comment)
					};
				}
				
				mediaRecorder.start();
				recording = true
				browser.runtime.sendMessage({ action: "recordStarted" });
				extSoundRecordingStatus.innerHTML = 'Recording'
			} catch (error) {
				console.error("Error accessing microphone:", error);
			}
	}
}
dropLastRecord.addEventListener('click',()=>{
  removeRecordFromIndexedDB(lastRecord)
  recordsCounter = recordsCounter - 1
  extSoundCounter.innerHTML = recordsCounter
})
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.action === "startRecord") {
		startAudioRecording(message.text)
	}
	if (message.action === "stopRecord") {
		startAudioRecording(message.text)
	}
});

