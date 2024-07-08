document.addEventListener('DOMContentLoaded', () => {
    const qaItems = document.querySelectorAll('.qa-item');

    qaItems.forEach(item => {
        const question = item.querySelector('.question');
        const answer = item.querySelector('.answer');
        const toggleButton = item.querySelector('.toggle-answer');

        question.addEventListener('click', () => {
            const isVisible = answer.style.display === 'block';
            answer.style.display = isVisible ? 'none' : 'block';
            toggleButton.innerHTML = isVisible ? '&#9660;' : '&#9650;';
        });

        toggleButton.addEventListener('click', () => {
            const isVisible = answer.style.display === 'block';
            answer.style.display = isVisible ? 'none' : 'block';
            toggleButton.innerHTML = isVisible ? '&#9660;' : '&#9650;';
        });
    });
});

// CHAT-BOT
document.getElementById('askButton').addEventListener('click', async function () {
    const question =  document.getElementById('questionInput').value;

    if (question.trim() === "") {
        alert("Please enter a question.");
        return;
    }

    const response = await fetch('/generate-story', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: question })
    });

    const data = await response.json();
    const answerContainer = document.getElementById('answerContainer');
    
    if (data.error) {
        answerContainer.textContent = 'Error: ' + data.error;
    } else {
        answerContainer.textContent = data.story;
    }
});
