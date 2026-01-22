const questions = [
    {
        question: "Marko receives an urgent email saying his social media account has suspicious activity and asks him to click a link to log in. What should he do?",
        options: [
            "Click the link and log in immediately",
            "Open the official website directly and check account security",
            "Reply to the email asking if it is real"
        ],
        correctIndex: 1
    },
    {
        question: "Ana makes a new friend in an online game who asks for her real name and school to become closer friends. What is the safest action?",
        options: [
            "Share the information to build trust",
            "Keep personal information private and continue playing safely",
            "Ask the friend for their information first"
        ],
        correctIndex: 1
    },
    {
        question: "Filip finds a free photo-editing app on a random website that promises extra features if installed quickly. What should he do?",
        options: [
            "Download and install it right away",
            "Download apps only from official app stores",
            "Disable antivirus so it installs faster"
        ],
        correctIndex: 1
    },
    {
        question: "Elena connects to public Wi-Fi at a café and wants to check her bank account. What is the safest choice?",
        options: [
            "Log in normally because the Wi-Fi is free",
            "Avoid sensitive logins or use a secure connection",
            "Save passwords on the browser"
        ],
        correctIndex: 1
    },
    {
        question: "Ivan sees a website claiming he won a prize and asking for his personal details. What should he do?",
        options: [
            "Enter the details to claim the prize",
            "Close the website and ignore the message",
            "Share the website with friends"
        ],
        correctIndex: 1
    },
    {
        question: "Mila struggles to remember many passwords for her accounts. What is the safest solution?",
        options: [
            "Use the same password everywhere",
            "Use a password manager with a strong master password",
            "Write passwords in an unprotected notes app"
        ],
        correctIndex: 1
    },
    {
        question: "Nikola receives an email with an attachment from an unknown sender labeled 'Important Information'. What should he do?",
        options: [
            "Open the attachment to check it",
            "Delete the email without opening anything",
            "Forward it to friends"
        ],
        correctIndex: 1
    },
    {
        question: "Sara wants more followers and thinks about sharing more personal details publicly. What is the safest option?",
        options: [
            "Share location and personal details publicly",
            "Keep the account private and limit shared information",
            "Accept all friend requests"
        ],
        correctIndex: 1
    },
    {
        question: "David receives a notification that someone tried to log into his account from another country. What should he do?",
        options: [
            "Ignore the alert",
            "Change the password and enable two-factor authentication",
            "Post about it on social media"
        ],
        correctIndex: 1
    },
    {
        question: "Lena sees a viral online challenge asking people to share personal secrets. What is the safest response?",
        options: [
            "Join the challenge to feel included",
            "Avoid the challenge and report it if needed",
            "Watch others participate"
        ],
        correctIndex: 1
    },
    {
        question: "Petar logs into his email on a shared school computer. What should he do when finished?",
        options: [
            "Leave the account logged in",
            "Log out and close the browser",
            "Save the password for later use"
        ],
        correctIndex: 1
    },
    {
        question: "Katerina sees a pop-up chat claiming to be technical support asking for her login details. What should she do?",
        options: [
            "Share the login details",
            "Close the chat and contact official support channels",
            "Continue chatting"
        ],
        correctIndex: 1
    },
    {
        question: "Alex wants to post photos from inside his home on social media. What is the safest action?",
        options: [
            "Post everything publicly",
            "Check privacy settings before posting",
            "Tag the exact location and address"
        ],
        correctIndex: 1
    },
    {
        question: "Teodora wants to install a browser extension that asks for full access to all websites. What should she do?",
        options: [
            "Install it without reading anything",
            "Check permissions and reviews before installing",
            "Disable browser security features"
        ],
        correctIndex: 1
    },
    {
        question: "Bojan receives a password reset email he did not request. What is the safest choice?",
        options: [
            "Click the link immediately",
            "Verify the request by logging in directly to the official site",
            "Ignore all emails forever"
        ],
        correctIndex: 1
    },
    {
        question: "A stranger sends Maria a friend request with no profile picture and few friends. What should she do?",
        options: [
            "Accept the request",
            "Ignore or block the request",
            "Send a message asking who they are"
        ],
        correctIndex: 1
    },
    {
        question: "Stefan wants to use the same password for school and gaming accounts. What is safest?",
        options: [
            "Use the same password",
            "Use different strong passwords",
            "Share passwords with friends"
        ],
        correctIndex: 1
    },
    {
        question: "A website asks Viktor for his birth year and home address to continue. What should he do?",
        options: [
            "Enter the information",
            "Leave the website",
            "Guess fake information"
        ],
        correctIndex: 1
    },
    {
        question: "An app asks for access to contacts and microphone without explanation. What is safest?",
        options: [
            "Allow everything",
            "Deny permissions or uninstall",
            "Ignore the warning"
        ],
        correctIndex: 1
    },
    {
        question: "A classmate asks for Ivana’s login details to help with homework. What should she do?",
        options: [
            "Share the login details",
            "Refuse and keep the account secure",
            "Change password later"
        ],
        correctIndex: 1
    },
    {
        question: "A website URL looks strange but has attractive offers. What should Andrej do?",
        options: [
            "Click and explore",
            "Check the URL carefully or avoid the site",
            "Enter fake data"
        ],
        correctIndex: 1
    },
    {
        question: "Tina notices her device is slower and showing many ads. What should she do?",
        options: [
            "Ignore it",
            "Scan the device for malware",
            "Install more apps"
        ],
        correctIndex: 1
    },
    {
        question: "An online quiz asks for Luka’s email and password to see results. What is safest?",
        options: [
            "Enter the information",
            "Close the quiz",
            "Use someone else’s account"
        ],
        correctIndex: 1
    },
    {
        question: "A friend sends a link saying “You must see this!” What should Jana do?",
        options: [
            "Click immediately",
            "Confirm with the friend first",
            "Forward it to others"
        ],
        correctIndex: 1
    },
    {
        question: "An unknown number messages Petar asking for a verification code. What should he do?",
        options: [
            "Send the code",
            "Ignore and block the number",
            "Ask why they need it"
        ],
        correctIndex: 1
    },
];


// const questions = [
//     {
//         question: "Which password is the safest?",
//         options: ["password123", "MyName2009", "T8@kL!9pQ"],
//         correctIndex: 2
//     },
//     {
//         question: "What should you do if you receive a suspicious email asking for your password?",
//         options: ["Reply with your password", "Ignore or report it", "Click the link"],
//         correctIndex: 1
//     },
//     {
//         question: "Which of these is a strong password?",
//         options: ["qwerty", "Admin123", "A9$kL2@p"],
//         correctIndex: 2
//     },
//     {
//         question: "What is phishing?",
//         options: ["A type of online game", "Fake messages to steal information", "A computer virus"],
//         correctIndex: 1
//     },
//     {
//         question: "Why is using the same password everywhere unsafe?",
//         options: ["It is faster", "If one site is hacked, all accounts are at risk", "It looks professional"],
//         correctIndex: 1
//     },
//     {
//         question: "Which website URL looks safest?",
//         options: ["http://bank-login.net", "https://mybank.com", "http://secure-bank.info"],
//         correctIndex: 1
//     },
//     {
//         question: "What does HTTPS mean?",
//         options: ["The site is encrypted and secure", "The site is fake", "The site is slow"],
//         correctIndex: 0
//     },
//     {
//         question: "What should you do on public Wi-Fi?",
//         options: ["Log into bank accounts", "Use a VPN or avoid sensitive logins", "Share passwords"],
//         correctIndex: 1
//     },
//     {
//         question: "Which message is likely a scam?",
//         options: [
//             "Your friend says hello",
//             "You won a prize! Click now!",
//             "School assignment reminder"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Why is two-factor authentication useful?",
//         options: [
//             "It makes login slower",
//             "It adds an extra layer of security",
//             "It removes passwords"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "What should you do before downloading a file?",
//         options: [
//             "Download immediately",
//             "Check the source and reviews",
//             "Disable antivirus"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Which is a safe social media practice?",
//         options: [
//             "Sharing your location publicly",
//             "Keeping your account private",
//             "Posting your password"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Which password is NOT safe?",
//         options: ["B7@pQ!9L", "football123", "Z$8K!dP2"],
//         correctIndex: 1
//     },
//     {
//         question: "What should you do if someone online asks for personal photos?",
//         options: ["Send them", "Ignore and report", "Save the chat"],
//         correctIndex: 1
//     },
//     {
//         question: "What is malware?",
//         options: [
//             "Helpful software",
//             "Malicious software that harms devices",
//             "A password manager"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Why should you update apps and systems?",
//         options: [
//             "To change colors",
//             "To fix security vulnerabilities",
//             "To delete files"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Which is a sign of a fake website?",
//         options: [
//             "Spelling mistakes and strange URLs",
//             "Lock icon in browser",
//             "Clear contact info"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "What should you do if your account is hacked?",
//         options: [
//             "Ignore it",
//             "Change password and report",
//             "Create a new account only"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Which password rule is important?",
//         options: [
//             "Short and simple",
//             "Long with mixed characters",
//             "Same as username"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Why should you avoid clicking unknown links?",
//         options: [
//             "They may contain malware",
//             "They are boring",
//             "They waste time"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "What is a safe response to online bullying?",
//         options: [
//             "Reply angrily",
//             "Block and report",
//             "Share it publicly"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Which is safe to share online?",
//         options: [
//             "Home address",
//             "Favorite hobby",
//             "School ID"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Why should passwords be private?",
//         options: [
//             "So others can help log in",
//             "To protect accounts",
//             "To remember them easily"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "What does a padlock icon in the browser mean?",
//         options: [
//             "The site is secure",
//             "The site is blocked",
//             "The site is fake"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "Which email is suspicious?",
//         options: [
//             "Teacher email",
//             "Unexpected prize email",
//             "Friend email"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "What is the safest action if a site asks for too much information?",
//         options: [
//             "Provide everything",
//             "Leave the site",
//             "Take screenshots"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Why should you log out on shared devices?",
//         options: [
//             "To save battery",
//             "To prevent others accessing your account",
//             "To reset the device"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Which is a strong password feature?",
//         options: [
//             "Your birth year",
//             "Random characters",
//             "Your nickname"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "What should you do if an app asks for unnecessary permissions?",
//         options: [
//             "Allow all",
//             "Deny or uninstall",
//             "Ignore it"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Which action improves online safety?",
//         options: [
//             "Using antivirus software",
//             "Sharing passwords",
//             "Ignoring updates"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "What is identity theft?",
//         options: [
//             "Stealing photos",
//             "Using someone’s personal info illegally",
//             "Hacking games"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Which message should you trust?",
//         options: [
//             "Unknown sender asking for money",
//             "Verified service message",
//             "Random link message"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Why is it unsafe to meet online strangers alone?",
//         options: [
//             "They may be unsafe",
//             "It wastes time",
//             "It costs money"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "What should you do before sharing a photo online?",
//         options: [
//             "Check privacy settings",
//             "Post immediately",
//             "Send to everyone"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "Which is a safe download source?",
//         options: [
//             "Official app store",
//             "Random website",
//             "Unknown link"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "Why should you back up your data?",
//         options: [
//             "To lose files",
//             "To protect against data loss",
//             "To slow the device"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Which is a red flag in messages?",
//         options: [
//             "Urgent pressure",
//             "Clear sender info",
//             "Correct spelling"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "What is the safest way to store passwords?",
//         options: [
//             "Write them publicly",
//             "Use a password manager",
//             "Reuse one password"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "What should you do if a site looks fake?",
//         options: [
//             "Enter details",
//             "Close the site",
//             "Refresh the page"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Why is personal info valuable to attackers?",
//         options: [
//             "It helps hacking",
//             "It improves security",
//             "It speeds login"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "Which action is safest?",
//         options: [
//             "Sharing login codes",
//             "Keeping codes private",
//             "Saving codes online"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "What should you do if your device behaves strangely?",
//         options: [
//             "Ignore it",
//             "Scan for malware",
//             "Share files"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Why avoid clicking pop-up ads?",
//         options: [
//             "They may contain malware",
//             "They are colorful",
//             "They are slow"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "Which is a safe habit?",
//         options: [
//             "Locking your device",
//             "Sharing PINs",
//             "Disabling security"
//         ],
//         correctIndex: 0
//     },
//     {
//         question: "What should you do if you make a mistake online?",
//         options: [
//             "Hide it",
//             "Tell a trusted adult",
//             "Ignore it"
//         ],
//         correctIndex: 1
//     },
//     {
//         question: "Why should passwords be long?",
//         options: [
//             "Harder to guess",
//             "Easier to type",
//             "Look cooler"
//         ],
//         correctIndex: 0
//     }
// ];
//
 export default questions;