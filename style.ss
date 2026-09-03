body {
    background-color: #f7f1e5; /* Warm vintage parchment tone */
    font-family: 'Georgia', serif; /* Classic vintage serif font */
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    overflow: hidden;
}

/* Vintage Rangoli Background Styling */
.vintage-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    z-index: 0;
    opacity: 0.12; /* Subtle watermark effect so text remains readable */
}

.rangoli-pattern {
    width: 600px;
    height: 600px;
    border-radius: 50%;
    /* Creates a classic multi-layered geometric vintage rangoli/mandala illusion */
    background: repeating-conic-gradient(
        from 0deg at 50% 50%,
        #8b0000 0deg,
        #b8860b 20deg,
        #8b0000 40deg
    );
    -webkit-mask-image: radial-gradient(circle, white 20%, transparent 70%);
    mask-image: radial-gradient(circle, white 20%, transparent 70%);
    animation: slowSpin 60s linear infinite;
}

@keyframes slowSpin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* Card & Content Styling */
.container {
    text-align: center;
    background: rgba(255, 253, 250, 0.95);
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(139, 0, 0, 0.08);
    border: 1px solid #e6d7c3;
    max-width: 400px;
    width: 90%;
    z-index: 10;
    position: relative;
}

h1 { 
    color: #8b0000; /* Deep vintage crimson */
    font-size: 22px; 
    margin-top: 0; 
    letter-spacing: 0.5px;
}

p { 
    color: #5a4a42; 
    margin-bottom: 30px; 
    font-size: 16px; 
    line-height: 1.6; 
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 15px;
    position: relative;
    min-height: 50px;
}

button {
    padding: 12px 24px;
    font-size: 15px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Georgia', serif;
    transition: transform 0.2s, background-color 0.2s;
}

#yes-btn {
    background-color: #8b0000;
    color: #fffdfa;
    z-index: 10;
}

#yes-btn:hover {
    background-color: #660000;
    transform: scale(1.05);
}

#no-btn {
    background-color: #f2ebd9;
    color: #5a4a42;
    border: 1px solid #d9cbaf;
    position: absolute;
    transition: 0.15s ease-out;
}
