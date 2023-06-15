import { PathLike } from 'fs';
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { AlfredSnippetWrapper, isAlfredSnippet } from './models/alfred.models';
import { ISnipLabSnippet, SnippetsLabCollection } from './models/snippets-lab.models';

class SnippetMigrator {
  private alfredSnippetsDirectory: PathLike = `/Users/matt/Downloads/snippets`;
  private snippetsLabCollection: SnippetsLabCollection = { contents: { snippets: [] } };

  public async run() {
    // get a list of all the folders
    const folderNames = await this.listDirectories(this.alfredSnippetsDirectory);
    // for each folder use the name as the folder and
    for (let folderName of folderNames) {
      const currentFolderPath = path.join(this.alfredSnippetsDirectory.toString(), folderName);
      const fileList = await this.listFiles(currentFolderPath, [`json`]);
      const snippet = await this.createSnippetLabSnippet(fileList, folderName);

      if (snippet) {
        this.snippetsLabCollection.contents.snippets?.push(snippet);
      }
    }

    const outputPath = path.join(path.dirname(this.alfredSnippetsDirectory.toString()), `snippetLabCollection.json`);
    await this.writeJsonFile(outputPath, this.snippetsLabCollection, true);
  }

  private async createSnippetLabSnippet(fileList: string[], folderName: string): Promise<ISnipLabSnippet | undefined> {
    for (const file of fileList) {
      const currentFilePath = path.join(this.alfredSnippetsDirectory.toString(), folderName, file);
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
          folder: folderName,
          uuid: uid,
        };
      } else {
        console.error(`doesn't look like a AlfredSnippet ${alfredSnippetWrapper}`);
      }
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
