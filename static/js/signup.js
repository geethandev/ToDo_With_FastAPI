const signupForm = document.getElementById("signup-form");
const messageElement = document.getElementById("message");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/signup/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.status === 201) {
            messageElement.textContent = "Signup successful! Redirecting to login...";
            
            // this redirect to the login page after a short delay
            setTimeout(() => {
                window.location.replace("/login/");
            }, 2000);
        } else if (response.status === 400) {
            messageElement.textContent = "Email already exists. Please use another email.";
        } else {
            messageElement.textContent = "Signup failed. Please try again.";
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

