const history = document.querySelector("#history");
const clearHistoryButton = document.querySelector("#clearHistory");
const input = document.querySelector("#input");
const expression = document.querySelector("#expression");
const inputButtons = document.querySelector("#inputButtons");

const expressionList = ["+", "-", "*", "/"];
const operations = [
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

let round = float => Math.round(float * 1000000000000) / 1000000000000;

window.onload = function() {
  clear();
  createNumbers();
  operations.map(operation => createOperations(operation));
  loadHistory();
}

window.addEventListener("keydown", addKeyboard);

function clear() {
  input.textContent = "";
  expression.textContent = "";
}

clearHistoryButton.addEventListener("click", clearHistory);

function del() {
  input.textContent = input.textContent.slice(0, -1);
}

function addKeyboard(e) {
  if (e.key >= 0 && e.key <= 9) inputNumbers(e.key);
  if (e.key == "-") turnNegative();
  //Evoke expresison function if operation key is pressed
  if (expressionList.includes(e.key)) updateExpression(e.key);
  if (e.key == ".") addDecimal();
  if (e.key == "Backspace") del();
  if (e.key == "c") clear();
  if (e.key == "Enter" || e.key == "=") evaluate();
}

function inputNumbers(number) {
  if (input.classList.contains("evalMode")) {
    input.classList.toggle("evalMode");
    clear();
  }

  if (input.textContent.length <= 15) input.textContent += number;
}

function addDecimal() {
  //Only one decimal point per number
  //Add zero if no number preceding decimal
  if (!input.textContent.includes(".")) {
     if (!Number(input.textContent.slice(-1))) input.textContent += 0;
    input.textContent += ".";
  }
}

function turnNegative() {
  if (input.classList.contains("evalMode")) {
    input.classList.toggle("evalMode");
    clear();
  }

  let lastItem = input.textContent.slice(-1);

  if (!Number(lastItem) && lastItem != "-") {
    input.textContent += "-";
  }
}

function setLocalStorage(evalExpression, result) {
  let newExpression = {expression: evalExpression, result: result};
  let historyArray = [];

  if (localStorage.history) historyArray = JSON.parse(localStorage.history);

  historyArray.push(newExpression);

  localStorage.setItem("history", JSON.stringify(historyArray));
}

function clearHistory() {
  for (i = history.children.length - 1; i > 0; i--) {
    history.removeChild(history.children[i]);
    localStorage.clear();
  }
}

function loadHistory() {
  if (!localStorage.history) return;

  let historyArray = JSON.parse(localStorage.history);
  historyArray.map(item => updateHistory(item.expression, item.result));
}

function updateHistory(evalExpression, result) {
  let storedExpression = document.createElement("span");
  storedExpression.setAttribute("class", "storedExpressions");
  storedExpression.textContent = `${evalExpression} = ${result}`

  //limit storage to 10 expressions
  if (history.children.length >= 10) {
    history.removeChild(history.children[0]);

    let historyArray = JSON.parse(localStorage.history)
    historyArray.splice(0, 1);
    localStorage.setItem("history", JSON.stringify(historyArray));
  }

  history.append(storedExpression);

  history.scrollTop = history.scrollHeight;
}

function updateExpression(operation) {
  if (input.classList.contains("evalMode")) input.classList.toggle("evalMode");

  let lastItem = expression.textContent.slice(-2, -1);

  //Don't allow operation insert if inputs are blank and don't allow 2 symbols in a row
  //Ignore negative symbol
  if ((lastItem != "" && !expressionList.includes(lastItem) || input.textContent != "") &&
        input.textContent != "-") {
    expression.textContent += `${input.textContent} ${operation} `;
    input.textContent = "";
  }
}

function evaluate() {
  if (input.textContent == "" || expression.textContent == "") return;

  let evalExpression = expression.textContent + input.textContent;
  let evalItems = evalExpression.split(" ");

  while (evalItems.includes("/") || evalItems.includes("*")) {
    let divIndex = evalItems.indexOf("/");
    let multIndex = evalItems.indexOf("*"); //If no occurence, index = -1

    //If both multiply and divide needed, left to right
    //Else just divide
    if (divIndex > 0 && (divIndex < multIndex || multIndex < 0)) {
      let divResult = evalItems[divIndex-1] / evalItems[divIndex+1];

      if (evalItems[divIndex+1] == 0) divResult = undefined;

      evalItems.splice(divIndex-1, 3, divResult);
    }

    //Only multiply after divisions
    if (multIndex > 0 && (multIndex < divIndex || divIndex < 0)) {
      let multResult = evalItems[multIndex-1] * evalItems[multIndex+1];

      evalItems.splice(multIndex-1, 3, multResult);
    }
  }

  while (evalItems.includes("+") || evalItems.includes("-")) {
    let addIndex = evalItems.indexOf("+");
    let subIndex = evalItems.indexOf("-");

    //Left to right or just add
    if (addIndex > 0 && (addIndex < subIndex || subIndex < 0)) {
      let addResult = Number(evalItems[addIndex-1]) + Number(evalItems[addIndex+1]);
      evalItems.splice(addIndex-1, 3, addResult);
    }

    if (subIndex > 0 && (subIndex < addIndex || addIndex < 0)) {
      let subResult = Number(evalItems[subIndex-1]) - Number(evalItems[subIndex+1]);
      evalItems.splice(subIndex-1, 3, subResult);
    }
  }
  clear();

  let roundedResult = round(evalItems[0]);

  input.textContent = roundedResult;
  input.classList.toggle("evalMode");

  updateHistory(evalExpression, roundedResult);
  setLocalStorage(evalExpression, roundedResult);
}

function createNumbers() {
  for (i = 9; i >= 0; i--) {
    let button = document.createElement("button");
    button.setAttribute("class", "buttons");
    button.classList.add("numberButtons");
    button.setAttribute("id", `button${i}`);
    button.textContent = i;

    button.addEventListener("click", () => inputNumbers(button.id.replace(/\D/g, "")));

    inputButtons.append(button);
  }
}

function createOperations(operation) {
  let button = document.createElement("button");
  button.setAttribute("class", "buttons");
  button.classList.add("operationButtons");
  button.setAttribute("id", operation.name);
  button.textContent = operation.symbol;

  if (expressionList.includes(operation.symbol)) {
    button.addEventListener("click", () => updateExpression(operation.symbol));
  }

  if (operation.name == "decimal") {
    button.addEventListener("click", addDecimal);
  }

  if (operation.name == "posNeg") {
    button.addEventListener("click", turnNegative);
  }

  if (operation.name == "clear") {
    button.addEventListener("click", clear);
  }

  if (operation.name == "del") {
    button.addEventListener("click", del);
  }

  if (operation.name == "equal") {
    button.addEventListener("click", () => {evaluate()});
  }

  inputButtons.append(button);
}
