//all of my imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js"
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js"
import { getFirestore, query, collection, onSnapshot, orderBy,doc, addDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js'

//conected to my firebase app
const firebaseConfig = initializeApp({
    apiKey: "AIzaSyDCG7hsbuUv-8yaIxhYbSPBZEoKTeg9LIA",
    authDomain: "wishcord-c2beb.firebaseapp.com",
    projectId: "wishcord-c2beb",
    storageBucket: "wishcord-c2beb.appspot.com",
    messagingSenderId: "58866765669",
    appId: "1:58866765669:web:1b8e8aa35d8d6605c25b8c"
});
const auth = getAuth(firebaseConfig)

//my varibles
const mainModule = document.getElementById("main")
const logginModule = document.getElementById("login-module")
const registerModule = document.getElementById("register-module")
const displayProfileName = document.getElementById("display-profile-name")

let userData;

//checks if there is a user
onAuthStateChanged(auth, (user) => {
    if (user) {
        userData = user
        initDb()
        console.log("logged in: ", user)
        displayProfileName.innerHTML = userData.email.split("@")[0]
    }
    else {
        mainModule.style.display = "none"
        logginModule.style.display = "flex"
        registerModule.style.display = "none"

    }
})

const goRegister = document.getElementById("go-register")

goRegister.addEventListener("click", (e) => {
    e.preventDefault()
    logginModule.style.display = "none"
    registerModule.style.display = "flex"
})

//login function
const login = async event => {
    event.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    try {
        await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
        console.log(error)
    }
    window.location.reload();
}

document.getElementById("login").addEventListener("submit", login);

const signup = document.getElementById("register-content")

//register funtion
signup.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = signup["reg-email"].value;
    const password = signup["reg-password"].value;
    const passwordComfirm = signup["reg-password-confirm"].value;


    if (password == passwordComfirm) {
        createUserWithEmailAndPassword(auth, email, password).then(cred => {
            console.log(cred)
        })
    }
    else {
        alert("You need to type the same password on both")
    }
    window.location.reload();
})

//Everything to do with settings

const settingBtn = document.getElementById("settingicon")
const settingCloseBtn = document.getElementById("close")
const settingsModule = document.getElementById("settings-module")


settingBtn.addEventListener("click", () => {
    settingsModule.style.display = "block"
})

settingCloseBtn.addEventListener("click", () => {
    settingsModule.style.display = ""
})

const logoutBtn = document.getElementById("logout-btn")

logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
        settingsModule.style.display = ""
      }).catch((error) => {
        settingsModule.style.display = ""
      });
})

//groups and messages

let witchGroup;

const initDb = () => {
    const db = getFirestore()

    const group = query(collection(db, "group"), orderBy("timestamp"))
    
    //Creates new group on click of btn

    onSnapshot(group, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            const group = change.doc.data()
            const div = document.createElement("div")

            div.style.backgroundColor = "rgb(55, 55, 55)"
            div.style.width = "100px"
            div.style.height = "100px"
            div.style.borderRadius = "50%"
            div.style.marginTop = "6px"
            div.style.textTransform = "uppercase"
            div.style.fontSize = "1.5rem"
            div.style.display = "flex"
            div.style.justifyContent = "center"
            div.style.alignItems = "center"
            
            div.innerHTML = group.ServerName.charAt(0)

            document.getElementById("public-groups").appendChild(div)       

            //Adds new messages on btn click

            div.addEventListener("click", () => {
                const ul = document.querySelector('ul')
                ul.innerHTML = ""
                witchGroup = change.doc.id
                const messages = query(collection(db, "group", witchGroup, "messages" ), orderBy("timestamp"))

                onSnapshot(messages, (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        const msg = change.doc.data()
                        const li = document.createElement('li')
                        li.innerHTML = msg.message
                        ul.appendChild(li)
                    })
                })
            })
        });
    })

    //Adds group's to database 

    const newGroup = async e => {
        e.preventDefault() 

        try {
            await addDoc(collection(db, "group"), {
                ServerName: userData.email.split("@")[0] + " server",
                timestamp: Timestamp.fromDate(new Date())
            })
    
        } catch (error) {
            console.log(error)
        }
    }
    
    document.getElementById("creategroup").addEventListener("submit", newGroup)

    //Adds messages to database

    const newMessage = async e => {
        e.preventDefault() 

        try {
            await addDoc(collection(db, "group", witchGroup, "messages"),  {
                userid: userData.uid,
                userName: userData.email.split("@")[0],
                timestamp: Timestamp.fromDate(new Date()),
                message: document.getElementById("new-message").value
            })

            document.getElementById("new-message").value = ""
        } catch (error) {
            console.log(error)
        }
    }
    document.getElementById("send-new-message").addEventListener("click", newMessage)
}