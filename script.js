class Calculator {
  constructor() {
    this.historyDisplay = document.querySelector("#history");
    this.clearHistoryButton = document.querySelector("#clearHistory");
    this.input = document.querySelector("#input");
    this.expression = document.querySelector("#expression");
    this.inputButtons = document.querySelector("#inputButtons");
    this.expressionList = ["+", "-", "*", "/"];
    this.operations = [
      {
        name: "add",
        symbol: "+",
        function: () => {return this.a + this.b}
      },
      {
        name: "subtract",
        symbol: "-",
        function: () => {return this.a - this.b}
      },
      {
        name: "multiply",
        symbol: "*",
        function: () => {return this.a * this.b}
      },
      {
        name: "divide",
        symbol: "/",
        function: () => {return this.b == 0 ? undefined : this.a / this.b}
      },
      {
        name: "equal",
        symbol: "="
      },
      {
        name: "clear",
        symbol: "AC"
      },
      {
        name: "decimal",
        symbol: "."
      },
      {
        name: "posNeg",
        symbol: "+/-"
      },
      {
        name: "del",
        symbol: "del"
      }
    ];

    this.operations.map(operation => this.createOperations(operation));
    this.clearHistoryButton.addEventListener("click", () => this.clearHistory());
  }

  createNumbers() {
    for (let i = 9; i >= 0; i--) {
      this.numberButton = document.createElement("button");
      this.numberButton.setAttribute("class", "buttons");
      this.numberButton.classList.add("numberButtons");
      this.numberButton.setAttribute("id", `button${i}`);
      this.numberButton.textContent = i;

      this.numberButton.addEventListener("click", () => this.inputNumbers(i));

      this.inputButtons.append(this.numberButton);
    }
  }

  createOperations(operation) {
    this.opButton = document.createElement("button");
    this.opButton.setAttribute("class", "buttons");
    this.opButton.classList.add("operationButtons");
    this.opButton.setAttribute("id", operation.name);
    this.opButton.textContent = operation.symbol;

    //functions for add, subtract, multiply, divide
    if (this.expressionList.includes(operation.symbol)) {
      this.opButton.addEventListener("click", () => this.updateExpression(operation.symbol));
    }

    if (operation.name == "decimal") {
      this.opButton.addEventListener("click", () => this.addDecimal());
    }

    if (operation.name == "posNeg") {
      this.opButton.addEventListener("click", () => this.turnNegative());
    }

    if (operation.name == "clear") {
      this.opButton.addEventListener("click", () => this.clear());
    }

    if (operation.name == "del") {
      this.opButton.addEventListener("click", () => this.del());
    }

    if (operation.name == "equal") {
      this.opButton.addEventListener("click", () => this.evaluate());
    }

    this.inputButtons.append(this.opButton);
  }

  inputNumbers(number) {
    if (this.toggleEvalMode()) this.clear();
    if (this.input.textContent.length <= 15) this.input.textContent += number;
  }

  updateExpression(operation) {
    this.toggleEvalMode();

    this.lastExpressionItem = this.expression.textContent.slice(-2, -1);

    //Don't allow operation insert if inputs are blank and don't allow 2 symbols in a row
    //Ignore negative symbol
    if ((this.expression.textContent && !this.expressionList.includes(this.lastExpressionItem) ||
        this.input.textContent) && this.input.textContent != "-") {

      this.expression.textContent += `${this.input.textContent} ${operation} `;
      this.input.textContent = "";
    }
  }

  addDecimal() {
    //Only one decimal point per number
    //Add zero if no number preceding number
    if (!this.input.textContent.includes(".")) {
      this.toggleEvalMode();

      this.lastInputItem = this.input.textContent.slice(-1);

      if (!Number(this.lastInputItem)) this.input.textContent += 0;

      this.input.textContent += ".";
    }
  }

  turnNegative() {
    if (this.toggleEvalMode()) this.clear();

    this.lastInputItem = this.input.textContent.slice(-1);

    if (!Number(this.lastInputItem) && this.lastInputItem != "-") {
      this.input.textContent += "-";
    }
  }

  clear() {
    this.input.textContent = "";
    this.expression.textContent = "";
  }

  del() {
    if (!this.input.textContent) {
      this.lastExpressionItem = this.expression.textContent.slice(-1);

      this.lastExpressionItem == " " //Ignore Spaces
        ? this.expression.textContent = this.expression.textContent.slice(0, -2)
        : this.expression.textContent = this.expression.textContent.slice(0, -1);
    }
    this.input.textContent = this.input.textContent.slice(0, -1);
  }

  evaluate() {
    if (!this.input.textContent || !this.expression.textContent) return;

    this.evalExpression = this.expression.textContent + this.input.textContent;
    this.evalItems = this.evalExpression.split(" ");

    this.performAllOperations("*", "/");
    this.performAllOperations("+", "-");

    this.clear();

    this.roundedResult = this.roundResult(this.evalItems.join());

    this.input.textContent = this.roundedResult;

    this.input.classList.add("evalMode");

    let fullExpression = `${this.evalExpression} = ${this.roundedResult}`;
    this.updateHistory(fullExpression);
    this.setExpressionHistory(fullExpression);
  }

  performAllOperations(operationA, operationB) {
    while (this.evalItems.includes(operationA) || this.evalItems.includes(operationB)) {
      this.operationIndexA = this.evalItems.indexOf(operationA);
      this.operationIndexB = this.evalItems.indexOf(operationB);
      let precedentOperation = this.giveFunctionPrecedence();

      if (precedentOperation) {
        this.setNumbers(precedentOperation - 1, precedentOperation + 1);
        this.setResult(this.evalItems[precedentOperation]);
        this.distillResult(precedentOperation - 1);
      }
    }
  }

  giveFunctionPrecedence() {
    //Perform operation A if: it exists, it comes before B, or B doesn't exist
    return this.operationIndexA > 0 && (this.operationIndexA < this.operationIndexB || this.operationIndexB < 0)
      ? this.operationIndexA
      : this.operationIndexB;
  }

  setNumbers(indexA, indexB) {
    this.a = Number(this.evalItems[indexA]);
    this.b = Number(this.evalItems[indexB]);
  }

  setResult(symbol) {
    let operationFunction = this.operations.findIndex(operation => operation.symbol == symbol);
    this.result = this.operations[operationFunction].function.call();
  }

  distillResult(index) {
    //Expression is distilled into result
    this.evalItems.splice(index, 3, this.result);
  }

  roundResult(number) {return Math.round(number * 1e10) / 1e10;}

  toggleEvalMode() {
    if (this.input.classList.contains("evalMode")) {
      this.input.classList.toggle("evalMode");
      return true;
    }
  }

  setLocalStorage() {localStorage.setItem("expressionHistory", JSON.stringify(this.expressionHistory));}

  setExpressionHistory(fullExpression) {
    this.expressionHistory
      ? this.expressionHistory.push(fullExpression)
      : this.expressionHistory = [fullExpression];

    this.setLocalStorage();
  }

  loadHistory() {
    if (localStorage.expressionHistory) {
      this.expressionHistory = JSON.parse(localStorage.expressionHistory);
      this.expressionHistory.map(fullExpression => this.updateHistory(fullExpression));
    }
  }

  updateHistory(fullExpression) {
    this.storedExpression = document.createElement("span");
    this.storedExpression.setAttribute("class", "storedExpressions");
    this.storedExpression.textContent = fullExpression;

    //limit storage to 10 expressions
    if (this.historyDisplay.children.length >= 10) {
      this.historyDisplay.removeChild(this.historyDisplay.children[0]);

      this.expressionHistory.splice(0, 1);

      this.setLocalStorage();
    }

    this.historyDisplay.append(this.storedExpression);

    this.historyDisplay.scrollTop = this.historyDisplay.scrollHeight;
  }

  clearHistory() {
    for (let i = this.historyDisplay.children.length - 1; i > 0; i--) {
      this.historyDisplay.removeChild(this.historyDisplay.children[i]);
      localStorage.clear();
    }
  }
}

let calculator = new Calculator();
calculator.createNumbers();
calculator.loadHistory();

window.addEventListener("keydown", e => {
  if (e.key == "/") e.preventDefault();
  if (e.key >= 0 && e.key <= 9) calculator.inputNumbers(e.key);
  if (e.key == "-") calculator.turnNegative();
  //Evoke expression function if operation key is pressed
  if (calculator.expressionList.includes(e.key)) calculator.updateExpression(e.key);
  if (e.key == ".") calculator.addDecimal();
  if (e.key == "Backspace") calculator.del();
  if (e.key == "c") calculator.clear();
  if (e.key == "Enter" || e.key == "=") calculator.evaluate();
});
