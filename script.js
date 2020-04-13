class Calculator {
  constructor() {
    this.history = document.querySelector("#history");
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
    this.round = float => Math.round(float * 1e12) / 1e12;
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
    if (this.input.classList.contains("evalMode")) this.toggleEvalMode();
    if (this.input.textContent.length <= 15) this.input.textContent += number;
  }

  updateExpression(operation) {
    if (this.input.classList.contains("evalMode")) this.input.classList.toggle("evalMode");

    this.lastItem = this.expression.textContent.slice(-2, -1);

    //Don't allow operation insert if inputs are blank and don't allow 2 symbols in a row
    //Ignore negative symbol
    if ((this.expression.textContent && !this.expressionList.includes(this.lastItem) ||
        this.input.textContent) && this.input.textContent != "-") {
      this.expression.textContent += `${this.input.textContent} ${operation} `;
      this.input.textContent = "";
    }
  }

  addDecimal() {
    //Only one decimal point per number
    //Add zero if no number preceding number
    if (!this.input.textContent.includes(".")) {
       if (!Number(this.input.textContent.slice(-1))) this.input.textContent += 0;
      this.input.textContent += ".";
    }
  }

  turnNegative() {
    if (this.input.classList.contains("evalMode")) this.toggleEvalMode();

    this.lastItem = this.input.textContent.slice(-1);

    if (!Number(this.lastItem) && this.lastItem != "-") {
      this.input.textContent += "-";
    }
  }

  clear() {
    this.input.textContent = "";
    this.expression.textContent = "";
  }

  del() {
    if (!this.input.textContent) {
      this.lastItem = this.expression.textContent.slice(-1);

      this.lastItem == " " //Ignore Spaces
        ? this.expression.textContent = this.expression.textContent.slice(0, -2)
        : this.expression.textContent = this.expression.textContent.slice(0, -1);
    }
    this.input.textContent = this.input.textContent.slice(0, -1);
  }

  toggleEvalMode() {
    this.input.classList.toggle("evalMode");
    this.clear();
  }

  evaluate() {
    if (!this.input.textContent || !this.expression.textContent) return;

    this.evalExpression = this.expression.textContent + this.input.textContent;
    this.evalItems = this.evalExpression.split(" ");

    this.performAllOperations("*", "/");
    this.performAllOperations("+", "-");

    this.clear();

    this.roundedResult = this.round(this.evalItems.join());

    this.input.textContent = this.roundedResult;

    this.input.classList.toggle("evalMode");

    this.updateHistory();
    this.setLocalStorage();
  }

  performAllOperations(operationA, operationB) {
    while (this.evalItems.includes(operationA) || this.evalItems.includes(operationB)) {
      let operationIndexA = this.evalItems.indexOf(operationA);
      let operationIndexB = this.evalItems.indexOf(operationB);

      if (this.checkFunctionPrecedence(operationIndexA, operationIndexB)) {
        this.setNumbers(operationIndexA - 1, operationIndexA + 1);
        this.setResult(operationA);
        this.distillResult(operationIndexA - 1);
      }
      if (this.checkFunctionPrecedence(operationIndexB, operationIndexA)) {
        this.setNumbers(operationIndexB - 1, operationIndexB + 1);
        this.setResult(operationB);
        this.distillResult(operationIndexB - 1);
      }
    }
  }

  checkFunctionPrecedence(operationIndexA, operationIndexB) {
    //Perform operation A if: it exists, it comes before B, or B doesn't exist
    return operationIndexA > 0 && (operationIndexA < operationIndexB || operationIndexB < 0);
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
    this.evalItems.splice(index, 3, this.result);
  }

  setLocalStorage() {
    this.newExpression = {expression: this.evalExpression, result: this.roundedResult};
    this.historyArray = [];

    if (localStorage.history) this.historyArray = JSON.parse(localStorage.history);

    this.historyArray.push(this.newExpression);

    localStorage.setItem("history", JSON.stringify(this.historyArray));
  }

  loadHistory() {
    if (!localStorage.history) return;

    this.historyArray = JSON.parse(localStorage.history);
    this.historyArray.map(item => {
      this.evalExpression = item.expression;
      this.roundedResult = item.result;
      this.updateHistory()
    });
  }

  updateHistory() {
    this.storedExpression = document.createElement("span");
    this.storedExpression.setAttribute("class", "storedExpressions");
    this.storedExpression.textContent = `${this.evalExpression} = ${this.roundedResult}`

    //limit storage to 10 expressions
    if (this.history.children.length >= 10) {
      this.history.removeChild(this.history.children[0]);

      this.historyArray = JSON.parse(localStorage.history)
      this.historyArray.splice(0, 1);
      localStorage.setItem("history", JSON.stringify(this.historyArray));
    }

    this.history.append(this.storedExpression);

    this.history.scrollTop = this.history.scrollHeight;
  }

  clearHistory() {
    for (let i = this.history.children.length - 1; i > 0; i--) {
      this.history.removeChild(this.history.children[i]);
      localStorage.clear();
    }
  }
}

let calculator = new Calculator();
calculator.createNumbers();
calculator.loadHistory();

window.addEventListener("keydown", addKeyboard);

function addKeyboard(e) {
  if (e.key == "/") e.preventDefault();
  if (e.key >= 0 && e.key <= 9) calculator.inputNumbers(e.key);
  if (e.key == "-") calculator.turnNegative();
  //Evoke expression function if operation key is pressed
  if (calculator.expressionList.includes(e.key)) calculator.updateExpression(e.key);
  if (e.key == ".") calculator.addDecimal();
  if (e.key == "Backspace") calculator.del();
  if (e.key == "c") calculator.clear();
  if (e.key == "Enter" || e.key == "=") calculator.evaluate();
}
