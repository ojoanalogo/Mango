import { NotAcceptableError, InternalServerError } from 'routing-controllers';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as multer from 'multer';
import * as crypto from 'crypto';

export class UploadUtils {

  /**
   * Returns profile picture resolutions
   */
  public static getProfilePictureResolutions(): Array<number> {
    return [32, 64, 96, 240, 480];
  }

  /**
   * Gets Multer options for profile picture upload
   * @returns Multer options
   */
  public static getProfileUploadMulterOptions(): multer.Options {
    const options: multer.Options = {
      storage: multer.diskStorage({
        async destination(_req, _fileName, cb) {
          const uploadsFolder = path.join(__dirname, '../../public');
          const profilePicturesFolder = path.join(__dirname, '../../public/profile_pictures');
          try {
            await UploadUtils.checkUploadsFolder(uploadsFolder, profilePicturesFolder);
            cb(null, profilePicturesFolder);
          } catch (error) {
            cb(new InternalServerError('Error trying to create uploads folder'), null);
          }
        },
        filename(_req, fileName, cb) {
          cb(null, Date.now() + fileName.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        const admitedFormats =
          ['jpg', 'jpeg', 'JPG', 'JPEG', 'png', 'PNG'];
        const imageFormat = path.extname(file.originalname).split('.')[1];
        admitedFormats.includes(imageFormat) ? cb(null, true)
          : cb(new NotAcceptableError('Not acceptable image format'), false);
      },
      limits: {
        fileSize: 54525952, // 5mb
        files: 1
      }
    };
    return options;
  }

  /**
   * Create uploads folder if not exists
   * @param uploadsFolder Uploads folder url
   * @param profilePicturesFolder Profile pictures folder url
   */
  private static async checkUploadsFolder(uploadsFolder: string, profilePicturesFolder: string): Promise<void> {
    const uploadsFolderExists = await fs.pathExists(uploadsFolder);
    const profilePicturesFolderExists = await fs.pathExists(profilePicturesFolder);
    if (!uploadsFolderExists) {
      await fs.mkdir(uploadsFolder);
    }
    if (!profilePicturesFolderExists) {
      await fs.mkdir(profilePicturesFolder);
      UploadUtils.getProfilePictureResolutions()
        .map((res: number) => res.toString())
        .forEach(async (res: string) => {
          await fs.mkdir(profilePicturesFolder + '/' + res);
        });
    }
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
