
// Function to populate categories dropdown
function populateCategories () {
    const categoryDropdown = document.getElementById("category");
    db.collection("Categories")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const option = document.createElement("option");
                option.value = doc.data().name;
                option.text = doc.data().name;
                categoryDropdown.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Error fetching categories: ", error);
        });
}

// Function to populate items dropdown based on the selected category
function populateItems () {
    const categoryDropdown = document.getElementById("category");
    const selectedCategory = categoryDropdown.value;
    const itemDropdown = document.getElementById("item");

    // Clear the existing items in the dropdown
    while (itemDropdown.firstChild) {
        itemDropdown.removeChild(itemDropdown.firstChild);
    }

    // Fetch items based on the selected category
    db.collection("Items")
        .where("category", "==", selectedCategory)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const option = document.createElement("option");
                option.value = doc.data().name;
                option.text = doc.data().name;
                itemDropdown.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Error fetching items: ", error);
        });
}

function details () {
    const itemDropdown = document.getElementById("item");
    const selectedItem = itemDropdown.value;
    db.collection("Items")
        .where("name", "==", selectedItem)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                document.getElementById("qtyavailable").textContent =
                    doc.data().qty;
                document.getElementById("perprice").textContent = doc.data().price;
            });
        })
        .catch((error) => {
            console.error("Error fetching item details: ", error);
        });
}
// Call the populateCategories function when the page loads
window.addEventListener("load", function () {
    populateCategories();
});

//addInvoice
function addInvoice () {
    const selectedCategory = document.querySelector("select[name='category']").value;
    const selectedItem = document.querySelector("select[name='item']").value;
    const enteredQty = parseInt(document.getElementById("quantity").value);

    if (selectedCategory === "Category" || selectedItem === "Items" || isNaN(enteredQty) || enteredQty <= 0) {
        document.getElementById("Result").innerHTML = "Please select a category, item, and enter a valid quantity.";
        return false;
    }
    db.collection("Items")
        .where("name", "==", selectedItem)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                // Assuming there is only one matching item, you can access the first document
                const itemData = querySnapshot.docs[0].data();
                const price = parseFloat(itemData.price);
                const amount = price * enteredQty;

                const tableBody = document.querySelector("#invoiceTable tbody");

                // Create a new row
                const newRow = tableBody.insertRow();

                // Create cells for the new row
                const snoCell = newRow.insertCell(0);
                const itemCell = newRow.insertCell(1);
                const qtyCell = newRow.insertCell(2);
                const priceCell = newRow.insertCell(3);
                const amtCell = newRow.insertCell(4);

                // Calculate the next serial number (Sno.)
                const nextSno = tableBody.rows.length;

                // Set the cell values
                snoCell.textContent = nextSno;
                itemCell.textContent = selectedItem;
                qtyCell.textContent = enteredQty;
                priceCell.textContent = "Rs" + price.toFixed(2);
                amtCell.textContent = "Rs" + amount.toFixed(2);

                // Calculate the total amount
                const totalAmountSpan = document.getElementById("total");
                let currentTotalAmount = parseFloat(totalAmountSpan.textContent.replace("Rs.", ""));

                if (isNaN(currentTotalAmount)) {
                    currentTotalAmount = 0;
                }

                const newTotalAmount = currentTotalAmount + amount;
                totalAmountSpan.textContent = "Rs." + newTotalAmount.toFixed(2);

                // Calculate SGST and CGST
                const sgstRate = 0.09;
                const cgstRate = 0.09;
                const sgstAmount = newTotalAmount * sgstRate;
                const cgstAmount = newTotalAmount * cgstRate;

                const sgstAmountSpan = document.getElementById("sgst");
                sgstAmountSpan.textContent = "Rs." + sgstAmount.toFixed(2);

                const cgstAmountSpan = document.getElementById("cgst");
                cgstAmountSpan.textContent = "Rs." + cgstAmount.toFixed(2);

                //Calculate Payable
                const payable = newTotalAmount + sgstAmount + cgstAmount;
                document.getElementById("payable").innerHTML = payable.toFixed(2);

                return false;
            } else {
                document.getElementById("Result").innerHTML = "Selected item not found in the database. Please check the item name.";
                return false;
            }
        })
        .catch((error) => {
            console.error("Error fetching item details: ", error);
            return false; // Prevent the form submission
        });
    return false;
}




//Purchasing
function purchased () {
    // Get the selected item and purchased quantity
    const selectedItem = document.querySelector("select[name='item']").value;
    const purchasedQty = parseInt(document.getElementById("quantity").value);

    // Check if a valid item and quantity are selected
    if (selectedItem === "Items" || isNaN(purchasedQty) || purchasedQty <= 0) {
        alert("Please select a valid item and quantity to purchase.");
        return false;
    }

    // Reference to the Firestore collection
    const itemsCollection = db.collection("Items");

    // Query the Firestore to get the current quantity of the selected item
    itemsCollection
        .where("name", "==", selectedItem)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const itemDoc = querySnapshot.docs[0];
                const currentItem = itemDoc.data();

                // Calculate the new available quantity after the purchase
                const availableQty = currentItem.qty - purchasedQty;

                // Update the Firestore document with the new available quantity
                itemsCollection.doc(itemDoc.id).update({
                    qty: availableQty
                });

                alert(`Successfully purchased ${purchasedQty} of ${selectedItem}.`);
            } else {
                alert("Selected item not found in the database. Please check the item name.");
            }
        })
        .catch((error) => {
            console.error("Error purchasing item: ", error);
        });

    const printContents = document.getElementById("invoiceTable").outerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;

    return false; // Prevent the form submission

}
