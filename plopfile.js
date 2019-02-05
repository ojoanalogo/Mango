const generator = (plop) => {
  plop.setGenerator('module', {
    description: 'This profile adds a new module to Mango',
    prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Module name'
    },
    {
      type: 'input',
      name: 'route',
      message: 'Controller route'
    }
    ],
    actions: [{
      type: 'add',
      path: './src/api/{{name}}/{{name}}.controller.ts',
      templateFile: './plop-templates/controller.hbs'
    },
    {
      type: 'add',
      path: './src/api/{{name}}/{{name}}.service.ts',
      templateFile: './plop-templates/service.hbs'
    },
    {
      type: 'add',
      path: './src/api/{{name}}/{{name}}.repository.ts',
      templateFile: './plop-templates/repository.hbs'
    }
    ]
  });
  // convert to upper case
  plop.setHelper('upperCase', (text) => text.toUpperCase());
  // convert first char to upper case
  plop.setHelper('firstUpperCase', (text) => text.charAt(0).toUpperCase() + text.slice(1));
};

module.exports = generator;
