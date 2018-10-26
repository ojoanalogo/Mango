import { Container } from 'typedi';
import { useContainer as useContainerForRouting } from 'routing-controllers';
import { createConnection, useContainer as useContainerForOrm } from 'typeorm';

beforeAll(async function () {
    console.log('called');
    this.timeout(10000);
    useContainerForOrm(Container);
    useContainerForRouting(Container);
    // const options = Object.assign({}, config['database']);
    // options['logging'] = [/*'query',*/ 'error'];
    // options['entities'] = [
    //     __dirname + "/../src/entities/{*.ts,*.js}"
    // ];
    // await createConnection();
});
