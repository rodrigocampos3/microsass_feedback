(function () {
    // Variáveis para rastrear o estado do desenho
    let startX, startY, isDrawing = false;
    let selectionBox;
    let overlay; 

    const createFeedbackButton = () => {
        const button = document.createElement('button');
        button.innerText = 'Enviar Feedback';
        button.style.position = 'fixed';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.zIndex = '1000';
        document.body.appendChild(button);
        return button;
    };

    const createOverlay = () => {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '999';
        overlay.style.cursor = 'crosshair';
        overlay.style.background = 'rgba(0, 0, 0, 0.2)';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
        return overlay;
    };

    const createSelectionBox = () => {
        const box = document.createElement('div');
        box.style.position = 'absolute';
        box.style.border = '2px dashed #000';
        box.style.background = 'rgba(0, 0, 0, 0.1)';
        box.style.pointerEvents = 'none';
        document.body.appendChild(box);
        return box;
    };

    const createFormModal = () => {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.zIndex = '1001';
        modal.style.padding = '20px';
        modal.style.backgroundColor = '#fff';
        modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        modal.style.display = 'none';

        const descriptionLabel = document.createElement('label');
        descriptionLabel.innerText = 'Descrição do problema:';
        const descriptionInput = document.createElement('textarea');
        descriptionInput.style.width = '100%';
        descriptionInput.style.marginTop = '10px';
        descriptionInput.style.border = '2px solid blue';


        const image = document.createElement('img');
        image.style.maxWidth = '100%';
        image.style.maxHeight = '200px';
        image.style.marginTop = '10px';

        const captureButton = document.createElement('button');
        captureButton.innerText = 'Capturar Tela';
        captureButton.style.marginTop = '10px';

        const submitButton = document.createElement('button');
        submitButton.innerText = 'Enviar';
        submitButton.style.marginLeft = '10px';
        submitButton.style.border = '2px solid blue'; 


        const closeButton = document.createElement('button');
        closeButton.innerText = 'Fechar';
        closeButton.style.marginLeft = '10px';
        closeButton.style.border = '2px solid blue'; 


      

        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        captureButton.addEventListener('click', () => {
            console.log('Iniciando captura de tela');
            modal.style.display = 'none';
            overlay.style.display = 'block';
        });

        submitButton.addEventListener('click', () => {
            const description = descriptionInput.value;
            const screenshot = image.src;
        
            if (!description || !screenshot) {
                alert('Por favor, preencha a descrição e capture uma tela antes de enviar.');
                return;
            }
        
            fetch('https://rodrigowebteste.app.n8n.cloud/webhook-test/a261af5c-d76f-4ede-98f9-ff1584b8fc42', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: description,
                    screenshot: screenshot
                })
            })
                .then(response => {
                    if (response.ok) {
                        alert('Feedback enviado com sucesso!');
                        modal.style.display = 'none';
                        descriptionInput.value = '';
                        image.src = '';
                    } else {
                        alert('Erro ao enviar feedback. Por favor, tente novamente.');
                    }
                })
                .catch(error => {
                    console.error('Erro ao enviar feedback:', error);
                    alert('Erro ao enviar feedback. Por favor, verifique sua conexão.');
                });
        });
        

        modal.appendChild(descriptionLabel);
        modal.appendChild(descriptionInput);
        modal.appendChild(document.createElement('br'));
        modal.appendChild(image);
        modal.appendChild(captureButton);
        modal.appendChild(submitButton);
        modal.appendChild(closeButton);
        

        document.body.appendChild(modal);

        return { modal, image, descriptionInput };
    };

    const captureSelectedArea = (box, modalElements) => {
        const rect = box.getBoundingClientRect(); 
        console.log('Coordenadas da área selecionada:', rect); 

        html2canvas(document.body, {
            backgroundColor: null,
            useCORS: true
        }).then((canvas) => {
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = rect.width;
            croppedCanvas.height = rect.height;

            const ctx = croppedCanvas.getContext('2d');
            ctx.drawImage(
                canvas,
                rect.left, rect.top, rect.width, rect.height, 
                0, 0, rect.width, rect.height              
            );

            const dataURL = croppedCanvas.toDataURL('image/png');
            modalElements.image.src = dataURL;
            modalElements.modal.style.display = 'block';
        }).catch((err) => {
            console.error('Erro ao capturar a área selecionada:', err);
        });
    };

    const init = () => {
        const feedbackButton = createFeedbackButton();
        overlay = createOverlay(); 
        selectionBox = createSelectionBox();
        const modalElements = createFormModal();

        feedbackButton.addEventListener('click', () => {
            console.log('Botão de feedback clicado'); 
            modalElements.modal.style.display = 'block';
        });

      
        overlay.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
            isDrawing = true;
            selectionBox.style.left = `${startX}px`;
            selectionBox.style.top = `${startY}px`;
            selectionBox.style.width = '0px';
            selectionBox.style.height = '0px';
            selectionBox.style.display = 'block';
        });

        overlay.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const currentX = e.clientX;
            const currentY = e.clientY;

            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            selectionBox.style.width = `${width}px`;
            selectionBox.style.height = `${height}px`;
            selectionBox.style.left = `${Math.min(currentX, startX)}px`;
            selectionBox.style.top = `${Math.min(currentY, startX)}px`;
        });

        overlay.addEventListener('mouseup', () => {
            isDrawing = false;
            overlay.style.display = 'none';

            captureSelectedArea(selectionBox, modalElements);

            selectionBox.style.display = 'none';
            selectionBox.style.width = '0px';
            selectionBox.style.height = '0px';
        });
    };

    const loadHtml2Canvas = () => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => {
            console.log('html2canvas carregado com sucesso'); 
            init();
        };
        script.onerror = () => {
            console.error('Falha ao carregar html2canvas');
        };
        document.head.appendChild(script);
    };

    loadHtml2Canvas();
})();
