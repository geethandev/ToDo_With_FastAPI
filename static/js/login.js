document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("login-button");
    const errorMessage = document.getElementById("error-message");

    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch("/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
            });

            if (response.status === 200) {
                const data = await response.json();
                const token = data.token;

                // Store the token in localStorage
                localStorage.setItem("token", token);

                // Redirect to the dashboard
                window.location.href = "/dashboard/";
            } else if (response.status === 401) {
                errorMessage.textContent = "Login failed. Please check your email and password.";
            } else {
                errorMessage.textContent = "Login failed. Please try again later.";
            }
        } catch (error) {
            console.error("Error:", error);
            errorMessage.textContent = "An error occurred. Please try again later.";
        }
    });
});
