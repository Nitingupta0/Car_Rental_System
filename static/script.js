document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm");
    const carSelect = document.getElementById("carSelect");
    const rentalDays = document.getElementById("rentalDays");
    const paymentMethod = document.getElementById("paymentMethod");
    const bookingMessage = document.getElementById("bookingMessage");

    // Real-time price calculator
    function calculatePrice() {
        let selectedCar = carSelect.options[carSelect.selectedIndex];
        let pricePerDay = parseFloat(selectedCar.getAttribute("data-price"));
        let days = parseInt(rentalDays.value, 10);

        if (!isNaN(pricePerDay) && days > 0) {
            let totalPrice = pricePerDay * days;
            bookingMessage.innerHTML = `💰 Estimated Price: <strong>$${totalPrice}</strong>`;
        } else {
            bookingMessage.innerHTML = "";
        }
    }

    carSelect.addEventListener("change", calculatePrice);
    rentalDays.addEventListener("input", calculatePrice);

    // Handle form submission
    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        let name = document.getElementById("name").value.trim();
        let email = document.getElementById("email").value.trim();
        let selectedCar = carSelect.options[carSelect.selectedIndex];
        let car = selectedCar.value;
        let pricePerDay = parseFloat(selectedCar.getAttribute("data-price"));
        let days = parseInt(rentalDays.value, 10);
        let payment = paymentMethod.value;

        let totalPrice = pricePerDay * days;

        if (name && email && car && days > 0 && payment) {
            // Store booking details in localStorage
            localStorage.setItem("bookingName", name);
            localStorage.setItem("bookingCar", car);
            localStorage.setItem("bookingDays", days);
            localStorage.setItem("bookingPrice", totalPrice);
            localStorage.setItem("bookingPayment", payment);

            // Redirect to confirmation page
            window.location.href = "confirmation.html";
        } else {
            alert("Please fill in all required fields correctly.");
        }
    });

    // Payment method toggle
    paymentMethod.addEventListener("change", function () {
        let selectedPayment = this.value;
        let paymentSection = document.getElementById("paymentDetails");
        let creditCardSection = document.getElementById("creditCardDetails");
        let paypalSection = document.getElementById("paypalDetails");

        paymentSection.style.display = "block";

        if (selectedPayment === "credit-card") {
            creditCardSection.style.display = "block";
            paypalSection.style.display = "none";
        } else if (selectedPayment === "paypal") {
            creditCardSection.style.display = "none";
            paypalSection.style.display = "block";
        } else {
            paymentSection.style.display = "none";
        }
    });

    // Car filtering system
    document.getElementById("carFilter").addEventListener("change", function () {
        let selectedType = this.value;
        let cars = document.querySelectorAll(".car-item");

        cars.forEach(car => {
            if (selectedType === "all" || car.getAttribute("data-type") === selectedType) {
                car.style.display = "block";
            } else {
                car.style.display = "none";
            }
        });
    });

    // Car search functionality
    document.getElementById("carSearch").addEventListener("input", function () {
        let searchValue = this.value.toLowerCase();
        let cars = document.querySelectorAll(".car-item");

        cars.forEach(car => {
            let carName = car.querySelector(".card-title").textContent.toLowerCase();
            car.style.display = carName.includes(searchValue) ? "block" : "none";
        });
    });
});

// Load Rental History Data
fetch("/api/rental-history")
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById("rentalTableBody");
        tableBody.innerHTML = "";

        data.forEach(entry => {
            const row = `<tr>
                <td>${entry.date}</td>
                <td>${entry.car}</td>
                <td>${entry.return_date}</td>
                <td>$${entry.price}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    })
    .catch(error => console.error("Error fetching rental history:", error));


// Function to Load Rental History
function loadRentalHistory() {
    fetch('rental_history.json')
        .then(response => response.json())
        .then(history => {
            let historyTable = '<table class="table"><thead><tr><th>ID</th><th>User ID</th><th>Car</th><th>Rental Date</th><th>Return Date</th><th>Price</th></tr></thead><tbody>';
            history.forEach(record => {
                historyTable += `<tr><td>${record.id}</td><td>${record.user_id}</td><td>${record.car_name}</td><td>${record.rental_date}</td><td>${record.return_date}</td><td>$${record.price}</td></tr>`;
            });
            historyTable += '</tbody></table>';
            document.getElementById('rentalHistorySection').innerHTML = historyTable;
        })
        .catch(error => console.error('Error loading rental history:', error));
}

// Call Functions on Page Load
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    loadRentalHistory();
});

// for rental history
document.addEventListener("DOMContentLoaded", function () {
    fetch('rental-history.json') // Replace with your API endpoint
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('rentalTableBody');
            tableBody.innerHTML = ''; // Clear existing data

            data.forEach((rental, index) => {
                const row = `<tr>
                    <td>${rental.date}</td>
                    <td>${rental.car}</td>
                    <td><a href="rental-details.html?id=${index + 1}" class="btn btn-primary btn-sm">View</a></td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching rental history:', error));
});

document.getElementById("bookingForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let car = document.getElementById("carSelect").value;
    let days = parseInt(document.getElementById("rentalDays").value, 10);
    let returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + days);
    let formattedReturnDate = returnDate.toISOString().split('T')[0];

    fetch("/api/add-rental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            car: car,
            user_id: localStorage.getItem("user_id"),
            return_date: formattedReturnDate
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Booking successful") {
            alert("Car booked successfully!");
            window.location.href = "confirmation.html";
        } else {
            alert(data.error);
        }
    })
    .catch(error => console.error("Error:", error));
});
