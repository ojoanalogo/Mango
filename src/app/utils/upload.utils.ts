

import { NotAcceptableError, InternalServerError } from 'routing-controllers';
import config = require('../../config');
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
    const options: multer.Options = {
      storage: multer.diskStorage({
        async destination(_req, _file: Express.Multer.File, cb: (error: Error, destination: string) => void) {
          const profilePicturesFolder = path.join(process.cwd(), config.PROFILE_PICTURES_FOLDER);
          try {
            await UploadUtils.checkUploadsFolder(profilePicturesFolder);
            cb(null, profilePicturesFolder);
          } catch (error) {
            cb(new InternalServerError('Error trying to create uploads folder'), null);
          }
        },
        filename(_req, file, cb) {
          cb(null, Date.now() + file.originalname);
        },
      }),
      fileFilter: (_req, file: Express.Multer.File, cb: (error: Error, acceptFile: boolean) => void) => {
        const admitedFormats = config.PROFILE_PICTURES_ALLOWED_FORMATS;
        const imageFormat = path.extname(file.originalname).split('.')[1];
        admitedFormats.includes(imageFormat)
          ? cb(null, true)
          : cb(new NotAcceptableError('Not acceptable image format'), false);
      },
      limits: {
        fileSize: config.PROFILE_PICTURES_MAX_SIZE,
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
    const resolutions: Array<number> = config.PROFILE_PICTURES_RESOLUTIONS;
    resolutions.map((res: number) => res.toString())
      .forEach(async (res: string) => {
        await fs.mkdir(profilePicturesFolder + '/' + res);
      });
  }

  /**
	 * Returns hash for file
	 * @param filename - Filename
	 * @param algorithm - Hash algorithm
	 * @returns File hash
	 */
  public static getFileHash(filename: string, algorithm = 'md5'): Promise<string> {
    return new Promise((resolve, reject) => {
      // Algorithm depends on availability of OpenSSL on platform
      // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
      const shasum = crypto.createHash(algorithm);
      try {
        const s = fs.createReadStream(filename);
        s.on('data', function (data) {
          shasum.update(data);
        });
        // making digest
        s.on('end', function () {
          const hash = shasum.digest('hex');
          return resolve(hash);
        });
      } catch (error) {
        return reject(`Can't get hash signature for file: ${filename}`);
      }
    });
  }

}
