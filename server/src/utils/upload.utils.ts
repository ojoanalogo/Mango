import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';

export class UploadUtils {
    public static getMulterOptions() {
        const options = {
            storage: multer.diskStorage({
                destination(req, fileName, cb) {
                    if (!fs.existsSync('uploads/')) {
                        fs.mkdirSync('uploads/');
                    }
                    cb(null, 'uploads/');
                },
                filename(req, fileName, cb) {
                    const ext = path.extname(fileName.originalname);
                    cb(null, path.basename(fileName.originalname, ext) + new Date().valueOf() + ext);
                },
            })
        };
        return options;
    }
}
