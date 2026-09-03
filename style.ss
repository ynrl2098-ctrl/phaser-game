body {
    background-color: #fdf2f4;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    overflow: hidden;
}
.container {
    text-align: center;
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    max-width: 400px;
    width: 90%;
}
h1 { color: #d63384; font-size: 22px; margin-top: 0; }
p { color: #555; margin-bottom: 30px; font-size: 16px; line-height: 1.5; }
.button-group {
    display: flex;
    justify-content: center;
    gap: 15px;
    position: relative;
    min-height: 50px;
}
button {
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
}
#yes-btn {
    background-color: #d63384;
    color: white;
    z-index: 10;
}
#yes-btn:hover {
    background-color: #b0266e;
    transform: scale(1.05);
}
#no-btn {
    background-color: #e9ecef;
    color: #495057;
    position: absolute;
    transition: 0.15s ease-out;
}
