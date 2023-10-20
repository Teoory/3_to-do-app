const darkMode = document.querySelector('.dark-mode');
darkMode.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode-variables');
  darkMode.querySelector('span:nth-child(2)').classList.toggle('active');
  darkMode.querySelector('span:nth-child(1)').classList.toggle('active');
})

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('container');
    const savedDatas = JSON.parse(localStorage.getItem('savedDatas'));

    // title, color ve images bilgileri
    const columns = [
        { title: 'Notes', color: '#FFC864', images: 'url(/src/images/1-notes.jpg)'},
        { title: 'To Do', color: '#FF6347', images: 'url(/src/images/2-todo.jpg)' },
        { title: 'Progress', color: '#20B2AA', images: 'url(/src/images/3-progress.jpg)' },
        { title: 'Bugs', color: '#FF4500', images: 'url(/src/images/4-bugs.jpg)' },
        { title: 'Rework', color: '#87CEFA', images: 'url(/src/images/5-rework.jpg)' },
        { title: 'End!', color: '#32CD32', images: 'url(/src/images/6-end.jpg)' },
        { title: 'Minor Update', color: '#8A2BE2', images: 'url(/src/images/7-minorUpdate.jpg)' },
        { title: 'Major Update', color: '#FF69B4', images: 'url(/src/images/8-majorUpdate.jpg)' }
    ];

    // Her başlık için yeni sütün oluşturma
    columns.forEach(column => {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('column');
        columnDiv.style.borderColor = column.color;
        columnDiv.style.color = column.color;
        columnDiv.style.backgroundImage = column.images;
        columnDiv.innerHTML = `
            <div class="column-header" >${column.title}
                <button class="add-card-button" data-column="${columns.indexOf(column)}">+</button>
            </div>
        `;
        container.appendChild(columnDiv);
    });

    if (savedDatas) {
        container.innerHTML = savedDatas.html;

        const cards = document.querySelectorAll('.card');
        cards.forEach(function(card) {
            card.addEventListener('dragstart', dragStart);
            card.addEventListener('dragend', dragEnd);
        });
    }
    
    function saveData() {
        const html = container.innerHTML;
        const data = { html: html };
        localStorage.setItem('savedDatas', JSON.stringify(data));
    }

    // Kartları sürükle bırak yapmak için
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.draggable = true;
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });

    const columnsAll = document.querySelectorAll('.column');
    columnsAll.forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('dragenter', dragEnter);
        column.addEventListener('dragleave', dragLeave);
        column.addEventListener('drop', dragDrop);
    });

    let draggedCard = null;
    let draggedColumn = null;

    

    function dragStart() {
        draggedCard = this;
        draggedColumn = this.parentElement;
        setTimeout(() => this.style.display = 'none', 0);
    }

    function dragEnd() {
        this.style.display = 'block';
        draggedCard = null;
        saveData();
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragEnter(e) {
        e.preventDefault();
        this.style.borderStyle = 'dashed';
    }

    function dragLeave() {
        this.style.borderStyle = 'solid';
    }

    function dragDrop() {
        this.style.borderStyle = 'solid';
        this.appendChild(draggedCard);
        draggedCard.style.borderColor = window.getComputedStyle(this).borderColor;
    }
    
    // Yeni kart ekleme fonksiyonu
    const addCardButtons = document.querySelectorAll('.add-card-button');
    addCardButtons.forEach(button => {
        button.addEventListener('click', addCard);
    });

    function addCard() {
        const columnIndex = this.getAttribute('data-column');
        const column = document.querySelectorAll('.column')[columnIndex];
        const card = document.createElement('div');
        card.classList.add('card');
        card.draggable = true;
        card.contentEditable = true;
        card.oncontextmenu = 'return showContextMenu(event)';
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);

        // oluşturulan kartın border rengini, bulunduğu sütunun rengine ayarla
        const columnColor = window.getComputedStyle(column).borderColor;
        card.style.borderColor = columnColor;

        column.appendChild(card);
        saveData();
    }

    // Kartları silme fonskiyonu

    let contextMenu = null;
    let selectedCard = null;

    container.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        hideContextMenu(); // Önceki delete fonksiyonunu gizle
        const target = e.target;
        if (target.classList.contains('card')) {
            contextMenu = document.createElement('div');
            contextMenu.classList.add('context-menu');
            contextMenu.innerHTML = '<div class="context-menu-item">Delete Card</div>';
            contextMenu.style.position = 'absolute';
            contextMenu.style.left = e.clientX + 'px';
            contextMenu.style.top = e.clientY + 'px';
            document.body.appendChild(contextMenu);

            const deleteCardItem = contextMenu.querySelector('.context-menu-item');
            deleteCardItem.addEventListener('click', function() {
                deleteCard(target);
                hideContextMenu();
                saveData();
            });

            selectedCard = target;
        }
        document.addEventListener('click', hideContextMenu);
    });

    function showContextMenu(e) {
        if (contextMenu) {
            contextMenu.remove();
            contextMenu = null;
        }
        return false;
    }

    function hideContextMenu() {
        if (contextMenu) {
            contextMenu.remove();
            contextMenu = null;
        }
        document.removeEventListener('click', hideContextMenu);
    }

    function deleteCard() {
        if (selectedCard) {
            selectedCard.remove();
            hideContextMenu();
        }
    }

    
    // Kartların içindeki yazı işlevleri
    container.addEventListener('keydown', function(e) {
        const target = e.target;
        if (target.classList.contains('card')) {
            if (e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault();
                target.blur();
                saveData();
            }

            if ((e.key === 'Enter' && e.shiftKey) || e.key === 'Tab') {
                e.preventDefault();

                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const br = document.createElement('br');
                range.insertNode(br);
                range.setStartAfter(br);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                saveData();
            }
            saveData();
        }
    });
});

//mouse ile sayfayı hareket ettirme
document.addEventListener('DOMContentLoaded', function() {
    let isDragging = false;
    let startPoint = { x: 0, y: 0 };

    document.addEventListener('mousedown', function(e) {
        isDragging = true;
        startPoint = { x: e.clientX, y: e.clientY };
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const endPoint = { x: e.clientX, y: e.clientY };
            const deltaX = endPoint.x - startPoint.x;
            const deltaY = endPoint.y - startPoint.y;
            window.scrollBy(-deltaX, -deltaY);
            startPoint = endPoint;
        }
    });
});

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});