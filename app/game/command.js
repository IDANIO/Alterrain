class Command {
  constructor(executeFn) {
    this.executeFn = executeFn;
  }
  execute() {
   this.executeFn();
  }
}

module.exports = Command;
