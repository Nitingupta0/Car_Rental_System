// document.addEventListener("DOMContentLoaded", function () {
//     const registerForm = document.getElementById("registerForm");
    
//     registerForm.addEventListener("submit", function (event) {
//         event.preventDefault();
        
//         const name = document.getElementById("name").value.trim();
//         const email = document.getElementById("email").value.trim();
//         const password = document.getElementById("password").value.trim();
        
//         fetch("/api/register", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ name, email, password })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.message === "User registered successfully") {
//                 alert("Registration successful! You can now log in.");
//                 window.location.href = "login.html";
//             } else {
//                 document.getElementById("registerErrorMessage").textContent = data.error;
//             }
//         })
//         .catch(error => console.error("Error registering:", error));
//     });
// });

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (name && email && password) {
                fetch("/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message === "User registered successfully") {
                        alert("Registration successful! You can now log in.");
                        window.location.href = "login.html";
                    } else {
                        document.getElementById("registerErrorMessage").textContent = data.error || "Registration failed.";
                    }
                })
                .catch(error => {
                    console.error("Error registering:", error);
                    document.getElementById("registerErrorMessage").textContent = "An error occurred. Please try again.";
                });
            } else {
                document.getElementById("registerErrorMessage").textContent = "Please fill in all fields.";
            }
        });
    }
});

