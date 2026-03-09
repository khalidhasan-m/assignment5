const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", () => {
  const usernameInput = document.querySelector('input[type="text"]');
  const passwordInput = document.querySelector('input[type="password"]');

  const username = usernameInput.value;
  const password = passwordInput.value;

  if (username === "admin" && password === "admin123") {
    alert("Login successful!");
    window.location.assign("./home.html");
  } else {
    alert("Invalid Username or Password. Enter correct credentials to login.");
  }
}); 