const questions = [
    {
        question: "Which password is the safest?",
        options: ["password123", "MyName2009", "T8@kL!9pQ"],
        correctIndex: 2
    },
    {
        question: "What should you do if you receive a suspicious email asking for your password?",
        options: ["Reply with your password", "Ignore or report it", "Click the link"],
        correctIndex: 1
    },
    {
        question: "Which of these is a strong password?",
        options: ["qwerty", "Admin123", "A9$kL2@p"],
        correctIndex: 2
    },
    {
        question: "What is phishing?",
        options: ["A type of online game", "Fake messages to steal information", "A computer virus"],
        correctIndex: 1
    },
    {
        question: "Why is using the same password everywhere unsafe?",
        options: ["It is faster", "If one site is hacked, all accounts are at risk", "It looks professional"],
        correctIndex: 1
    },
    {
        question: "Which website URL looks safest?",
        options: ["http://bank-login.net", "https://mybank.com", "http://secure-bank.info"],
        correctIndex: 1
    },
    {
        question: "What does HTTPS mean?",
        options: ["The site is encrypted and secure", "The site is fake", "The site is slow"],
        correctIndex: 0
    },
    {
        question: "What should you do on public Wi-Fi?",
        options: ["Log into bank accounts", "Use a VPN or avoid sensitive logins", "Share passwords"],
        correctIndex: 1
    },
    {
        question: "Which message is likely a scam?",
        options: [
            "Your friend says hello",
            "You won a prize! Click now!",
            "School assignment reminder"
        ],
        correctIndex: 1
    },
    {
        question: "Why is two-factor authentication useful?",
        options: [
            "It makes login slower",
            "It adds an extra layer of security",
            "It removes passwords"
        ],
        correctIndex: 1
    },
    {
        question: "What should you do before downloading a file?",
        options: [
            "Download immediately",
            "Check the source and reviews",
            "Disable antivirus"
        ],
        correctIndex: 1
    },
    {
        question: "Which is a safe social media practice?",
        options: [
            "Sharing your location publicly",
            "Keeping your account private",
            "Posting your password"
        ],
        correctIndex: 1
    },
    {
        question: "Which password is NOT safe?",
        options: ["B7@pQ!9L", "football123", "Z$8K!dP2"],
        correctIndex: 1
    },
    {
        question: "What should you do if someone online asks for personal photos?",
        options: ["Send them", "Ignore and report", "Save the chat"],
        correctIndex: 1
    },
    {
        question: "What is malware?",
        options: [
            "Helpful software",
            "Malicious software that harms devices",
            "A password manager"
        ],
        correctIndex: 1
    },
    {
        question: "Why should you update apps and systems?",
        options: [
            "To change colors",
            "To fix security vulnerabilities",
            "To delete files"
        ],
        correctIndex: 1
    },
    {
        question: "Which is a sign of a fake website?",
        options: [
            "Spelling mistakes and strange URLs",
            "Lock icon in browser",
            "Clear contact info"
        ],
        correctIndex: 0
    },
    {
        question: "What should you do if your account is hacked?",
        options: [
            "Ignore it",
            "Change password and report",
            "Create a new account only"
        ],
        correctIndex: 1
    },
    {
        question: "Which password rule is important?",
        options: [
            "Short and simple",
            "Long with mixed characters",
            "Same as username"
        ],
        correctIndex: 1
    },
    {
        question: "Why should you avoid clicking unknown links?",
        options: [
            "They may contain malware",
            "They are boring",
            "They waste time"
        ],
        correctIndex: 0
    },
    {
        question: "What is a safe response to online bullying?",
        options: [
            "Reply angrily",
            "Block and report",
            "Share it publicly"
        ],
        correctIndex: 1
    },
    {
        question: "Which is safe to share online?",
        options: [
            "Home address",
            "Favorite hobby",
            "School ID"
        ],
        correctIndex: 1
    },
    {
        question: "Why should passwords be private?",
        options: [
            "So others can help log in",
            "To protect accounts",
            "To remember them easily"
        ],
        correctIndex: 1
    },
    {
        question: "What does a padlock icon in the browser mean?",
        options: [
            "The site is secure",
            "The site is blocked",
            "The site is fake"
        ],
        correctIndex: 0
    },
    {
        question: "Which email is suspicious?",
        options: [
            "Teacher email",
            "Unexpected prize email",
            "Friend email"
        ],
        correctIndex: 1
    },
    {
        question: "What is the safest action if a site asks for too much information?",
        options: [
            "Provide everything",
            "Leave the site",
            "Take screenshots"
        ],
        correctIndex: 1
    },
    {
        question: "Why should you log out on shared devices?",
        options: [
            "To save battery",
            "To prevent others accessing your account",
            "To reset the device"
        ],
        correctIndex: 1
    },
    {
        question: "Which is a strong password feature?",
        options: [
            "Your birth year",
            "Random characters",
            "Your nickname"
        ],
        correctIndex: 1
    },
    {
        question: "What should you do if an app asks for unnecessary permissions?",
        options: [
            "Allow all",
            "Deny or uninstall",
            "Ignore it"
        ],
        correctIndex: 1
    },
    {
        question: "Which action improves online safety?",
        options: [
            "Using antivirus software",
            "Sharing passwords",
            "Ignoring updates"
        ],
        correctIndex: 0
    },
    {
        question: "What is identity theft?",
        options: [
            "Stealing photos",
            "Using someone’s personal info illegally",
            "Hacking games"
        ],
        correctIndex: 1
    },
    {
        question: "Which message should you trust?",
        options: [
            "Unknown sender asking for money",
            "Verified service message",
            "Random link message"
        ],
        correctIndex: 1
    },
    {
        question: "Why is it unsafe to meet online strangers alone?",
        options: [
            "They may be unsafe",
            "It wastes time",
            "It costs money"
        ],
        correctIndex: 0
    },
    {
        question: "What should you do before sharing a photo online?",
        options: [
            "Check privacy settings",
            "Post immediately",
            "Send to everyone"
        ],
        correctIndex: 0
    },
    {
        question: "Which is a safe download source?",
        options: [
            "Official app store",
            "Random website",
            "Unknown link"
        ],
        correctIndex: 0
    },
    {
        question: "Why should you back up your data?",
        options: [
            "To lose files",
            "To protect against data loss",
            "To slow the device"
        ],
        correctIndex: 1
    },
    {
        question: "Which is a red flag in messages?",
        options: [
            "Urgent pressure",
            "Clear sender info",
            "Correct spelling"
        ],
        correctIndex: 0
    },
    {
        question: "What is the safest way to store passwords?",
        options: [
            "Write them publicly",
            "Use a password manager",
            "Reuse one password"
        ],
        correctIndex: 1
    },
    {
        question: "What should you do if a site looks fake?",
        options: [
            "Enter details",
            "Close the site",
            "Refresh the page"
        ],
        correctIndex: 1
    },
    {
        question: "Why is personal info valuable to attackers?",
        options: [
            "It helps hacking",
            "It improves security",
            "It speeds login"
        ],
        correctIndex: 0
    },
    {
        question: "Which action is safest?",
        options: [
            "Sharing login codes",
            "Keeping codes private",
            "Saving codes online"
        ],
        correctIndex: 1
    },
    {
        question: "What should you do if your device behaves strangely?",
        options: [
            "Ignore it",
            "Scan for malware",
            "Share files"
        ],
        correctIndex: 1
    },
    {
        question: "Why avoid clicking pop-up ads?",
        options: [
            "They may contain malware",
            "They are colorful",
            "They are slow"
        ],
        correctIndex: 0
    },
    {
        question: "Which is a safe habit?",
        options: [
            "Locking your device",
            "Sharing PINs",
            "Disabling security"
        ],
        correctIndex: 0
    },
    {
        question: "What should you do if you make a mistake online?",
        options: [
            "Hide it",
            "Tell a trusted adult",
            "Ignore it"
        ],
        correctIndex: 1
    },
    {
        question: "Why should passwords be long?",
        options: [
            "Harder to guess",
            "Easier to type",
            "Look cooler"
        ],
        correctIndex: 0
    }
];

export default questions;