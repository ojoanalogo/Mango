import { NotAcceptableError } from 'routing-controllers';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import * as crypto from 'crypto';
export class UploadUtils {

    public static getMulterOptions() {
        const options: multer.Options = {
            storage: multer.diskStorage({
                destination(req, fileName, cb) {
                    const profilePicturesFolder = '../../uploads/profile_pictures';
                    if (!fs.existsSync(path.join(__dirname, profilePicturesFolder))) {
                        fs.mkdirSync(path.join(__dirname, profilePicturesFolder));
                    }
                    cb(null, path.join(__dirname, profilePicturesFolder));
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
                fileSize: 2097152
            }
        };
        return options;
    }

    public static fileHash(filename, algorithm = 'md5'): Promise<string> {
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
                return reject('calc fail');
            }
        });
    }

}
