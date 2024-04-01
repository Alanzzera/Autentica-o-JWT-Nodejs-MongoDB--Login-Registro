document.getElementById("btn-cadastrar").addEventListener("click", function () {
    window.location.href = "/auth/register";
});

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    // Obtenha os valores do formulário
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Faça uma requisição AJAX para a sua API
    fetch('/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
        .then(response => {
            if (!response.ok) {
                // Se a resposta não for OK, trata o erro
                return response.json().then(data => {
                    throw new Error(data.msg);
                });
            }
            return response.json();
        })
        .then(data => {
            document.cookie = `token=${data.token}; path=/`;
            // Redireciona para a página do usuário
            window.location.href = `/user/${data.id}`;
        })
        .catch(error => {
            document.getElementById("error-message").textContent = error.message;
        });
});