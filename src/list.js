const dbName = "asrDatasetDb";
const dbVersion = 1;
const dbStoreName = "asrDatasetDbStore";
const downloadButton = document.getElementById('downloadButton');
const clearButton = document.getElementById('clearButton');

downloadButton.addEventListener("click", downloadDataset);
clearButton.addEventListener("click", clearDatabase);


browser.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
	if (message.action === 'recordStopped') {
		updateListing()
	}
});

function clearDatabase() {

	const request = indexedDB.open(dbName, dbVersion);
	
	request.onerror = event => {
		console.error("IndexedDB error:", event.target.error);
	};
	
	request.onsuccess = event => {
		const db = event.target.result;
		const transaction = db.transaction([dbStoreName], "readwrite");
		const store = transaction.objectStore(dbStoreName);
		const clearRequest = store.clear();

    clearRequest.onsuccess = event => {
      updateListing()
    }
	};


}

function updateListing() {
	
	const audioTableBody = document.querySelector("#recordsTable tbody");
	audioTableBody.innerHTML = "";
	
	const request = indexedDB.open(dbName, dbVersion);
	
	request.onerror = event => {
		console.error("IndexedDB error:", event.target.error);
	};
	
	request.onsuccess = event => {
		
		const db = event.target.result;
		const transaction = db.transaction([dbStoreName], "readonly");
		const store = transaction.objectStore(dbStoreName);
		const cursor = store.openCursor();
		
		cursor.onsuccess = event => {
			const cursor = event.target.result;
			if (cursor) {
				const blob = cursor.value.audio;
				const comment = cursor.value.comment + cursor.value.date + cursor.value.url;
				const audioUrl = URL.createObjectURL(blob);
				
				const newRow = audioTableBody.insertRow();
				const audioCell = newRow.insertCell(0);
				const commentCell = newRow.insertCell(1);
				const actionCell = newRow.insertCell(2);
				
				let now_cursor = cursor.key
				
				const removeButton = document.createElement("button");
				removeButton.textContent = "Remove"+now_cursor;
				
				
				removeButton.addEventListener("click", () => {
					removeRecordFromIndexedDB(now_cursor);
					audioTableBody.removeChild(newRow);
				});
				
				actionCell.appendChild(removeButton);
				
				audioCell.innerHTML = `<audio controls><source src="${audioUrl}" type="audio/wav"></audio>`;
				commentCell.textContent = comment;
				
				cursor.continue();
			}
		};
	};
}

function removeRecordFromIndexedDB(key) {
	
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

function downloadDataset() {
	
	const request = indexedDB.open(dbName, dbVersion);
	
	request.onerror = event => {
		console.error("IndexedDB error:", event.target.error);
	};
	
	request.onsuccess = event => {
		
		const db = event.target.result;
		const transaction = db.transaction([dbStoreName], "readonly");
		const store = transaction.objectStore(dbStoreName);
		const cursor = store.openCursor();
		let files = []
		
		cursor.onsuccess = event => {
			const cursor = event.target.result;
			if (cursor) {
				
				const blob = cursor.value.audio;
				const comment = cursor.value.comment;
				console.log(blob)
				const idx = cursor.key
				
			  const fileName = generateRandomFilename(16)

				files.push({ filename: fileName, audio: blob, comment: comment, date: cursor.value.date, url: cursor.value.url })
				
				cursor.continue();
			} else {
				downloadTar(files)
			}	
		}
	};
}

function generateRandomFilename(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let filename = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    filename += characters.charAt(randomIndex);
  }

  return filename;
}

function downloadTar(files){
	let tarWriter = new tarball.TarWriter();
  let metadata = []
	files.forEach((file) => {
		let audiofile = file.audio
		audiofile.name = `${file.filename}.ogg`;
		audiofile.lastModifiedDate = new Date();
		tarWriter.addFile(`dataset/data/${audiofile.name}`, audiofile);
    const metadata_record = { file_name: `data/${audiofile.name}`, date: file.date.toISOString(), url: file.url, text: file.comment }
    metadata.push(metadata_record)
	});
  
  tarWriter.addTextFile(`dataset/metadata.jsonl`, metadata.map(obj => JSON.stringify(obj)).join('\n'));
	tarWriter.download("dataset.tar").then(() => {
		console.log('download ok')
	});
}

updateListing()
