import { PathLike } from 'fs';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { AlfredSnippet, AlfredSnippetWrapper, isAlfredSnippet } from './models/alfred.models';
import { ISnipLabSnippet, SnippetsLabCollection } from './models/snippets-lab.models';

class SnippetMigrator {
  private alfredSnippetsDirectory: PathLike = `/Users/matt/Downloads/snippets`;
  private snippetsLabCollection: SnippetsLabCollection = { contents: {} };

  public async run() {
    // get a list of all the folders
    const folderNames = await this.listDirectories(this.alfredSnippetsDirectory);
    // for each folder use the name as the folder and
    for (let folderName of folderNames) {
      const currentFolderPath = path.join(this.alfredSnippetsDirectory.toString(), folderName);
      const fileList = await this.listFiles(currentFolderPath, [`json`]);

      for (const file of fileList) {
        const currentFilePath = path.join(this.alfredSnippetsDirectory.toString(), folderName, file);
        const alfredSnippetWrapper = await this.readJsonFile<AlfredSnippetWrapper>(currentFilePath);
        const alfredSnippet = alfredSnippetWrapper?.alfredsnippet;

        if (isAlfredSnippet(alfredSnippet)) {
          const { snippet, name, uid, keyword } = alfredSnippet;
          const snippetsLabSnippet: ISnipLabSnippet = {
            fragments: [
              {
                content: snippet,
              },
            ],
            title: name,
            folder: folderName,
            uuid: uid,
          };

          this.snippetsLabCollection.contents.snippets?.push();
        } else {
          console.error(`doesn't look like a AlfredSnippet ${alfredSnippetWrapper}`);
        }
      }
    }

    console.log(this.snippetsLabCollection);
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
}

new SnippetMigrator().run();
