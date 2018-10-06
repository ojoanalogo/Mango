import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import { NotAcceptableError } from 'routing-controllers';
export class UploadUtils {
    public static getMulterOptions() {
        const options: multer.Options = {
            storage: multer.diskStorage({
                destination(req, fileName, cb) {
                    if (!fs.existsSync(path.join(__dirname, '../../uploads/'))) {
                        fs.mkdirSync(path.join(__dirname, '../../uploads/'));
                        fs.mkdirSync(path.join(__dirname, '../../uploads/thumbnails'));
                    }
                    cb(null, path.join(__dirname, '../../uploads/'));
                },
                filename(req, fileName, cb) {
                    const ext = path.extname(fileName.originalname);
                    cb(null, new Date().valueOf() + ext);
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
}
