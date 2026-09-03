const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');
const quoteTitle = document.getElementById('quote-title');
const quoteText = document.getElementById('quote-text');
const container = document.getElementById('main-container');

// Array of steps and quotes to cycle through before final acceptance
const steps = [
    {
        title: "System Check: Important Question Pending",
        text: "I've been analyzing all variables, and everything points to one logical outcome."
    },
    {
        title: "Error 404: 'No' Not Found",
        text: "Are you completely sure? My algorithms suggest a 100% chance of an amazing time."
    },
    {
        title: "Recalibrating...",
        text: "Come on, think about all the good food and laughs we'll miss out on!"
    },
    {
        title: "Final Warning",
        text: "The 'No' button is rapidly losing its structural integrity. Resistance is futile."
    }
];

let currentStep = 0;

// Function to move the "No" button away smoothly when hovered or clicked
function moveNoButton() {
    // Switch to the next quote/step if available
    if (currentStep < steps.length - 1) {
        currentStep++;
        quoteTitle.innerText = steps[currentStep].title;
        quoteText.innerText = steps[currentStep].text;
    }

    // Calculate safe random coordinates within the window
    const padding = 50;
    const maxX = window.innerWidth - noBtn.offsetWidth - padding;
    const maxY = window.innerHeight - noBtn.offsetHeight - padding;
    
    const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
    const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

    noBtn.style.position = 'fixed';
    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;
}

noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton();
});

// Celebration screen when "Yes" is clicked
yesBtn.addEventListener('click', () => {
    container.innerHTML = `
        <h1 style="color: #d63384; font-size: 28px;">Yay! Best Decision Ever 🎉</h1>
        <p>Target locked. I'll pick the spot, you just bring your amazing smile!</p>
    `;
    noBtn.style.display = 'none';
});
