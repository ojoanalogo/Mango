const generator = (plop) => {
    plop.setGenerator('controller', {
        description: 'This profile adds a new controller to Mango',
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'Controller name'
        },
        {
            type: 'input',
            name: 'route',
            message: 'Controller route'
        }],
        actions: [{
            type: 'add',
            path: './src/controllers/{{name}}.controller.ts',
            templateFile: './plop-templates/controller.hbs'
        }]
    });
    plop.setGenerator('service', {
        description: 'This profile adds a new service to Mango',
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'Service name'
        }],
        actions: [{
            type: 'add',
            path: './src/services/{{name}}.service.ts',
            templateFile: './plop-templates/service.hbs'
        }]
    })
    // convert to upper case
    plop.setHelper('upperCase', (text) => text.toUpperCase());
    // convert first char to upper case
    plop.setHelper('firstUpperCase', (text) => text.charAt(0).toUpperCase() + text.slice(1));
};

module.exports = generator;
