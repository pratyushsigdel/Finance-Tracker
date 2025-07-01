//Selection of different variables
const btns = document.querySelectorAll(".btn");

const modal = document.querySelector(".modal");

const close = document.querySelector(".close-btn");

const form = document.getElementById("transaction-form");

const descriptionInput = document.getElementById("description");

const amountInput = document.getElementById("amount");

const dateInput = document.getElementById("date");

const categoryInput = document.querySelectorAll("input[name = 'category']");

const descError = document.getElementById("desc-error");

const amountError = document.getElementById("amount-error");

const dateError = document.getElementById("date-error");

const sectionContent = document.querySelector(".section-content");

const searchInput = document.getElementById("search-input");

const sortSelect = document.getElementById("sort-select");

const filterSelect = document.getElementById("filter-select");

const controls = document.querySelector(".filter-controls");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let filteredTransaction = [...transactions];

const transaction = document.querySelector(".transaction");

const dashboard = document.querySelector(".dashboard");

// Display the modal once user clicks on the button
btns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    modal.classList.remove("hidden");
  });
});

//Hide Modal When User clicks close button
close.addEventListener("click", function () {
  modal.classList.add("hidden");
});

//Close modal when clicking outside the modal-content

modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

//Validating The Overall Form
form.addEventListener("submit", function (e) {
  e.preventDefault();

  //Trimming Inputs From The User

  const description = descriptionInput.value.trim();
  const amount = amountInput.value.trim();
  const date = dateInput.value;
  const selectedCategory = Array.from(categoryInput).find(
    (input) => input.checked
  )?.value;

  let valid = true;

  //Validating The Description
  if (!description || description.length <= 3) {
    descError.classList.remove("hidden");
    valid = false;
  } else {
    descError.classList.add("hidden");
  }

  //Validating The Amount

  if (isNaN(amount) || !amount || amount < 0) {
    amountError.classList.remove("hidden");
    valid = false;
  } else {
    amountError.classList.add("hidden");
  }

  //Validating The Category
  if (!selectedCategory) {
    alert("Please select a Category: Income Or Expense");
    valid = false;
  }

  //Validating The Date

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(date);
  inputDate.setHours(0,0,0,0);

  if (!date || inputDate > today) {
    dateError.classList.remove("hidden");
    valid = false;
  } else {
    dateError.classList.add("hidden");
  }

  if (!valid) return;

  //Creating new Transaction object

  const transaction = {
    id: Math.random() * 100,
    description: description,
    amount: Number(amount),
    category: selectedCategory,
    date: date,
  };

  //Saving the Transaction

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  filteredTransaction = [...transactions];
  applyFilters();
  renderTransaction();
  updateDashboard();

  //Resetting the form and hiding the modal
  form.reset();
  modal.classList.add("hidden");
});

//ADding an event listener for the sectioncontent to check whether it contains the specific button

sectionContent.addEventListener("click", function (e) {
  if (e.target.classList.contains("add-transaction-btn")) {
    modal.classList.remove("hidden");
  }
});

//Function To render Transaction in HTML document
function renderTransaction(data = transactions) {
  // const transactionData = JSON.parse(localStorage.getItem("transactions")) || [];

  sectionContent.innerHTML = "";

  if (data.length === 0) {
    controls.classList.add("hidden");
    sectionContent.classList.add("center-content");
    sectionContent.innerHTML = `
            <div class="section-image">
                <img src="./Frame.png" alt="Frame">
            </div>
            <div class="section-heading">
                <h3> No Transactions Yet</h3>
            </div>
            <span> Start Tracking Your Finances by Adding your First Transaction</span>
            <div class="section-button">
                <button type="button" class="btn add-transaction-btn"> Add Transaction</button>
            </div>
        `;
    return;
  }

  controls.classList.remove("hidden");

  sectionContent.classList.remove("center-content");

  const div1 = document.createElement("div");
  div1.classList.add("transaction-content");

  data.forEach((transaction) => {
    const div = document.createElement("div");
    div.classList.add("dynamic-transaction");
    div.innerHTML = `
            <h2> Transaction Description </h2>
            <p> <b>Amount </b>: $${transaction.amount}</p>
            <p> <b>Category </b>:${transaction.category}</p>
            <p> <b> Description </b>:${transaction.description}</p>
            <p> <b> Date </b>: ${transaction.date}</p>
            <button class = "deleteBtn"onclick="deleteTransaction(${transaction.id})">Delete</button>
        `;
    div1.appendChild(div);
  });

  sectionContent.appendChild(div1);
}

//Deleting the recent Transaction from UI and localstorage
function deleteTransaction(id) {
  transactions = transactions.filter(function (transaction) {
    return transaction.id !== id;
  });
  swal.fire("Item Successfully Deleted")
  localStorage.setItem("transactions", JSON.stringify(transactions));
  filteredTransaction = [...transactions];
  effect();
  applyFilters();
  updateDashboard();
  renderTransaction();
}

//Updating The Dashboard: Total Income and expense
function updateDashboard() {
  const income = transactions.filter(function (transaction) {
    return transaction.category === "Income";
  });

  const expense = transactions.filter(
    (transaction) => transaction.category === "Expense"
  );

  const totalIncome = income.reduce(function (sum, transaction) {
    return sum + transaction.amount;
  }, 0);

  const totalExpense = expense.reduce(function (sum, transaction) {
    return sum + transaction.amount;
  }, 0);

  const balance = totalIncome - totalExpense;

  document.querySelector(
    ".card-container .card:nth-child(1) h1"
  ).textContent = `$${balance.toFixed(2)}`;
  document.querySelector(
    ".card-container .card:nth-child(2) h1"
  ).textContent = `$${totalIncome.toFixed(2)}`;
  document.querySelector(
    ".card-container .card:nth-child(2) p"
  ).textContent = `${income.length} Transactions`;
  document.querySelector(
    ".card-container .card:nth-child(3) h1"
  ).textContent = `$${totalExpense.toFixed(2)}`;
  document.querySelector(
    ".card-container .card:nth-child(3) p"
  ).textContent = `${expense.length} Transactions`;
}

//Applying filters to the data

function applyFilters() {
  let keyword = searchInput.value.toLowerCase();
  let category = filterSelect.value;
  let sort = sortSelect.value;

  // Get reference to fallback message element
  const fallbackMsg = document.getElementById("category-fallback-msg");

  //Check if selected category exists, if not, display everything
  if (category !== "all") {
    const categoryExists = transactions.some(function (transaction) {
      return transaction.category === category;
    });
    if (!categoryExists) {
      fallbackMsg.innerText = `No ${category} transactions found, showing all instead.`;
      fallbackMsg.style.display = "block";
      category = "all";
    } else {
      fallbackMsg.style.display = "none";
    }
  } else {
    fallbackMsg.style.display = "none";
  }

  //Filter through categories only
  filteredTransaction = transactions.filter(function (transaction) {
    return category === "all" || transaction.category === category;
  });

  //If keyword exists AND at least one match is found in the current category-filtered list
  if (keyword) {
    const hasMatchInCategory = filteredTransaction.some(function (t) {
      return t.description.toLowerCase().includes(keyword);
    });

    if (hasMatchInCategory) {
      // Apply keyword filtering only when there’s a match
      filteredTransaction = filteredTransaction.filter(function (transaction) {
        return transaction.description.toLowerCase().includes(keyword);
      });
    }
  }

  // Sorting
  if (sort === "amount-asc") {
    filteredTransaction.sort(function (a, b) {
      return b.amount - a.amount;
    });
  } else if (sort === "amount-desc") {
    filteredTransaction.sort(function (a, b) {
      return a.amount - b.amount;
    });
  } else if (sort === "date-asc") {
    filteredTransaction.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sort === "date-desc") {
    filteredTransaction.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  renderTransaction(filteredTransaction);
}

//Adding an event listener for sorting, searching, and filtering

sortSelect.addEventListener("change", applyFilters);
filterSelect.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

// Loading all the functionalites once the window is loaded.
window.addEventListener("DOMContentLoaded", () => {
  renderTransaction();
  updateDashboard();
});

// dashboard.addEventListener("click", function(){
//     document.querySelector(".nav-center").scrollIntoView({behavior: "smooth"})
// });

// transaction.addEventListener("click", function(){
//     document.querySelector(".recent-transaction").scrollIntoView({behavior:"smooth"})
// });

function effect(){
 return Swal.fire({
  position: "top-end",
  icon: "success",
  title: "Item has been succesfully deleted",
  showConfirmButton: false,
  timer: 1500
});
}