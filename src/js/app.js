import ajax from './http.mjs';

const apiUrl = 'https://ancient-everglades-41590.herokuapp.com/api';
const postsContainer = document.querySelector('[data-set=posts]');
const loaderEl = document.querySelector('[data-set=loader]');
const inputEl = document.querySelector('[data-set=post-title-input]');
const sendBtnEl = document.querySelector('[data-action=submit]');
const formEl = document.querySelector('[data-set=form]');
const currentPost = {
    id: 0,
    title: '',
    editMode: false
};
let posts = [];


const language = 'ru';
const translations = {
    ru: {
        'error.not_found': 'Объект не найден',
        'error.bad_request': 'Произошла ошибка',
        'error.unknown': 'Произошла ошибка',
        'error.network': 'Проверьте свое соединение',
    },
    en: {
        'error.not_found': 'Object not found',
        'error.bad_request': 'Error occured',
        'error.unknown': 'Error occured',
        'error.network': 'Check internet connection',
    }
};

function translateError(code) {
    return translations[language][code] || translations[language]['error.bad_request.unknown'];
}

function loaderOn() {
    postsContainer.classList = 'posts loading';
    loaderEl.classList = 'loader loading';
}
function loaderOff() {
    postsContainer.classList = 'posts';
    loaderEl.classList = 'loader';
}

function renderPosts(posts) {
    sendBtnEl.innerHTML = 'Добавить';
    inputEl.value = '';
    currentPost.id = 0;
    currentPost.title = '';
    currentPost.editMode = false;

    postsContainer.innerHTML = posts.reverse().reduce((acc, current) => acc + `
        <li data-post-id="${current.id}">
            <span data-target="text">${current.title}</span>
            <a data-action="edit-post" href="#">Редактировать</a>
            <a data-action="delete-post" href="#">Удалить</a>
        </li>
    `, '');
    postsContainer.querySelectorAll('[data-action=edit-post]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            editPost(e.target.parentNode.dataset.postId, e.target.parentNode.querySelector('[data-target=text]').innerText);
        })
    });
    postsContainer.querySelectorAll('[data-action=delete-post]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            deletePost(e.target.parentNode.dataset.postId);
        })
    });
}

function editPost (postId, postTitle) {
    currentPost.id = Number(postId);
    currentPost.title = postTitle;
    currentPost.editMode = true;
    inputEl.value = postTitle;
    sendBtnEl.innerHTML = 'Сохранить';
}

function loadData() {
    loaderOn();
    ajax(`${apiUrl}/posts`, {}, {
        onsuccess: response => {
            loaderOff();
            posts = JSON.parse(response);
            renderPosts(posts);
        },
    });
}
function saveData() {
    loaderOn();
    ajax(`${apiUrl}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: currentPost.id, title: currentPost.title})
    }, {
        onsuccess: () => {
            loaderOff();
            loadData();
        },
    });
}
function deletePost(postId) {
    loaderOn();
    ajax(`${apiUrl}/posts/${postId}`, {
        method: 'DELETE',
    }, {
        onsuccess: () => {
            loaderOff();
            loadData();
        },
    })
}

function init() {
    inputEl.addEventListener('keyup', e => {
        currentPost.title = e.target.value;
    });
    formEl.addEventListener('submit', e => {
        e.preventDefault();
        saveData();
    });
    loadData();
}

init();




