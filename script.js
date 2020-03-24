const calculator = document.querySelector("#calculator");
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
  {name: "clear",symbol: "AC"},
  {name: "decimal",symbol: "."},
  {name: "posNeg", symbol: "+/-"},
  {name: "del", symbol: "del"}
]

window.onload = function() {
  input.textContent = "";
  createNumbers();
}

function createNumbers() {
  for (i = 9; i >= 0; i--) {
    let button = document.createElement("button");
    button.setAttribute("class", "buttons");
    button.classList.add("numberButtons");
    button.setAttribute("id", `button${i}`);
    button.textContent = i;

    button.addEventListener("click", () => {
      input.textContent += button.id.replace(/\D/g, "");
    });

    inputButtons.append(button);
  }
}

operations.map(operation => createOperations(operation));

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

  if (operation.name == "equal") {
    button.addEventListener("click", () => {updateExpression(); evaluate()});
  }

  inputButtons.append(button);
}

function addDecimal() {
  if (Number(input.textContent.slice(-1)) && !input.textContent.includes(".")) {
    input.textContent += ".";
  }
}

function updateExpression(operation = "") {
  let lastItem = expression.textContent.slice(-2, -1);
  if (lastItem != "" && !expressionList.includes(lastItem) || input.textContent != "") {
    expression.textContent += `${input.textContent} ${operation} `;
    input.textContent = "";
  }
}

function evaluate() {
  let evalItems = expression.textContent.split(" ");
  
  let operator = "";
  evalItems.reduce((total, item) => {
    console.log(item);
  }, 0);
}
