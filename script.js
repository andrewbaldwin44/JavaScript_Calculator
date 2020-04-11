class Calculator {
  constructor() {
    this.history = document.querySelector("#history");
    this.clearHistoryButton = document.querySelector("#clearHistory");
    this.input = document.querySelector("#input");
    this.expression = document.querySelector("#expression");
    this.inputButtons = document.querySelector("#inputButtons");
    this.expressionList = ["+", "-", "*", "/"];
    this.operations = [
      {name: "add", symbol: "+"},
      {name: "subtract", symbol: "-"},
      {name: "multiply", symbol: "*"},
      {name: "divide", symbol: "/"},
      {name: "equal", symbol: "="},
      {name: "clear", symbol: "AC"},
      {name: "decimal", symbol: "."},
      {name: "posNeg", symbol: "+/-"},
      {name: "del", symbol: "del"}
    ];

    this.operations.map(operation => this.createOperations(operation));
    this.clearHistoryButton.addEventListener("click", clearHistory);
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
    if (this.input.classList.contains("evalMode")) {
      this.input.classList.toggle("evalMode");
      this.clear();
    }

    if (this.input.textContent.length <= 15) this.input.textContent += number;
  }

  updateExpression(operation) {
    if (this.input.classList.contains("evalMode")) this.input.classList.toggle("evalMode");

    this.lastItem = this.expression.textContent.slice(-2, -1);

    //Don't allow operation insert if inputs are blank and don't allow 2 symbols in a row
    //Ignore negative symbol
    if ((this.lastItem != "" && !this.expressionList.includes(this.lastItem) ||
        this.input.textContent != "") && this.input.textContent != "-") {
      this.expression.textContent += `${this.input.textContent} ${operation} `;
      this.input.textContent = "";
    }
  }

  addDecimal() {
    //Only one decimal point per number
    //Add zero if no number preceding decimal
    if (!this.input.textContent.includes(".")) {
       if (!Number(this.input.textContent.slice(-1))) this.input.textContent += 0;
      this.input.textContent += ".";
    }
  }

  turnNegative() {
    if (this.input.classList.contains("evalMode")) {
      this.input.classList.toggle("evalMode");
      this.clear();
    }

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
    if (this.input.textContent == "") {
      this.lastItem = this.expression.textContent.slice(-1);

      this.lastItem == " " //Ignore Spaces
        ? this.expression.textContent = expression.textContent.slice(0, -2)
        : this.expression.textContent = expression.textContent.slice(0, -1);
    }
    this.input.textContent = this.input.textContent.slice(0, -1);
  }

  evaluate() {
    if (this.input.textContent == "" || this.expression.textContent == "") return;

    this.evalExpression = this.expression.textContent + this.input.textContent;
    this.evalItems = this.evalExpression.split(" ");

    while (this.evalItems.includes("/") || this.evalItems.includes("*")) {
      this.divIndex = this.evalItems.indexOf("/");
      this.multIndex = this.evalItems.indexOf("*"); //If no occurence, index = -1

      //If both multiply and divide, left to right
      //Else just divide
      if (this.divIndex > 0 && (this.divIndex < this.multIndex || this.multIndex < 0)) {
        this.divResult = this.evalItems[this.divIndex-1] / this.evalItems[this.divIndex+1];

        if (this.evalItems[this.divIndex+1] == 0) this.divResult = undefined;

        this.evalItems.splice(this.divIndex-1, 3, this.divResult);
      }

      //Only multiply after divisions
      if (this.multIndex > 0 && (this.multIndex < this.divIndex || this.divIndex < 0)) {
        this.multResult = this.evalItems[this.multIndex-1] * this.evalItems[this.multIndex+1];

        this.evalItems.splice(this.multIndex-1, 3, this.multResult);
      }
    }

    while (this.evalItems.includes("+") || this.evalItems.includes("-")) {
      this.addIndex = this.evalItems.indexOf("+");
      this.subIndex = this.evalItems.indexOf("-");

      //Left to right or just add
      if (this.addIndex > 0 && (this.addIndex < this.subIndex || this.subIndex < 0)) {
        this.addResult = Number(this.evalItems[this.addIndex-1]) + Number(this.evalItems[this.addIndex+1]);
        this.evalItems.splice(this.addIndex-1, 3, this.addResult);
      }

      if (this.subIndex > 0 && (this.subIndex < this.addIndex || this.addIndex < 0)) {
        this.subResult = Number(this.evalItems[this.subIndex-1]) - Number(this.evalItems[this.subIndex+1]);
        this.evalItems.splice(this.subIndex-1, 3, this.subResult);
      }
    }
    this.clear();

    this.roundedResult = this.round(this.evalItems[0]);

    this.input.textContent = this.roundedResult;
    this.input.classList.toggle("evalMode");

    this.updateHistory(this.evalExpression, this.roundedResult);
    this.setLocalStorage(this.evalExpression, this.roundedResult);
  }

  setLocalStorage(evalExpression, result) {
    this.newExpression = {expression: evalExpression, result: result};
    this.historyArray = [];

    if (localStorage.history) this.historyArray = JSON.parse(localStorage.history);

    this.historyArray.push(this.newExpression);

    localStorage.setItem("history", JSON.stringify(this.historyArray));
  }

  loadHistory() {
    if (!localStorage.history) return;

    this.historyArray = JSON.parse(localStorage.history);
    this.historyArray.map(item => this.updateHistory(item.expression, item.result));
  }

  updateHistory(evalExpression, result) {
    this.storedExpression = document.createElement("span");
    this.storedExpression.setAttribute("class", "storedExpressions");
    this.storedExpression.textContent = `${evalExpression} = ${result}`

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
    for (i = this.history.children.length - 1; i > 0; i--) {
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
  e.preventDefault();
  if (e.key >= 0 && e.key <= 9) calculator.inputNumbers(e.key);
  if (e.key == "-") calculator.turnNegative();
  //Evoke expression function if operation key is pressed
  if (calculator.expressionList.includes(e.key)) calculator.updateExpression(e.key);
  if (e.key == ".") calculator.addDecimal();
  if (e.key == "Backspace") calculator.del();
  if (e.key == "c") calculator.clear();
  if (e.key == "Enter" || e.key == "=") calculator.evaluate();
}
