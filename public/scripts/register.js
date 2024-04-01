document.getElementById("btn-home").addEventListener("click", function () {
    window.location.href = "/";
});

document.getElementById("register-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    // Obtenha os valores do formulário
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmpassword = document.getElementById("confirmpassword").value;

    // Faça uma requisição AJAX para a API
    fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            confirmpassword: confirmpassword
        })
    })
        .then(response => {
            return response.json(); // Retorna o corpo da resposta em JSON
        })
        .then(data => {
            if (data.id) {
                // Redireciona para a página de login
                window.location.href = '/auth/login';
            } else if (data.msg) {
                // Exibe a mensagem de erro na página
                document.getElementById("error-message").textContent = data.msg;
            } else {
                // Se nenhum ID nem mensagem for retornado, exibe erro genérico
                throw new Error('Erro ao conectar-se com o servidor');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            document.getElementById("error-message").textContent = error.message; // Exibe mensagem de erro específica
        });
});