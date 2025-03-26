const video = document.getElementById("vd-foto");
const btn_video = document.getElementById("btn-foto");
const btn_video2 = document.getElementById("btn-foto2");
const btn_parar = document.getElementById("parar-foto");

let cv_foto = [];

// Pegando os elementos canvas corretamente (cv-foto1 até cv-foto8)
for (let i = 1; i <= 8; i++) {
    let canvas = document.getElementById("cv-foto" + i);
    if (canvas) {
        cv_foto.push(canvas);
        canvas.dataset.filtro = "grayscale(0)"; // Define um valor padrão
    }
}

let stream;

async function startcamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
        await video.play();
    } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
    }
}

// Função para aplicar escala de cinza diretamente no Canvas
function aplicarEscalaCinza(contexto, width, height) {
    let imageData = contexto.getImageData(0, 0, width, height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let media = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = media;
    }

    contexto.putImageData(imageData, 0, 0);
}

// Função para capturar imagem no cv-foto1 e mover as anteriores
function capturarImagem(filtro = "grayscale(0)") {
    if (cv_foto.length === 0) return;

    // Move todas as imagens para frente
    for (let i = cv_foto.length - 1; i > 0; i--) {
        let canvasAtual = cv_foto[i];
        let canvasAnterior = cv_foto[i - 1];

        let contextoAtual = canvasAtual.getContext("2d");
        let contextoAnterior = canvasAnterior.getContext("2d");

        // Copiar o conteúdo do canvas anterior
        canvasAtual.width = canvasAnterior.width;
        canvasAtual.height = canvasAnterior.height;

        contextoAtual.clearRect(0, 0, canvasAtual.width, canvasAtual.height);
        contextoAtual.drawImage(canvasAnterior, 0, 0, canvasAtual.width, canvasAtual.height);

        // Manter o filtro correto
        canvasAtual.dataset.filtro = canvasAnterior.dataset.filtro;
        if (canvasAtual.dataset.filtro === "grayscale(100%)") {
            aplicarEscalaCinza(contextoAtual, canvasAtual.width, canvasAtual.height);
        }

        canvasAtual.style.display = "block";
    }

    // Capturar nova imagem no cv-foto1
    const canvasNovo = cv_foto[0];
    const contextoNovo = canvasNovo.getContext("2d");

    canvasNovo.width = video.videoWidth;
    canvasNovo.height = video.videoHeight;

    contextoNovo.drawImage(video, 0, 0, canvasNovo.width, canvasNovo.height);
    canvasNovo.style.display = "block";
    canvasNovo.dataset.filtro = filtro; // Armazena o tipo de filtro aplicado

    // Se o filtro for escala de cinza, aplica a transformação nos pixels
    if (filtro === "grayscale(100%)") {
        aplicarEscalaCinza(contextoNovo, canvasNovo.width, canvasNovo.height);
    }

    // Faz a última imagem desaparecer quando chega ao limite
    let canvasUltimo = cv_foto[cv_foto.length - 1];
    let contextoUltimo = canvasUltimo.getContext("2d");
    contextoUltimo.clearRect(0, 0, canvasUltimo.width, canvasUltimo.height);
    canvasUltimo.dataset.filtro = "grayscale(0)"; // Reseta filtro do último canvas
}

// Capturar imagem normal (colorida)
btn_video.addEventListener("click", function () {
    capturarImagem("grayscale(0)");
});

// Capturar imagem em preto e branco
btn_video2.addEventListener("click", function () {
    capturarImagem("grayscale(100%)");
});

// Parar a câmera
btn_parar.addEventListener("click", function () {
    stopcamera();
});

// Função para parar a câmera corretamente
async function stopcamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    } else {
        window.location.reload();
    }
}

startcamera();
