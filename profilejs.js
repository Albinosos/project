function showEditForm() {
    document.getElementById('editOverlay').style.display = 'flex';
}



function displaySelectedPhoto() {
    const input = document.getElementById('editPhoto');
    const preview = document.getElementById('selectedPhotoPreview');

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };

        reader.readAsDataURL(input.files[0]);
    }
}



function saveChanges() {
    // Отримати дані з полів вікна редагування
    var newPhoto = document.getElementById('editPhoto').value;
    var newUsername = document.getElementById('editUsername').value;
    var newAge = document.getElementById('editAge').value;
    var newDescription = document.getElementById('Description').value;




    // Отримати вибрані стилі мистецтва
    var selectedStyles = [];
    var checkboxes = document.querySelectorAll('#editArtStyle input[type=checkbox]');
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            selectedStyles.push(checkbox.parentNode.textContent.trim());
        }
    });

    // Вивести вибрані стилі в консоль для перевірки
    console.log('Вибрані стилі мистецтва:', selectedStyles);

   // Відправка POST-запиту на сервер для збереження змін
   $.post("http://localhost:8080/saveProfileChanges", {
       newPhoto: newPhoto,
       newUsername: newUsername,
       newAge: newAge,
       newArtStyle: selectedStyles,
       newDescription: newDescription
   }, function (data) {
       // Обробка відповіді від сервера, наприклад, оновлення інтерфейсу
       console.log(data.message);
   });

   // Закрити вікно редагування
   document.getElementById('editOverlay').style.display = 'none';
}




// Отримати дані профілю при завантаженні сторінки
$(document).ready(function () {
    $.get("http://localhost:8080/profile", function (data) {
        // Вивести дані на сторінці
        displayUserProfile(data.userProfile);
    });
});

// Функція для відображення інформації профілю на сторінці
function displayUserProfile(userProfile) {
    // Оновити елементи сторінки з отриманими даними
    $("#profilePicture").attr("src", userProfile.avatar_url || "");  
    $("#username").text(userProfile.full_name || "Ім'я користувача");
    $("#age").text(userProfile.age ? `Вік: ${userProfile.age}` : "");
    $("#artStyle").text(userProfile.art_style_description || "Стиль мистецтва");
    $("#selfDescription").text(userProfile.about_me || "опис про себе");
}


function cancelChanges() {
    // Закрити вікно редагування без збереження змін
    document.getElementById('editOverlay').style.display = 'none';
}







document.addEventListener('DOMContentLoaded', function () {
    var checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            var checkedCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
            if (checkedCheckboxes.length > 3) {
                checkbox.checked = false;
            }
        });
    });

    document.addEventListener('DOMContentLoaded', function () {
// При завантаженні сторінки показати вміст вкладки "Мої роботи"
showContent('myWorksContent');

// Додати обробники подій для кожної вкладки
var myWorksTab = document.querySelector('.profile-tab.my-works');
var myMessagesTab = document.querySelector('.profile-tab.my-messages');
var settingsTab = document.querySelector('.profile-tab.settings');

myWorksTab.addEventListener('click', function () {
    showContent('myWorksContent');
});

myMessagesTab.addEventListener('click', function () {
    showContent('myMessagesContent');
});

settingsTab.addEventListener('click', function () {
    showContent('settingsContent');
});
});

});

function updateStyleColor(checkbox) {
    var label = checkbox.parentNode;
    if (checkbox.checked) {
        if (countSelectedStyles() < 4) {
            label.style.backgroundColor = '#703f1c';
            label.style.color = '#fff';
        } else {
            checkbox.checked = false;
        }
    } else {
        label.style.backgroundColor = '';
        label.style.color = '#703f1c';
    }
}

function countSelectedStyles() {
    var checkedCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    return checkedCheckboxes.length;
}


function updateActiveTab(tabId) {
// Знімаємо клас active з усіх вкладок
var allTabs = document.querySelectorAll('.profile-tab');
allTabs.forEach(function (tab) {
    tab.classList.remove('active');
});

// Встановлюємо клас active для вибраної вкладки
var selectedTab = document.querySelector('.' + tabId);
if (selectedTab) {
    selectedTab.classList.add('active');
}
}

function showContent(contentId, tabId) {
// Сховати всі вкладки
var allContents = document.querySelectorAll('.profile-content');
allContents.forEach(function (content) {
    content.style.display = 'none';
});

// Показати поточну вкладку
var currentContent = document.getElementById(contentId);
if (currentContent) {
    currentContent.style.display = 'block';
    updateActiveTab(tabId); // Оновити активну вкладку
}
}

// Додати виклики цієї функції для кожної вкладки
document.addEventListener('DOMContentLoaded', function () {
// При завантаженні сторінки показати вміст вкладки "Мої роботи"
showContent('myWorksContent', 'my-works');
});

// Додати обробники подій для кожної вкладки
var myWorksTab = document.querySelector('.profile-tab.my-works');
var myMessagesTab = document.querySelector('.profile-tab.my-messages');
var settingsTab = document.querySelector('.profile-tab.settings');

myWorksTab.addEventListener('click', function () {
showContent('myWorksContent', 'my-works');
});

myMessagesTab.addEventListener('click', function () {
showContent('myMessagesContent', 'my-messages');
});

settingsTab.addEventListener('click', function () {
showContent('settingsContent', 'settings');
});



function logout() {
//  логіка виходу

window.location.href = "index.html";
}





// При завантаженні сторінки викликати функцію для отримання робіт з сервера
$(document).ready(function () {
    getMyWorks();
});

// Функція для отримання робіт з сервера та їх відображення
function getMyWorks() {
    $.get("http://localhost:8080/myWorks", function (data) {
        // Вивести дані на сторінці
        displayMyWorks(data.myWorks);
    });
}

function displayMyWorks(myWorks) {
    var myWorksList = document.getElementById('myWorksList');
    myWorksList.innerHTML = ""; // Очистити попередні дані

    // Пройтися по кожній роботі та додати її до списку
    myWorks.forEach(function (work) {
        var workItem = document.createElement('div');
        workItem.classList.add('artwork-item');

        // Додати менше фото
        var photo = document.createElement('img');
        photo.src = work.photo; // Потрібно коректно вибрати шлях до фото
        photo.alt = work.title;
        photo.classList.add('artwork-photo');
        workItem.appendChild(photo);

        // Додати назву і тип продажу
        var titleAndType = document.createElement('div');
        titleAndType.classList.add('title-and-type');

        var title = document.createElement('h3');
        title.textContent = work.title;
        titleAndType.appendChild(title);

        var saleType = document.createElement('p');
        saleType.textContent = getSaleTypeLabel(work);
        titleAndType.appendChild(saleType);

        workItem.appendChild(titleAndType);

        // Додати обробник подій для відкриття модального вікна при кліку на роботу
        workItem.addEventListener('click', function () {
            openArtworkModal(work);
        });

        // Вивести додаткові дані для аукціону
if (work.is_auction_item && work.auctionData) {
    var auctionDetails = document.createElement('div');
    auctionDetails.classList.add('auction-details');

    var bidPrice = document.createElement('p');
    bidPrice.textContent = 'Поточна ціна: ' + (parseFloat(work.auctionData.current_price) || 'Не визначено');
    auctionDetails.appendChild(bidPrice);

    workItem.appendChild(auctionDetails);
}else if (work.is_for_sale && work.saleData) {
            var saleDetails = document.createElement('div');
            saleDetails.classList.add('sale-details');

            var salePrice = document.createElement('p');
            salePrice.textContent = 'Ціна продажу: ' + (work.saleData.price || 'Не визначено');
            saleDetails.appendChild(salePrice);

            workItem.appendChild(saleDetails);
        }

        // Додати роботу до списку
        myWorksList.appendChild(workItem);
    });
}

function openArtworkModal(work) {
    // Отримати елементи модального вікна
    var modal = document.getElementById('artworkModal');
    var modalOverlay = document.getElementById('modalOverlay'); 
    var modalImage = document.getElementById('modalImage');
    var modalTitle = document.getElementById('modalTitle');
    var modalGenre = document.getElementById('modalGenre');
    var modalCategory = document.getElementById('modalCategory');
    var modalSaleType = document.getElementById('modalSaleType');
    var artworkDescription = document.getElementById('artworkDescription');
    var auctionDetails = document.getElementById('auctionDetails'); // Додайте новий елемент для виведення інформації про аукціон
    var saleDetails = document.getElementById('saleDetails'); // Додайте новий елемент для виведення інформації про продаж

    // Заповнити модальне вікно з деталями роботи
    modalImage.alt = work.title;
    modalImage.src = work.photo;
    modalTitle.textContent = work.title;
    modalGenre.textContent = 'Жанр: ' + work.genre;
    modalCategory.textContent = 'Категорія: ' + work.category;
    modalSaleType.textContent = getSaleTypeLabel(work);
    artworkDescription.textContent = work.description;

    // Оновити інформацію про аукціон
if (work.is_auction_item && work.auctionData) {
    var endTime = new Date(work.auctionData.end_time);
    var daysRemaining = Math.ceil((endTime - new Date()) / (1000 * 60 * 60 * 24));

    auctionDetails.innerHTML = `
        <p>Початкова ціна: ${work.auctionData.start_price}</p>
        <p>Максимальна ціна: ${parseFloat(work.auctionData.end_price) || 'Не визначено'}</p>
        <p>Поточна ціна: ${parseFloat(work.auctionData.current_price) || 'Не визначено'}</p>
        <p>Ціна ставки: ${parseFloat(work.auctionData.bid_increment) || 'Не визначено'}</p>
        <p>Дні до завершення аукціону: ${daysRemaining} днів</p>
    `;
    auctionDetails.style.display = 'block';
} else {
    auctionDetails.style.display = 'none';
}


    // Оновити інформацію про продаж
    if (work.is_for_sale && work.saleData) {
        saleDetails.innerHTML = `
            <p>Ціна продажу: ${parseFloat(work.saleData.price) || 'Не визначено'}</p>
        `;
        saleDetails.style.display = 'block';
    } else {
        saleDetails.style.display = 'none';
    }

    // Відобразити модальне вікно
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
}



// Функція для закриття модального вікна
function closeArtworkModal() {
    var modal = document.getElementById('artworkModal');
    var modalOverlay = document.getElementById('modalOverlay');
    if (modal) {
        modal.style.display = 'none';
        modalOverlay.style.display = 'none';

        // Очистити додаткові дані при закритті вікна
        var auctionDetails = document.getElementById('auctionDetails');
        if (auctionDetails) {
            auctionDetails.style.display = 'none';
        }

        var saleDetails = document.getElementById('saleDetails');
        if (saleDetails) {
            saleDetails.style.display = 'none';
        }
    }
}



// Функція для отримання підпису типу продажу
function getSaleTypeLabel(work) {
    if (work.is_for_sale) {
        return 'Продаж';
    } else if (work.is_auction_item) {
        return 'Аукціон';
    } else if (work.is_portfolio_item) {
        return 'Портфоліо';
    }
    return '';
}











// форма додання роботи 

function showAddWorkForm() {
document.getElementById('addWorkOverlay').style.display = 'flex';
}

function cancelAddWork() {
document.getElementById('addWorkOverlay').style.display = 'none';
}


// Додайте глобальну змінну для збереження поточного типу продажу
var currentSaleType;

function setCurrentSaleType(type) {
    currentSaleType = type;
    console.log("тип:", currentSaleType);
}

function toggleAuctionFields(type) {
    var auctionFields = document.getElementById('auctionFields');
    var saleFields = document.getElementById('saleFields');

    if (type === 'auction') {
        auctionFields.style.display = 'block';
        saleFields.style.display = 'none';
        console.log("Обрано аукціон");
    } else if (type === 'sale') {
        auctionFields.style.display = 'none';
        saleFields.style.display = 'block';
        console.log("Обрано продаж");
    } else {
        auctionFields.style.display = 'none';
        saleFields.style.display = 'none';
        console.log("Обрано портфоліо");
    }
}


function publishWork() {
    // Отримайте дані з полів форми та обробіть їх, наприклад, відправте на сервер
    var workTitle = document.getElementById('workTitle').value;
    var workDescription = document.getElementById('workDescription').value;
    var workPhoto = document.getElementById('workPhoto').value;
   // Отримати вибраний тип продажу
   var auctionType = currentSaleType;
    
    // Отримайте вибрані категорію та жанр
    var selectedCategory = document.getElementById('workCategory').value;
    var selectedGenre = document.getElementById('workGenre').value;

    console.log("Дані роботи:");
    console.log("Назва роботи:", workTitle);
    console.log("Опис роботи:", workDescription);
    console.log("Фото роботи:", workPhoto);
    console.log("Категорія роботи:", selectedCategory);
    console.log("Жанр роботи:", selectedGenre);
    console.log("Тип продажу:", auctionType);

    

    // Формуємо об'єкт з даними роботи для відправки на сервер
    var artworkData = {
        title: workTitle,
        description: workDescription,
        category: selectedCategory,
        genre: selectedGenre,
        photo: workPhoto,
        is_for_sale: auctionType === 'sale',  // Залиште true, оскільки це означає, що робота для продажу
        is_auction_item: auctionType === 'auction',  // true, якщо це аукціон, інакше false
        is_portfolio_item: auctionType === 'portfolio',  // true, якщо це портфоліо, інакше false
    };

    // Додаткові дані залежно від типу продажу
    if (auctionType === 'auction') {
        artworkData.start_price = document.getElementById('startPrice').value;
        artworkData.max_price = document.getElementById('maxPrice').value;
        artworkData.bid_price = document.getElementById('bidPrice').value;
        artworkData.auction_duration = document.getElementById('auctionDuration').value;
    } else if (auctionType === 'sale') {
        artworkData.sale_price = document.getElementById('salePrice').value;
        
    }
    

    // Використовуйте AJAX або Fetch API для відправки даних на сервер
    $.post("http://localhost:8080/addArtwork", artworkData, function(response) {
        // Обробка відповіді від сервера, якщо потрібно
        console.log(response);

        
        // Отримайте відділ, який відповідає за "Мої роботи"
        var myWorksTab = document.querySelector('.profile-tab.my-works');

        // Якщо відділ "Мої роботи" існує, активуйте його
        if (myWorksTab) {
            myWorksTab.click();
        }
        // Після успішного додавання роботи оновити список робіт
    getMyWorks();

      
        // Закрийте вікно форми
        document.getElementById('addWorkOverlay').style.display = 'none';
    });
}


function cancelAddWork() {
    // Закрити вікно редагування без збереження змін
    document.getElementById('addWorkOverlay').style.display = 'none';
}




