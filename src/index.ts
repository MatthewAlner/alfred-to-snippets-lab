import { PathLike } from 'fs';
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { AlfredSnippetWrapper, isAlfredSnippet } from './models/alfred.models';
import { ISnipLabFolder, ISnipLabSnippet, SnippetsLabCollection } from './models/snippets-lab.models';

class SnippetMigrator {
  private alfredSnippetsDirectory: PathLike = `/Users/matt/Downloads/snippets`;
  private snippetsLabCollection: SnippetsLabCollection = { contents: { snippets: [], folders: [] } };
  private folderMap: Map<string, ISnipLabFolder> = new Map();

  public async run() {
    // Get a list of all the folders
    const folderNames = await this.listDirectories(this.alfredSnippetsDirectory);

    // Using the folder names create an array of ISnipLabFolder entities
    const folders: ISnipLabFolder[] = folderNames.map(folderName => ({ title: folderName, uuid: crypto.randomUUID() }));

    // Build a map of folder names to ISnipLabFolder entities
    const folderTuple: Array<[string, ISnipLabFolder]> = folders.map(folder => [folder.title, folder] as [string, ISnipLabFolder]);
    this.folderMap = new Map<string, ISnipLabFolder>(folderTuple);

    // Add the ISnipLabFolder[] to the snippetsLabCollection
    this.snippetsLabCollection.contents.folders?.push(...folders);

    // Loop over the folders and look for Alfred snippets to add
    for (let folderName of folderNames) {
      const currentFolderPath = path.join(this.alfredSnippetsDirectory.toString(), folderName);
      const fileList = await this.listFiles(currentFolderPath, [`json`]);
      const folder = this.folderMap.get(folderName);

      if (!folder?.title) {
        return;
      }

      const snippets = await this.createSnippetLabSnippets(fileList, folder);

      if (snippets) {
        this.snippetsLabCollection.contents.snippets?.push(...snippets);
      }
    }

    const outputPath = path.join(path.dirname(this.alfredSnippetsDirectory.toString()), `snippetLabCollection.json`);
    await this.writeJsonFile(outputPath, this.snippetsLabCollection, true);
  }

  private async createSnippetLabSnippets(fileList: string[], folder: ISnipLabFolder): Promise<ISnipLabSnippet[]> {
    const snippets: ISnipLabSnippet[] = [];

    for (const fileName of fileList) {
      const snippet = await this.createSnippetLabSnippet(fileName, folder);

      if (snippet) {
        snippets.push(snippet);
      }
    }

    return snippets;
  }

  private async createSnippetLabSnippet(fileName: string, folder: ISnipLabFolder): Promise<ISnipLabSnippet | undefined> {
    if (!folder?.title) {
      return;
    }

    const currentFilePath = path.join(this.alfredSnippetsDirectory.toString(), folder.title, fileName);
    const alfredSnippetWrapper = await this.readJsonFile<AlfredSnippetWrapper>(currentFilePath);
    const alfredSnippet = alfredSnippetWrapper?.alfredsnippet;

    if (isAlfredSnippet(alfredSnippet)) {
      const { snippet, name, uid, keyword } = alfredSnippet;
      return {
        fragments: [
          {
            content: snippet,
          },
        ],
        title: name,
        folder: folder.uuid,
        uuid: uid,
      };
    } else {
      console.error(`doesn't look like a AlfredSnippet ${alfredSnippetWrapper}`);
    }
  }

  private async listDirectories(path: PathLike): Promise<string[]> {
    const items = await readdir(path, { withFileTypes: true });
    return items.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
  }

  private async listFiles(path: PathLike, fileExtFilters: string[] | null, includeHidden: boolean = false): Promise<string[]> {
    const items = await readdir(path, { withFileTypes: true });
    let files = items.filter(dirent => dirent.isFile());

    if (fileExtFilters?.length) {
      files = files.filter(dirent => fileExtFilters.some(fileExtFilter => dirent.name.endsWith(fileExtFilter)));
    }

    if (!includeHidden) {
      files = files.filter(dirent => !dirent.name.startsWith(`.`));
    }

    return files.map(dirent => dirent.name);
  }

  private async readJsonFile<T>(path: PathLike): Promise<T | undefined> {
    const file = await readFile(path, { encoding: 'utf8' });
    let parsedFile: T | undefined;

    try {
      parsedFile = JSON.parse(file);
    } catch (e) {
      console.error(`failed to parse JSON [${path}]`);
    }

    return parsedFile;
  }

  private async writeJsonFile<T>(path: PathLike, data: T, prettyPrint: boolean = false) {
    try {
      const dataString = prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      return writeFile(path, dataString);
    } catch (e) {
      console.error(`failed to write \n\n ${data}`);
      throw e;
    }
  }
}

new SnippetMigrator().run();
