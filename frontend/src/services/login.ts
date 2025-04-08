export async function handleLoginFormSubmission(form: HTMLFormElement): Promise<void> {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = (document.getElementById("login-email") as HTMLInputElement).value;
        const password = (document.getElementById("login-password") as HTMLInputElement).value;
        console.log("Submitted email:", email);
        console.log("Submitted password:", password);

        try {
            const response = await fetch("http://localhost:8000/api/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Login failed: ${response.status} - ${errorText}`);
                throw new Error("Login failed");
            }

            const data = await response.json();
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            console.log("Login successful:", data);
        } catch (error) {
            console.error("Error during login:", error);
        }
    });
}
