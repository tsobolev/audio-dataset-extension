# audio-dataset-extension

The Firefox extension allows you to record audio for selected sentences on the page and download them as a tarball.
Once the extension is loaded on a page, the first click on a sentence starts recording, and the second click stops the recording. The last recorded sentence can be deleted with a single click on the "dropLastRecord" button.
All recordings are stored locally in the browser and can be replayed or downloaded as a tarball in a separate "list" window.
Once tarball is unpacked, it can be loaded as audio dataset like this:

```python
    from datasets import load_dataset
    dataset = load_dataset("audiofolder", data_dir="path_to_dataset_folder/dataset", split="train")
```

To build .xpi from src run:  cd src; zip -r ../asrdataset.xpi *
Extension can be installed to Firefox-developer-edition (about:config xpinstall.signatures.required=False)

https://raw.githubusercontent.com/ankitrohatgi/tarballjs/master/tarball.js is used for download function. 
