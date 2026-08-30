/* =========================================================
   ELEMENTOS
========================================================= */

const heartButton =
    document.getElementById("heartButton");

const percentage =
    document.getElementById("percentage");

const progress =
    document.getElementById("progress");

const contenido =
    document.getElementById("contenido");

const saveButton =
    document.getElementById("saveButton");


/* =========================================================
   VARIABLES CORAZÓN
========================================================= */

let valor = 0;
let desbloqueado = false;


/* =========================================================
   AUDIO - WEB AUDIO API
========================================================= */

let audioContext = null;
let audioBuffer = null;
let audioCargando = false;
let audioPreparado = false;
let fuenteAudio = null;


/* =========================================================
   PREPARAR AUDIO PARA IPHONE
========================================================= */

async function prepararAudio() {

    if (audioPreparado || audioCargando) {
        return;
    }

    audioCargando = true;

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        /* Crear contexto */

        if (!audioContext) {

            audioContext =
                new AudioContext();

        }


        /* IMPORTANTE PARA IPHONE */

        if (audioContext.state === "suspended") {

            await audioContext.resume();

        }


        console.log(
            "AudioContext:",
            audioContext.state
        );


        /* Descargar canción */

        const respuesta =
            await fetch(
                "static/songs/cancion2.m4a"
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo cargar la canción"
            );

        }


        const arrayBuffer =
            await respuesta.arrayBuffer();


        /* Decodificar canción */

        audioBuffer =
            await audioContext.decodeAudioData(
                arrayBuffer
            );


        audioPreparado = true;


        console.log(
            "Canción preparada correctamente"
        );


    } catch (error) {

        console.error(
            "ERROR preparando audio:",
            error
        );

    }

    audioCargando = false;

}


/* =========================================================
   REPRODUCIR CANCIÓN
========================================================= */

async function reproducirCancion() {

    try {

        if (!audioContext) {

            console.log(
                "No existe AudioContext"
            );

            return;

        }


        if (audioContext.state === "suspended") {

            await audioContext.resume();

        }


        /* Si todavía está cargando */

        if (!audioBuffer) {

            console.log(
                "Esperando a que cargue la canción..."
            );


            let intentos = 0;


            while (
                !audioBuffer &&
                intentos < 100
            ) {

                await new Promise(
                    function (resolve) {

                        setTimeout(
                            resolve,
                            100
                        );

                    }
                );


                intentos++;

            }

        }


        if (!audioBuffer) {

            console.log(
                "No se pudo cargar la canción"
            );

            return;

        }


        /* Parar canción anterior */

        if (fuenteAudio) {

            try {

                fuenteAudio.stop();

            } catch (error) {

                console.log(error);

            }

        }


        /* Crear fuente */

        fuenteAudio =
            audioContext.createBufferSource();


        fuenteAudio.buffer =
            audioBuffer;


        /* Repetir canción */

        fuenteAudio.loop =
            true;


        /* Control de volumen */

        const gainNode =
            audioContext.createGain();


        gainNode.gain.value =
            0.8;


        fuenteAudio.connect(
            gainNode
        );


        gainNode.connect(
            audioContext.destination
        );


        /* EMPEZAR */

        fuenteAudio.start(0);


        console.log(
            "🎵 CANCIÓN REPRODUCIÉNDOSE"
        );


    } catch (error) {

        console.error(
            "ERROR reproduciendo canción:",
            error
        );

    }

}


/* =========================================================
   CORAZÓN
========================================================= */

heartButton.addEventListener(
    "click",
    async function () {


        /* =================================================
           PRIMER TOQUE:
           DESBLOQUEAR AUDIO EN IPHONE
        ================================================= */

        if (!audioContext) {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;


            audioContext =
                new AudioContext();


            try {

                await audioContext.resume();


                console.log(
                    "Audio desbloqueado:",
                    audioContext.state
                );


            } catch (error) {

                console.error(
                    "Error desbloqueando audio:",
                    error
                );

            }


            /* Cargar canción */

            prepararAudio();

        }


        /* =================================================
           CORAZÓN
        ================================================= */

        if (desbloqueado) {
            return;
        }


        valor += 10;


        if (valor > 100) {

            valor = 100;

        }


        percentage.textContent =
            valor + "%";


        progress.style.width =
            valor + "%";


        /* =================================================
           ANIMACIÓN
        ================================================= */

        heartButton
            .classList
            .remove("latido");


        void heartButton.offsetWidth;


        heartButton
            .classList
            .add("latido");


        /* =================================================
           VIBRACIÓN
        ================================================= */

        if (navigator.vibrate) {

            navigator.vibrate(30);

        }


        /* =================================================
           100 %
        ================================================= */

        if (valor === 100) {

            desbloqueado = true;


            console.log(
                "100% alcanzado"
            );


            /* REPRODUCIR MÚSICA */

            reproducirCancion();


            /* ABRIR REGALO */

            setTimeout(
                abrirRegalo,
                700
            );

        }

    }
);


/* =========================================================
   ABRIR REGALO
========================================================= */

function abrirRegalo() {

    contenido
        .classList
        .remove(
            "bloqueado"
        );


    contenido
        .classList
        .add(
            "desbloqueado"
        );


    setTimeout(
        function () {

            contenido.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        300
    );

}


/* =========================================================
   GUARDAR MOMENTO
========================================================= */

if (saveButton) {

    saveButton.addEventListener(
        "click",
        async function () {

            const pagina =
                document.getElementById(
                    "pagina"
                );


            saveButton.style.display =
                "none";


            try {

                const canvas =
                    await html2canvas(
                        pagina,
                        {
                            scale: 1.5,
                            useCORS: true,
                            allowTaint: false,
                            backgroundColor:
                                "#f7eee6",
                            logging: false
                        }
                    );


                const imagen =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.92
                    );


                mostrarImagenParaGuardar(
                    imagen
                );


            } catch (error) {

                console.error(
                    "Error generando imagen:",
                    error
                );


                alert(
                    "No se ha podido generar la imagen."
                );

            }


            saveButton.style.display =
                "inline-block";

        }
    );

}


/* =========================================================
   MOSTRAR IMAGEN
========================================================= */

function mostrarImagenParaGuardar(src) {

    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "guardar-overlay";


    overlay.innerHTML = `

        <div class="guardar-contenido">

            <button
                id="cerrar-guardar"
                class="cerrar-guardar"
                type="button">
                ×
            </button>

            <h2>
                Tu recuerdo está listo ❤️
            </h2>

            <p>
                En iPhone mantén pulsada
                la imagen y selecciona
                <strong>
                    Guardar en Fotos
                </strong>.
            </p>

            <img
                src="${src}"
                id="imagen-generada"
                alt="Nuestro momento"
            >

            <a
                href="${src}"
                download="nuestro-momento.jpg"
                class="boton-descargar">

                Descargar imagen

            </a>

        </div>
    `;


    document.body.appendChild(
        overlay
    );


    document
        .getElementById(
            "cerrar-guardar"
        )
        .addEventListener(
            "click",
            function () {

                overlay.remove();

            }
        );

}