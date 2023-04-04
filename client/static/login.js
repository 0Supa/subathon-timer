import ky from 'https://cdn.jsdelivr.net/npm/ky@0.33.3/+esm'
const loginButton = document.getElementById("login")
const passwordEl = document.getElementById("password")

const savedPassword = localStorage.getItem('password')
if (savedPassword) window.location.replace("admin");

loginButton.addEventListener("click", async () => {
    const password = passwordEl.value
    if (!password) return

    const oldValue = loginButton.innerHTML
    loginButton.disabled = true
    loginButton.innerHTML = 'Loading...'

    const { status } = await ky.post("api", {
        throwHttpErrors: false,
        json: { query: "ping" },
        headers: { authorization: password }
    })

    if (status === 200) {
        loginButton.innerHTML = "Login successful!"
        localStorage.setItem('password', password);
        setTimeout(() => {
            window.location.replace("admin");
        }, 1000);

    } else {
        setTimeout(() => {
            loginButton.disabled = false
        }, 1000);
        loginButton.innerHTML = oldValue
        alert("Wrong password!")
    }
});
