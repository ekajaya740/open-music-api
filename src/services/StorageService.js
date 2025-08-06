const fs = require('fs');
const { RequestEntityTooLargeError } = require('../exceptions/RequestEntityTooLargeError');

class StorageService {
  constructor(folder) {
    this._folder = folder;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const maxSize = 512000;
    let currentSize = 0;
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(path);
      let isErrored = false;

      const cleanup = () => {
        if (fileStream && !fileStream.destroyed) {
          fileStream.destroy();
        }

        if (isErrored && fs.existsSync(path)) {
          fs.unlinkSync(path);
        }
      };

      const handleError = (error) => {
        if (isErrored) return;
        isErrored = true;
        cleanup();
        reject(error);
      };

      fileStream.on('error', handleError);
      file.on('error', handleError);

      file.on('data', (chunk) => {
        if (isErrored) return;

        currentSize += chunk.length;
        if (currentSize > maxSize) {
          const error = new RequestEntityTooLargeError('Ukuran file melebihi batas 512KB.');
          handleError(error);
          return;
        }

        if (fileStream.writable) {
          fileStream.write(chunk);
        }
      });

      file.on('end', () => {
        if (isErrored) return;

        fileStream.end(() => {
          resolve(filename);
        });
      });

      file.on('close', () => {
        if (!isErrored && fileStream.writable) {
          fileStream.end(() => {
            resolve(filename);
          });
        }
      });

      const timeout = setTimeout(() => {
        if (!isErrored) {
          handleError(new Error('File upload timeout'));
        }
      }, 30000);

      file.on('end', () => clearTimeout(timeout));
    });
  }
}

module.exports = { StorageService };
