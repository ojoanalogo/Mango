import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import * as crypto from 'crypto';
import { NotAcceptableError } from 'routing-controllers';

export class UploadUtils {

    /**
     * Gets Multer options for profile picture upload
     * @returns Multer options
     */
    public static getProfileUploadMulterOptions(): multer.Options {
        const options: multer.Options = {
            storage: multer.diskStorage({
                destination(req, fileName, cb) {
                    const uploadsFolder = path.join(__dirname, '../../public');
                    const profilePicturesFolder = path.join(__dirname, '../../public/profile_pictures');
                    if (!fs.existsSync(uploadsFolder)) {
                        fs.mkdirSync(uploadsFolder);
                    }
                    if (!fs.existsSync(profilePicturesFolder)) {
                        fs.mkdirSync(profilePicturesFolder);
                        fs.mkdirSync(profilePicturesFolder + '/32');
                        fs.mkdirSync(profilePicturesFolder + '/64');
                        fs.mkdirSync(profilePicturesFolder + '/96');
                        fs.mkdirSync(profilePicturesFolder + '/240');
                        fs.mkdirSync(profilePicturesFolder + '/480');
                    }
                    cb(null, profilePicturesFolder);
                },
                filename(req, fileName, cb) {
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
