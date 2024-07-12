window.onload = function() {
    const canvas = document.getElementById('memeCanvas');
    const ctx = canvas.getContext('2d');
    const backgroundUpload = document.getElementById('backgroundUpload');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const increaseSizeBtn = document.getElementById('increaseSizeBtn');
    const decreaseSizeBtn = document.getElementById('decreaseSizeBtn');

    const catImg = new Image();
    catImg.src = 'pls-cat-transparent.png'; // Replace with your transparent cat image URL

    let backgroundImg = new Image();
    let isDraggingCat = false;
    let isResizingCat = false;
    let resizeHandleRadius = 10;
    let resizeHandleIndex = -1;
    let offsetX, offsetY;
    let startX, startY;
    let startCatX, startCatY, startCatWidth, startCatHeight;

    let catX = canvas.width / 2 - 172.5;
    let catY = canvas.height / 2 - 172.5;
    let catWidth = 345;
    let catHeight = 345;

    catImg.onload = () => {
        drawCanvas();
    };

    canvas.addEventListener('mousedown', (e) => {
        if (isOverCat(e.offsetX, e.offsetY)) {
            isDraggingCat = true;
            offsetX = e.offsetX - catX;
            offsetY = e.offsetY - catY;
        } else if (isOverResizeHandle(e.offsetX, e.offsetY) !== -1) {
            isResizingCat = true;
            resizeHandleIndex = isOverResizeHandle(e.offsetX, e.offsetY);
            startX = e.offsetX;
            startY = e.offsetY;
            startCatX = catX;
            startCatY = catY;
            startCatWidth = catWidth;
            startCatHeight = catHeight;
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDraggingCat) {
            catX = e.offsetX - offsetX;
            catY = e.offsetY - offsetY;
            drawCanvas();
        } else if (isResizingCat) {
            let mouseX = e.offsetX;
            let mouseY = e.offsetY;
            let deltaX = mouseX - startX;
            let deltaY = mouseY - startY;
            switch (resizeHandleIndex) {
                case 0:
                    catX = startCatX + deltaX;
                    catY = startCatY + deltaY;
                    catWidth = startCatWidth - deltaX;
                    catHeight = startCatHeight - deltaY;
                    break;
                case 1:
                    catY = startCatY + deltaY;
                    catWidth = startCatWidth + deltaX;
                    catHeight = startCatHeight - deltaY;
                    break;
                case 2:
                    catX = startCatX + deltaX;
                    catWidth = startCatWidth - deltaX;
                    catHeight = startCatHeight + deltaY;
                    break;
                case 3:
                    catWidth = startCatWidth + deltaX;
                    catHeight = startCatHeight + deltaY;
                    break;
                default:
                    break;
            }
            drawCanvas();
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDraggingCat = false;
        isResizingCat = false;
        resizeHandleIndex = -1;
    });

    backgroundUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                backgroundImg.src = event.target.result;
                backgroundImg.onload = () => {
                    drawCanvas();
                };
            };
            reader.readAsDataURL(file);
        }
    });

    resetBtn.addEventListener('click', () => {
        backgroundImg.src = '';
        drawCanvas();
    });

    increaseSizeBtn.addEventListener('click', () => {
        catWidth *= 1.15;
        catHeight *= 1.15;
        drawCanvas();
    });

    decreaseSizeBtn.addEventListener('click', () => {
        catWidth *= 0.85;
        catHeight *= 0.85;
        drawCanvas();
    });

    function drawCanvas(isForDownload = false) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (backgroundImg.src) {
            ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(catImg, catX, catY, catWidth, catHeight);

        if (!isForDownload) {
            drawResizeHandle(catX, catY);
            drawResizeHandle(catX + catWidth, catY);
            drawResizeHandle(catX, catY + catHeight);
            drawResizeHandle(catX + catWidth, catY + catHeight);
        }
    }

    function drawResizeHandle(x, y) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(x - resizeHandleRadius / 2, y - resizeHandleRadius / 2, resizeHandleRadius, resizeHandleRadius);
    }

    function isOverCat(x, y) {
        return x > catX && x < catX + catWidth && y > catY && y < catY + catHeight;
    }

    function isOverResizeHandle(x, y) {
        if (
            x > catX - resizeHandleRadius / 2 && x < catX + resizeHandleRadius / 2 &&
            y > catY - resizeHandleRadius / 2 && y < catY + resizeHandleRadius / 2
        ) {
            return 0;
        } else if (
            x > catX + catWidth - resizeHandleRadius / 2 && x < catX + catWidth + resizeHandleRadius / 2 &&
            y > catY - resizeHandleRadius / 2 && y < catY + resizeHandleRadius / 2
        ) {
            return 1;
        } else if (
            x > catX - resizeHandleRadius / 2 && x < catX + resizeHandleRadius / 2 &&
            y > catY + catHeight - resizeHandleRadius / 2 && y < catY + catHeight + resizeHandleRadius / 2
        ) {
            return 2;
        } else if (
            x > catX + catWidth - resizeHandleRadius / 2 && x < catX + catWidth + resizeHandleRadius / 2 &&
            y > catY + catHeight - resizeHandleRadius / 2 && y < catY + catHeight + resizeHandleRadius / 2
        ) {
            return 3;
        }
        return -1;
    }

    function downloadMeme() {
        drawCanvas(true);

        const downloadCanvas = document.createElement('canvas');
        const downloadCtx = downloadCanvas.getContext('2d');
        downloadCanvas.width = canvas.width;
        downloadCanvas.height = canvas.height;

        if (backgroundImg.src) {
            downloadCtx.drawImage(backgroundImg, 0, 0, downloadCanvas.width, downloadCanvas.height);
        }

        downloadCtx.drawImage(catImg, catX, catY, catWidth, catHeight);

        const downloadLink = document.createElement('a');
        downloadLink.href = downloadCanvas.toDataURL('image/png');
        downloadLink.download = 'meme.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        drawCanvas(); // Redraw canvas with resize handles after download
    }

    downloadBtn.removeEventListener('click', downloadMeme);
    downloadBtn.addEventListener('click', downloadMeme);
};
