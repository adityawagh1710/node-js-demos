const searchForm = document.getElementById("search-form");
const addForm = document.getElementById("add-form");
const searchResult = document.getElementById("search-result");
const addResult = document.getElementById("add-result");

const renderResult = (target, title, items, status = "success") => {
  const messageClass = status === "success" ? "result-success" : "result-error";
  target.innerHTML = `
    <p class="message ${messageClass}">${title}</p>
    <ul class="result-list">
      ${items.map(item => `<li><strong>${item.label}</strong>: ${item.value}</li>`).join("")}
    </ul>
  `;
};

const renderMessage = (target, message, status = "success") => {
  const messageClass = status === "success" ? "result-success" : "result-error";
  target.innerHTML = `<p class="message ${messageClass}">${message}</p>`;
};

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const txnId = document.getElementById("search-txn").value.trim();
  if (!txnId) {
    renderMessage(searchResult, "Please enter a transaction ID.", "error");
    return;
  }

  renderMessage(searchResult, "Searching for transaction...");

  try {
    const response = await fetch(`/api/v1/txn/${encodeURIComponent(txnId)}`);
    if (response.status === 404) {
      renderMessage(searchResult, "Transaction not found.", "error");
      return;
    }

    const body = await response.json();
    if (!response.ok) {
      renderMessage(searchResult, body.error || "Unable to search transaction.", "error");
      return;
    }

    renderResult(searchResult, "Transaction found", [
      { label: "Transaction ID", value: body.Txn || "—" },
      { label: "Reference", value: body.Reference || "—" },
      { label: "Mode", value: body.Mode || "—" },
      { label: "Stored in", value: body.FileName || "—" },
      { label: "Worker ID", value: body.WorkerID ?? "—" }
    ]);
  } catch (error) {
    renderMessage(searchResult, `Error while searching: ${error.message}`, "error");
  }
});

addForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const txn = document.getElementById("add-txn").value.trim();
  const reference = document.getElementById("add-ref").value.trim();
  const mode = document.getElementById("add-mode").value;

  if (!txn || !reference || !mode) {
    renderMessage(addResult, "Please fill all fields before adding a transaction.", "error");
    return;
  }

  renderMessage(addResult, "Adding transaction...");

  try {
    const response = await fetch("/api/v1/txn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ txn, reference, mode })
    });

    const body = await response.json();

    if (!response.ok) {
      renderMessage(addResult, body.error || "Unable to add transaction.", "error");
      return;
    }

    renderResult(addResult, "Transaction added successfully", [
      { label: "Transaction ID", value: body.Txn },
      { label: "Reference", value: body.Reference },
      { label: "Mode", value: body.Mode },
      { label: "File", value: body.FileName },
      { label: "Worker ID", value: body.WorkerID }
    ]);
    addForm.reset();
  } catch (error) {
    renderMessage(addResult, `Error while adding: ${error.message}`, "error");
  }
});
