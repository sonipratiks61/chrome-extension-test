import CryptoJS from "crypto-js";

let secret;
const landing_page = document.getElementById("landingPage");
const login_page = document.getElementById("loginPage");
const loggedInPage = document.getElementById("loggedInPage");

window.addEventListener("load", async () => {
  const signedIn = await chrome.storage.sync.get(["signedIn"])
  const initialized = await chrome.storage.sync.get(["initialized"])
  if (signedIn.signedIn === true) {
    const signedInUser = await chrome.storage.sync.get(["signedInUser"])
    login_page.setAttribute("hidden", "hidden");
    renderDetails(signedInUser.signedInUser)
  } else if (initialized.initialized === true) {
    landing_page.setAttribute("hidden", "hidden");
    login_page.removeAttribute("hidden");
  } else {
    secret = generateString(10)
    const secretKey = document.getElementById("secretKey")
    secretKey.innerHTML = `Your secret key - ${secret}`
  }
})

document.getElementById("reinitialize").addEventListener('click', () => reinitialize())
document.getElementById("check_button").addEventListener('click', () => checkCredentials())
document.getElementById("log_out").addEventListener('click', () => logout())
document.getElementById("login_button").addEventListener('click', () => loginUser())

let details = document.getElementById('name');
let username = document.getElementById('username');
let password = document.getElementById('password');
let confirmation = document.getElementById('passwordConfirmation');
function checkCredentials() {
  if (password.value == confirmation.value) {
    let encodedSecret = CryptoJS.HmacSHA256(secret, "encode").toString(CryptoJS.enc.Hex);
    chrome.storage.sync.set({
      key: [{
        details: details.value,
        username: username.value,
        password: password.value,
        secret: encodedSecret
      }]
    }).then(() => {
      landing_page.setAttribute("hidden", "hidden");
      login_page.removeAttribute("hidden");
    });

    chrome.storage.sync.set({ initialized: true }).then(() => {
      console.log("Extension Initialized")
    });
  }
  else {
    alert("Password didn't match")
  }
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const usernameLogin = document.getElementById('usernameLogin');
const passwordLogin = document.getElementById('passwordLogin');

async function loginUser() {
  const users = await chrome.storage.sync.get(["key"]);
  if (usernameLogin !== undefined && passwordLogin !== undefined) {
    const user = users.key.find((userObj) => {
      return userObj.username === usernameLogin.value && userObj.password === passwordLogin.value
    })

    if (user.secret) {
      renderDetails(user)
    }
  }
}

function renderDetails(user) {
  landing_page.setAttribute("hidden", "hidden");
  login_page.setAttribute("hidden", "hidden");
  loggedInPage.removeAttribute("hidden");
  const userTitle = document.getElementById("userTitle")
  const usernameDetail = document.getElementById("usernameDetail")
  const secret = document.getElementById("secret")
  userTitle.innerHTML = `Hello ${user.details}`
  usernameDetail.innerHTML = `Username: ${user.username}`
  secret.innerHTML = `Secret: ${user.secret}`

  chrome.storage.sync.set({
    signedIn: true
  }).then(() => {
    console.log('Information stored');
  });

  chrome.storage.sync.set({
    signedInUser: user
  }).then(() => {
    console.log('user stored');
  });

  details.value = '';
  username.value = '';
  password.value = '';
  confirmation.value = '';
}

function reinitialize() {
  chrome.storage.sync.set({ initialized: false }).then(() => {
    console.log("Initialized extension")
  });

  chrome.storage.sync.set({
    signedIn: false
  }).then(() => {
    console.log('Information stored');
  });

  chrome.storage.sync.set({
    signedInUser: null
  }).then(() => {
    console.log('user stored');
  });

  landing_page.removeAttribute("hidden")
  loggedInPage.setAttribute("hidden", "hidden");
}

async function logout() {

  landing_page.setAttribute("hidden", "hidden");
  login_page.removeAttribute("hidden");
  loggedInPage.setAttribute("hidden", "hidden");

  chrome.storage.sync.set({
    signedIn: false
  }).then(() => {
    console.log('Information stored');
  });

  chrome.storage.sync.set({
    signedInUser: null
  }).then(() => {
    console.log('user stored');
  });
  
  usernameLogin.value = '';
  passwordLogin.value = '';
}