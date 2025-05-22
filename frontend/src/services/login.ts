import { navigateTo } from "./router";
import Fetch from "@/classes/JsonFetch";
import { PATH } from "@services/constants"

export async function handleLoginFormSubmission(form: HTMLFormElement): Promise<void> {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = (document.getElementById("login-email") as HTMLInputElement).value;
        const password = (document.getElementById("login-password") as HTMLInputElement).value;
        console.log("Submitted email:", email);
        console.log("Submitted password:", password);

        try {
            const response = await fetch(`${PATH}/api/token/`, {
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
            sessionStorage.setItem("access", data.access);
            sessionStorage.setItem("refresh", data.refresh);
            sessionStorage.setItem("is_authenticated", "true");

            const fetcher = new Fetch(`${PATH}/api/user/me/`);
            const res_json = await fetcher.fetch_with_auth()
            sessionStorage.setItem('user_id', res_json.id);

            navigateTo('/');
            console.log("Login successful:", data);
        } catch (error) {
            console.error("Error during login:", error);
        }
    });
}
