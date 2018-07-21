export class JSONUtils {
    /**
     * This function filters keys supplied in parameter from JSON object
     * @param data data to clean
     * @param toAdd keys to be added
     */
    static filterDataFromObject(data: any, toAdd: any[]): any[] {
        return Object.assign({}, ...toAdd.map(k => k in data ? {[k]: data[k]} : {}));
    }
}
