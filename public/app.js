const API_BASE = "/computerstore";

// DOM Elements
const customersBody = document.getElementById("customers-body");
const totalEarned = document.getElementById("total-earned");
const totalEarnedTop = document.getElementById("total-earned-top");
const refreshBtn = document.getElementById("refresh-btn");
const statusEl = document.getElementById("form-status");

// Form Elements
const customerForm = document.getElementById("customer-form");
const custMongoId = document.getElementById("cust-mongo-id");
const custName = document.getElementById("cust-name");
const custEmail = document.getElementById("cust-email");
const custType = document.getElementById("cust-type");
const custDiscount = document.getElementById("cust-discount");
const custSale = document.getElementById("cust-sale");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");

const formatMoney = (value) => {
  const number = Number(value) || 0;
  return number.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
};

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
  if (message) {
    setTimeout(() => {
      statusEl.textContent = "";
      statusEl.classList.remove("error");
    }, 3000);
  }
};

const renderCustomers = (customers) => {
  customersBody.innerHTML = "";

  customers.forEach((customer) => {
    const nameToDisplay = customer.fullName || customer.name || "";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${customer.id ?? ""}</td>
      <td>${nameToDisplay}</td>
      <td>${customer.email ?? ""}</td>
      <td>${customer.type ?? ""}</td>
      <td>${customer.discount ?? ""}</td>
      <td>${formatMoney(customer.totalSale || customer.moneySpent)}</td>
      <td>
        <button class="edit-btn" style="background-color: #0d9488; font-size: 12px; padding: 4px 8px; margin-right: 4px;">Edit</button>
        <button class="delete-btn" style="background-color: #dc2626; font-size: 12px; padding: 4px 8px;">Delete</button>
      </td>
    `;

    // Attach event listeners to row buttons
    row.querySelector(".edit-btn").addEventListener("click", () => startEdit(customer));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteCustomer(customer._id, nameToDisplay));

    customersBody.appendChild(row);
  });
};

const fetchCustomers = async () => {
  try {
    const response = await fetch(`${API_BASE}/customers`);
    if (!response.ok) {
      throw new Error("Unable to load customers");
    }
    const customers = await response.json();
    renderCustomers(customers);
    fetchTotal();
  } catch (error) {
    setStatus(error.message, true);
  }
};

const fetchTotal = async () => {
  try {
    const response = await fetch(`${API_BASE}/customers/total`);
    if (!response.ok) {
      throw new Error("Unable to load total");
    }
    const data = await response.json();
    const formatted = formatMoney(data.total);
    totalEarned.textContent = formatted;
    if (totalEarnedTop) {
      totalEarnedTop.textContent = formatted;
    }
  } catch (error) {
    setStatus(error.message, true);
  }
};

// CRUD Operations UI logic
const startEdit = (customer) => {
  custMongoId.value = customer._id;
  custName.value = customer.fullName || customer.name || "";
  custEmail.value = customer.email || "";
  custType.value = customer.type || "Normal";
  custDiscount.value = customer.discount ?? 0;
  custSale.value = customer.totalSale || customer.moneySpent || 0;

  formTitle.textContent = "Edit Customer";
  submitBtn.textContent = "Update Customer";
  cancelBtn.style.display = "inline-block";
  custName.focus();
};

const clearForm = () => {
  customerForm.reset();
  custMongoId.value = "";
  formTitle.textContent = "Add New Customer";
  submitBtn.textContent = "Save Customer";
  cancelBtn.style.display = "none";
};

customerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = custMongoId.value;
  const payload = {
    fullName: custName.value.trim(),
    email: custEmail.value.trim(),
    type: custType.value,
    discount: Number(custDiscount.value) || 0,
    totalSale: Number(custSale.value) || 0
  };

  const isEdit = !!id;
  const url = isEdit ? `${API_BASE}/customers/${id}` : `${API_BASE}/customers`;
  const method = isEdit ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Operation failed");
    }

    setStatus(isEdit ? "Customer updated successfully!" : "Customer added successfully!");
    clearForm();
    fetchCustomers();
  } catch (error) {
    setStatus(error.message, true);
  }
});

const deleteCustomer = async (id, name) => {
  if (!confirm(`Are you sure you want to delete customer: ${name}?`)) {
    return;
  }
  try {
    const response = await fetch(`${API_BASE}/customers/${id}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete customer");
    }
    setStatus("Customer deleted successfully!");
    fetchCustomers();
  } catch (error) {
    setStatus(error.message, true);
  }
};

cancelBtn.addEventListener("click", clearForm);
refreshBtn.addEventListener("click", fetchCustomers);
fetchCustomers();
