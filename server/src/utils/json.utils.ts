import { Service } from 'typedi';

@Service()
export abstract class JSONUtils<T> {

    public commonUserProperties =
    ['user_role', 'registered_at', 'email_validated', 'id', 'email', 'first_name', 'second_name', 'tokenData'];

    /**
     * This function filters keys supplied in parameter from JSON object
     * @param data data to clean
     * @param toAdd keys to be added
     */
    public filterDataFromObject(data: any, toAdd: string[]): T {
        return Object.assign({}, ...toAdd.map(k => k in data ? {[k]: data[k]} : {}));
    }
    /**
     * This function filters keys supplied in parameter for JSON objects
     * @param data data to clean
     * @param toAdd keys to be added
     */
    public filterDataFromObjects(dataSet: any[], toAdd: string[]): T[] {
        const filteredData = [];
        dataSet.forEach((data) => {
            filteredData.push(this.filterDataFromObject(data, toAdd));
        });
        return filteredData;
    }
}
