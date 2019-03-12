import program from 'commander';
import { Container } from 'typedi';
import { Database } from '../src/app/database/database';

export class DatabaseCLI {
  constructor() {
    this.setupProgram();
  }

  private setupProgram(): void {
    program.
  }
}

exports.default = new DatabaseCLI();
