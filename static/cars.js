document.addEventListener("DOMContentLoaded", function () {
    loadCars();
});

// Fetch and display cars
function loadCars() {
    fetch("/api/cars")
        .then(response => response.json())
        .then(cars => {
            const carList = document.getElementById("carList");
            carList.innerHTML = "";
            
            cars.forEach(car => {
                const carElement = document.createElement("div");
                carElement.classList.add("col-md-4");
                carElement.innerHTML = `
                    <div class="card" onclick="viewCarDetails(${car.id})">
                        <img src="${car.image}" class="card-img-top" alt="${car.name}">
                        <div class="card-body">
                            <h5 class="card-title">${car.name}</h5>
                            <p class="card-text">${car.type} | $${car.price}/day</p>
                            <button class="btn btn-warning" onclick="editCar(event, ${car.id})">Edit</button>
                            <button class="btn btn-danger" onclick="deleteCar(event, ${car.id})">Delete</button>
                        </div>
                    </div>
                `;
                carList.appendChild(carElement);
            });
        })
        .catch(error => console.error("Error loading cars:", error));
}

// Show car details in a modal
function viewCarDetails(carId) {
    fetch(`/api/cars/${carId}`)
        .then(response => response.json())
        .then(car => {
            document.getElementById("carDetailsTitle").textContent = car.name;
            document.getElementById("carDetailsImage").src = car.image;
            document.getElementById("carDetailsType").textContent = car.type;
            document.getElementById("carDetailsPrice").textContent = car.price;
            
            const modal = new bootstrap.Modal(document.getElementById("carDetailsModal"));
            modal.show();
        });
}

// Show car form for adding/editing
function showCarForm() {
    document.getElementById("carForm").style.display = "block";
}
function hideCarForm() {
    document.getElementById("carForm").style.display = "none";
}

// Add or update a car
function saveCar(event) {
    event.preventDefault();
    
    const id = document.getElementById("carId").value;
    const name = document.getElementById("carName").value;
    const type = document.getElementById("carType").value;
    const price = document.getElementById("carPrice").value;
    const image = document.getElementById("carImage").value;
    
    const carData = { name, type, price, image };
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/cars/${id}` : "/api/cars";
    
    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData)
    })
    .then(() => {
        hideCarForm();
        loadCars();
    });
}

// Edit a car
function editCar(event, id) {
    event.stopPropagation();
    fetch(`/api/cars/${id}`)
        .then(response => response.json())
        .then(car => {
            document.getElementById("carId").value = car.id;
            document.getElementById("carName").value = car.name;
            document.getElementById("carType").value = car.type;
            document.getElementById("carPrice").value = car.price;
            document.getElementById("carImage").value = car.image;
            showCarForm();
        });
}

// Delete a car
function deleteCar(event, id) {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this car?")) {
        fetch(`/api/cars/${id}`, { method: "DELETE" })
            .then(() => loadCars());
    }
}

// Redirect to booking page
function redirectToBooking() {
    window.location.href = "booking.html";
}
