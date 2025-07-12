// document.addEventListener("DOMContentLoaded", function () {
//     const loginForm = document.getElementById("loginForm");
//     const logoutButton = document.getElementById("logoutButton");
    
//     if (loginForm) {
//         loginForm.addEventListener("submit", function (event) {
//             event.preventDefault();
            
//             const email = document.getElementById("email").value.trim();
//             const password = document.getElementById("password").value.trim();
            
//             fetch("/api/login", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ email, password })
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.message === "Login successful") {
//                     localStorage.setItem("user_id", data.user.id);
//                     window.location.href = "index.html";
//                 } else {
//                     document.getElementById("errorMessage").textContent = data.error;
//                 }
//             })            
//             .catch(error => console.error("Error logging in:", error));
//         });
//     }

//     // Logout functionality
//     if (logoutButton) {
//         logoutButton.addEventListener("click", function () {
//             fetch("/api/logout", { method: "POST" })
//             .then(response => response.json())
//             .then(() => {
//                 localStorage.removeItem("user_id");
//                 localStorage.removeItem("user_name");
//                 window.location.href = "login.html"; // Redirect to login page
//             })
//             .catch(error => console.error("Error logging out:", error));
//         });
//     }
// });


document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            alert(result.message);

            if (response.ok) {
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    });
});
