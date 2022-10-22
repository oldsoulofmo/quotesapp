const authorInput = document.querySelector("#author");
const contentInput = document.querySelector("#content");
const qc = document.querySelector(".quotes-container");
const form = document.querySelector("form");

const request = window.indexedDB.open("quoteDB", 2);
let db;

request.onerror = function (event) {
  console.error("An error occurred with IndexedDB");
  console.error(event);
};

request.onupgradeneeded = function () {
  const db = request.result;
  const library = db.createObjectStore("quotes", {
    keyPath: "id",
    autoIncrement: true,
  });
  library.createIndex("author", "author", {
    unique: false,
  });
  library.createIndex("content", "content", {
    unique: false,
  });
};

request.onsuccess = function () {
  db = request.result;
  displayData();
};
const displayData = function () {
  while (qc.firstChild) {
    qc.removeChild(qc.firstChild);
  }
  const library = db.transaction("quotes").objectStore("quotes");
  library.openCursor().addEventListener("success", (e) => {
    const cursor = e.target.result;
    if (cursor) {
      const quote = document.createElement("div");
      const h3 = document.createElement("h3");
      const span = document.createElement("span");
      const para = document.createElement("p");

      quote.appendChild(h3);
      quote.appendChild(para);
      h3.appendChild(span);
      qc.appendChild(quote);

      span.textContent = cursor.value.author;
      para.textContent = cursor.value.content;

      quote.style.margin = "50px";
      para.style.padding = "5px";
      h3.style.padding = "5px";

      const children = [...qc.childNodes];
      children.forEach((div, i) => {
        if (i % 2 === 0) {
          div.style.backgroundColor = "#e9c46a";
        } else {
          div.style.backgroundColor = "#f28482";
        }
      });

      cursor.continue();
    }
  });
};

const addData = function (e) {
  e.preventDefault();
  db = request.result;
  const newQuote = { author: authorInput.value, content: contentInput.value };
  const tx = db.transaction("quotes", "readwrite");
  const library = tx.objectStore("quotes");
  const addQuote = library.add(newQuote);
  addQuote.addEventListener("success", () => {
    authorInput.value = "";
    contentInput.value = "";
  });
  console.log(newQuote);
  tx.addEventListener("complete", () => {
    console.log("Transaction completed: database modification finished.");
    displayData();
  });
};

form.addEventListener("submit", addData);
