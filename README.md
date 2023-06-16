# Alfred to SnippetsLab️

The idea here is to create a script to convers `Alfred's` JSON snippet format into the compatible import format for `SnippetLab`

## Warning / Disclaimer

> I wrote this for myself quickly so I didn't have to copy-paste 100s of items, it's not battle tested there are probably end cases I missed. It worked well enough for me and then I stopped developing it. I'm sharing in the hope it will save others time. As with any random script on the Internet PLEASE READ THE CODE before you run it to make sure you are happy with what it's doing.

## How to use:

- First you will need to locate your `Alfred.alfredpreferences` and show the inner package contents.

![locate your Alfred alfredpreferences](assets/walkthrough/01%20-%20locate%20your%20Alfred%20alfredpreferences.png)

- make a **COPY** of the `snippets` folder and paste it in some safe temporary working folder like Documents or Downloads

![locate your Alfred alfredpreferences](assets/walkthrough/02%20-%20make%20a%20copy.png)

- Clone this repo and change the `alfredSnippetsDirectory` on line 9 to match the location that you put your copy of `snippets`

- install the deps with `yarn` or `npm install` ect

- run the script with `yarn run start` or `npm run start` ect

- this should create a `snippetLabCollection.json` next to your `snippets` folder

- start the import wizard in SnippetLabs

![locate your Alfred alfredpreferences](assets/walkthrough/03%20-%20start%20import%20wizzard.png)

- select the custom json option

![locate your Alfred alfredpreferences](assets/walkthrough/04%20-%20select%20custom%20json.png)

- locate and select the generated `snippetLabCollection.json` it should be next to your `snippets` folder

![locate your Alfred alfredpreferences](assets/walkthrough/05%20-%20locate%20snippetLabCollection%20json%20and%20select.png)

- start the import

![locate your Alfred alfredpreferences](assets/walkthrough/06%20-%20start%20import.png)

- Success 🎉?

![locate your Alfred alfredpreferences](assets/walkthrough/07%20-%20import%20complete.png)

// TODO
- Stop hard coding the Alfred path, change it so that you can pass it in.
- Bundle it as an executable with node 20
