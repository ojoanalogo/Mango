

import { NotAcceptableError, InternalServerError } from 'routing-controllers';
import {
  PROFILE_PICTURES_FOLDER,
  PROFILE_PICTURES_RESOLUTIONS, PROFILE_PICTURES_MAX_SIZE
} from '../../config';
import fs = require('fs-extra');
import path = require('path');
import multer = require('multer');
import crypto = require('crypto');

export class UploadUtils {

  /**
	 * Gets Multer options for profile picture upload
	 * @returns Multer options
	 */
  public static getProfileUploadMulterOptions(): multer.Options {
    // multer options object
    const options: multer.Options = {
      /** storage options */
      storage: multer.diskStorage({
        /** set destination for uploaded file */
        async destination(_req, _file: Express.Multer.File, cb: (error: Error, destination: string) => void) {
          try {
            // join profile pictures folder with the main path of server
            const profilePicturesFolder = path.join(process.cwd(), PROFILE_PICTURES_FOLDER);
            await UploadUtils.checkUploadsFolder(profilePicturesFolder);
            cb(null, profilePicturesFolder);
          } catch (error) {
            cb(new InternalServerError('Error trying to create uploads folder'), null);
          }
        },
        /** rename filename (temporal) */
        async filename(_req, file, cb) {
          const newName = Date.now() + file.originalname;
          cb(null, newName);
        }
      }),

      /* file filter options */
      fileFilter: (_req, file: Express.Multer.File, cb: (error: Error, acceptFile: boolean) => void) => {
        // check mimetype
        const fileTypes = /jpeg|jpg|JPG|JPEG|png|PNG/;
        const mimetype = fileTypes.test(file.mimetype);
        // get format from image
        const extName = fileTypes.test(path.extname(file.originalname).split('.')[1]);
        // must pass mimetype and extname tests
        mimetype && extName ?
          // ok
          cb(null, true) :
          // wrong type
          cb(new NotAcceptableError('Not acceptable image format'), false);
      },

      /** file limits */
      limits: {
        fileSize: PROFILE_PICTURES_MAX_SIZE,
        files: 1
      }
    };

    return options;
  }

  /**
	 * Create uploads folder if not exists
	 * @param profilePicturesFolder Profile pictures folder url
	 */
  private static async checkUploadsFolder(profilePicturesFolder: string): Promise<void> {
    await fs.ensureDir(profilePicturesFolder);
    const resolutions: Array<number> = PROFILE_PICTURES_RESOLUTIONS;
    // map each resolution and convert to string type
    resolutions.map((res: number) => res.toString())
      // iterate each resolution and check if directory exists in the profile pictures folder
      .forEach(async (res: string) => {
        const pathExists = await fs.pathExists(profilePicturesFolder + path.sep + res);
        if (!pathExists) {
          // create a folder
          await fs.mkdir(profilePicturesFolder + path.sep + res);
        }
      });
  }

  /**
	 * Returns hash for file
	 * @param filename - Filename
	 * @param algorithm - Hash algorithm
	 * @returns File hash
	 */
  public static async getFileHash(filename: string, algorithm: HashAlgorithm = HashAlgorithm.MD5): Promise<string> {
    return new Promise((resolve, reject) => {
      // Algorithm depends on availability of OpenSSL on platform
      // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
      const shasum = crypto.createHash(algorithm);
      try {
        const s = fs.createReadStream(filename);
        s.on('data', (data) => {
          shasum.update(data);
        });
        // making digest
        s.on('end', () => {
          const hash = shasum.digest('hex');
          return resolve(hash);
        });
      } catch (error) {
        return reject(`Can't get hash signature for file: ${filename}`);
      }
    });
  }

}

/** hash algorithm types */
export enum HashAlgorithm {
  SHA_1 = 'sha1',
  MD5 = 'md5',
  SHA_256 = 'sha256',
  SHA_512 = 'sha512'
}
