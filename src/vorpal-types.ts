export class Option {

  name: string;
  description: string;
  autocomplete: string[];

  constructor(name: string, description: string, autocomplete: string[]) {
    this.name = name;
    this.description = description;
    this.autocomplete = autocomplete;
  }

}

export interface ICommand {
  name: string;
  description: string;
  options: Option[];
  execute(vorpal: any, args: any): Promise<any>;
}

export abstract class Command {
  name: string;
  description: string;
  options: Option[] = [];

  constructor(name: string, description: string, options: Option[]) {
    this.name = name;
    this.description = description;
    options.forEach((option: Option) => {
      this.options.push(option);
    });
  }

  abstract execute(vorpal: any, args: any): Promise<any>;

}

export interface IMode {
  name: string;
  description: string;
  delimiter: string;
  options: Option[];

  init(vorpal: any, args: any): Promise<any>;
  execute(vorpal: any, args: any): Promise<any>;

}


export abstract class Mode extends Command implements IMode {

  delimiter: string;

  constructor(name: string, description: string, delimiter: string, options: Option[]) {
    super(name, description, options);
    this.delimiter = delimiter;
  }

  abstract init(vorpal: any, args: any): Promise<any>;
  abstract execute(vorpal: any, args: any): Promise<any>;

}
