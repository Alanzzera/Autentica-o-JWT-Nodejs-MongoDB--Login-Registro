window.onload = function () {
    // Faz uma solicitação AJAX para obter a lista de usuários
    fetch('/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            // Limpa a lista de usuários existente
            const userList = document.getElementById('userList');
            userList.innerHTML = '';

            // Adiciona cada usuário à lista
            data.forEach(user => {
                const li = document.createElement('li');
                const spanName = document.createElement('span');
                spanName.textContent = 'Nome: ' + user.name;
                li.appendChild(spanName);
                li.appendChild(document.createElement('br'));

                const spanEmail = document.createElement('span');
                spanEmail.textContent = 'Email: ' + user.email;
                li.appendChild(spanEmail);

                userList.appendChild(li);
            });
        })
        .catch(error => console.error('Erro ao obter a lista de usuários:', error));
}